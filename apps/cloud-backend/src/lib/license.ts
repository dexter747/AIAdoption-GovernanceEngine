import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function generateLicenseKey(payload: {
  user_id: string;
  license_id: string;
  plan_type: string;
}) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1y')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyLicenseKey(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('License verification failed:', error);
    return null;
  }
}
