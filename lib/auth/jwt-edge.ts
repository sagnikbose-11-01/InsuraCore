import { UserRole } from '@/lib/constants/enums';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function verifyTokenEdge(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    // Import the secret key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Reconstruct verified text
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);

    // Convert signature from base64url to binary
    const base64Sig = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64Sig.length % 4)) % 4;
    const paddedSig = base64Sig + '='.repeat(padLen);
    
    // Decode base64 signature to Uint8Array
    const binarySigString = atob(paddedSig);
    const signatureBin = new Uint8Array(binarySigString.length);
    for (let i = 0; i < binarySigString.length; i++) {
      signatureBin[i] = binarySigString.charCodeAt(i);
    }

    // Verify signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBin,
      dataToVerify
    );

    if (!isValid) return null;

    // Decode and parse payload
    const base64Payload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padPayloadLen = (4 - (base64Payload.length % 4)) % 4;
    const paddedPayload = base64Payload + '='.repeat(padPayloadLen);
    const decoded = atob(paddedPayload);
    
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}
