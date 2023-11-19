const fixedIv = new Uint8Array([
  40, 133, 229, 32, 33, 3, 159, 207, 108, 91, 200, 205,
]);

export const encryptData = async (
  secretData: string,
  key: CryptoKey
): Promise<{ iv: Uint8Array; encryptedData: ArrayBuffer }> => {
  const encodedData = new TextEncoder().encode(secretData);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      // iv: fixedIv,
      iv,
    },
    key,
    encodedData
  );
  return { iv, encryptedData };
};

export const decryptData = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> => {
  try {
    console.log("decryptData", encryptedData, key, iv)
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const isEmpty = (obj: Object): boolean =>  {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}


export const convertStringToCryptoKey = async (str: string) => {
  console.log("convertStringToCryptoKey", str);
  const encoded = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  console.log("encoded", encoded);
  console.log("hash", hash);

  const key = await crypto.subtle.importKey(
    "raw", // format
    hash, // key data
    { name: "AES-GCM" }, // algorithm
    false, // not extractable
    ["encrypt", "decrypt"] // usage
  );
  console.log("key", key);
  return key;
};

export const messagePubKeyToParent = (message: any) => {
  console.log("messagePubKeyToParent", message);
};



export const uint8ArrayToBase64 = (a: Uint8Array) => {
  let binaryString = '';
  for (let i = 0; i < a.length; i++) {
    binaryString += String.fromCharCode(a[i]);
  }
  return btoa(binaryString);
}
export const arrayBufferToBase64 = (a: ArrayBuffer) => {
    return uint8ArrayToBase64(new Uint8Array(a));
}

export const base64ToUint8Array = (b64: string) => {
    const binaryString = atob(b64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
export const base64ToArrayBuffer = (b64: string) => {
    return base64ToUint8Array(b64).buffer;
}