import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import { createSession, type SessionData } from './session'

interface NetSuiteEmployee {
  empid: string
  name: string
  pawsUsername: string
  pawsPassword: string
}

interface NetSuiteResponse {
  employees: NetSuiteEmployee[]
}

const RESTLET_URL = 'https://7913744.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=2276&deploy=1'

// Create OAuth 1.0a instance
function createOAuth(): OAuth {
  return new OAuth({
    consumer: {
      key: process.env.NETSUITE_CONSUMER_KEY!,
      secret: process.env.NETSUITE_CONSUMER_SECRET!,
    },
    signature_method: 'HMAC-SHA256',
    hash_function(base_string: string, key: string) {
      return crypto
        .createHmac('sha256', key)
        .update(base_string)
        .digest('base64')
    },
  })
}

// Generate OAuth Authorization header with realm first
function getAuthHeader(url: string, method: string): string {
  const oauth = createOAuth()
  const token = {
    key: process.env.NETSUITE_TOKEN_ID!,
    secret: process.env.NETSUITE_TOKEN_SECRET!,
  }

  const requestData = {
    url,
    method,
  }

  const authData = oauth.authorize(requestData, token)
  const params = oauth.toHeader(authData)
  
  // Insert realm as the first parameter after "OAuth "
  const realm = process.env.NETSUITE_REALM || '7913744'
  return params.Authorization.replace(
    'OAuth ',
    `OAuth realm="${realm}", `
  )
}

// Fetch all employees from NetSuite
async function fetchEmployees(): Promise<NetSuiteEmployee[]> {
  const authHeader = getAuthHeader(RESTLET_URL, 'GET')

  const response = await fetch(RESTLET_URL, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    console.error('NetSuite API error:', response.status, response.statusText)
    throw new Error('Failed to connect to NetSuite')
  }

  const data: NetSuiteResponse = await response.json()
  
  if (!data.employees || !Array.isArray(data.employees)) {
    console.error('Invalid NetSuite response:', data)
    throw new Error('Invalid response from NetSuite')
  }

  return data.employees
}

// Authenticate user against NetSuite employee list
export async function authenticateUser(
  username: string,
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const employees = await fetchEmployees()

    // Find employee by username (case-insensitive)
    const employee = employees.find(
      (emp) => emp.pawsUsername?.toLowerCase() === username.toLowerCase()
    )

    if (!employee) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Compare password (plaintext comparison as per spec)
    if (employee.pawsPassword !== password) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Create session
    const sessionData: SessionData = {
      userId: employee.empid,
      username: employee.pawsUsername,
      fullName: employee.name,
    }

    await createSession(sessionData)

    return { success: true }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication service unavailable' }
  }
}
