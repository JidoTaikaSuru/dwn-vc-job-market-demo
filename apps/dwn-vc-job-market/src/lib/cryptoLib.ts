import { Wallet } from "ethers";

export const encryptData = async (
  secretData: string,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<ArrayBuffer> => {
  const encodedData = new TextEncoder().encode(secretData);

  return await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      // iv: fixedIv,
      iv,
    },
    key,
    encodedData,
  );
};

export const decryptData = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<string> => {
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedData,
    );
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const convertStringToCryptoKey = async (str: string) => {
  const encoded = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return await crypto.subtle.importKey(
    "raw", // format
    hash, // key data
    { name: "AES-GCM" }, // algorithm
    false, // not extractable
    ["encrypt", "decrypt"], // usage
  );
};

export const uint8ArrayToBase64 = (a: Uint8Array) => {
  let binaryString = "";
  for (let i = 0; i < a.length; i++) {
    binaryString += String.fromCharCode(a[i]);
  }
  return btoa(binaryString);
};
export const arrayBufferToBase64 = (a: ArrayBuffer) => {
  return uint8ArrayToBase64(new Uint8Array(a));
};

export const base64ToUint8Array = (b64: string) => {
  const binaryString = atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};
export const base64ToArrayBuffer = (b64: string) => {
  return base64ToUint8Array(b64).buffer;
};

export const decryptPrivateKeyGetWallet = async (
  encryptedSecret: string | ArrayBuffer,
  decryptionKey: string | CryptoKey,
  iv: string | Uint8Array,
): Promise<Wallet> => {
  console.debug(
    "decryptPrivateKeyGetWallet",
    encryptedSecret,
    decryptionKey,
    iv,
  );
  if (!encryptedSecret) {
    throw new Error("No pinEncryptedPrivateKey provided");
  }
  const privateKey = await decryptData(
    encryptedSecret instanceof ArrayBuffer
      ? encryptedSecret
      : base64ToArrayBuffer(encryptedSecret),
    decryptionKey instanceof CryptoKey
      ? decryptionKey
      : await convertStringToCryptoKey(decryptionKey),
    iv instanceof Uint8Array ? iv : base64ToUint8Array(iv),
  );
  return new Wallet(privateKey);
};
