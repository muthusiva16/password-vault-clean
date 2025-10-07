// Client-side encryption helpers (Web Crypto)
export async function deriveKeyFromPassword(password: string, saltBase64: string) {
  const enc = new TextEncoder();
  const salt = base64ToBytes(saltBase64);
  const pwKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 200000,
      hash: "SHA-256",
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}

export async function encryptData(key: CryptoKey, data: object) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const plain = enc.encode(JSON.stringify(data));
  const cipher = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(cipher)),
  };
}

export async function decryptData(key: CryptoKey, payload: { iv: string; data: string }) {
  const iv = base64ToBytes(payload.iv);
  const cipher = base64ToBytes(payload.data);
  const plain = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plain));
}

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
function bytesToBase64(arr: Uint8Array) {
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}
