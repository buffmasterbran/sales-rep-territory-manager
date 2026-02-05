import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

export interface SessionData {
  userId: string
  username: string
  fullName: string
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function encrypt(payload: SessionData): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey())
}

export async function decrypt(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload as unknown as SessionData
  } catch (error) {
    return null
  }
}

export async function createSession(data: SessionData): Promise<void> {
  const token = await encrypt(data)
  const cookieStore = cookies()
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }

  return decrypt(token)
}

export async function deleteSession(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
