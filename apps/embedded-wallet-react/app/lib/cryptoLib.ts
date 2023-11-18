export const encryptData = async (
  secretData: string,
  key: CryptoKey
): Promise<ArrayBuffer> => {
  const encodedData = new TextEncoder().encode(secretData);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // random initialization vector

  try {
    return await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedData
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const decryptData = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> => {
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
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
