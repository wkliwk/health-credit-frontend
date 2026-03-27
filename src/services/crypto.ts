const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptFile(
  file: File,
  password: string,
): Promise<{ encrypted: ArrayBuffer; salt: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const fileData = await file.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv } as any, key, fileData);

  return {
    encrypted,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
  };
}

export async function decryptFile(
  encryptedData: ArrayBuffer,
  password: string,
  saltB64: string,
  ivB64: string,
): Promise<ArrayBuffer> {
  const salt = base64ToBuffer(saltB64);
  const iv = base64ToBuffer(ivB64);
  const key = await deriveKey(password, salt);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return crypto.subtle.decrypt({ name: ALGORITHM, iv } as any, key, encryptedData);
}

function bufferToBase64(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
