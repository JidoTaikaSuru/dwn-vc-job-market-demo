// Get a user, and decrypt their private key
import {ethers, Wallet} from "ethers";
import {
  arrayBufferToBase64,
  convertStringToCryptoKey,
  decryptPrivateKeyGetWallet,
  encryptData,
  uint8ArrayToBase64,
} from "@/lib/cryptoLib";
import {supabaseClient} from "@/lib/common";

export const getUserEmbeddedWallet = async (
  pin?: string,
  deviceKey?: string,
): Promise<Wallet> => {
  console.log("pin", pin, deviceKey);

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    throw new Error("User does not appear to be signed in");
  }

  const { data: userRow } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!userRow) {
    throw new Error("No user found");
  }
  console.log("logged in user:", userRow);
  //Basic validation
  const { password_encrypted_private_key, iv } = userRow;
  // if (!password_encrypted_private_key && !device_encrypted_private_key) {
  if (!password_encrypted_private_key || !iv) {
    throw new Error("user has no embedded wallet");
  }

  if (pin && password_encrypted_private_key) {
    console.log(
      "pin set, decrypting pin encrypted private key",
      password_encrypted_private_key,
    );
    return await decryptPrivateKeyGetWallet(
      password_encrypted_private_key,
      pin,
      iv,
    );
  }

  throw new Error(
    `user has not submitted a valid combination of pin and pin_encrypted_private_key or devicePrivateKey and device_encrypted_private_key, ${{
      pin: pin,
      deviceKey,
      password_encrypted_private_key,
      device_encrypted_private_key: undefined,
    }}`,
  );
};

export const createNewEmbeddedWalletForUser = async (
  pin: string,
  deviceKey?: string,
) => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!session?.user) {
    console.log(
      "Attempt to create new embedded wallet without having a session",
    );
    throw new Error(
      "Attempt to create new embedded wallet without having a session",
    );
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivStr = uint8ArrayToBase64(iv);
  const newEmbeddedWallet = ethers.Wallet.createRandom();

  console.log("Creating new embedded wallet for user", session.user.id);

  let updatePinEncryptedKey = "";
  let updateDeviceEncryptedKey = "";
  if (pin) {
    const pinCryptoKey = await convertStringToCryptoKey(pin);
    const pinEncryptedPrivateKey = await encryptData(
      newEmbeddedWallet.privateKey,
      pinCryptoKey,
      iv,
    );
    updatePinEncryptedKey = arrayBufferToBase64(pinEncryptedPrivateKey);
  }
  if (deviceKey) {
    const deviceCryptoKey = await convertStringToCryptoKey(deviceKey);
    const deviceEncryptedPrivateKey = await encryptData(
      newEmbeddedWallet.privateKey,
      deviceCryptoKey,
      iv,
    );
    updateDeviceEncryptedKey = arrayBufferToBase64(deviceEncryptedPrivateKey);
  }

  console.log(
    "Updating user with pinEncryptedKey",
    updatePinEncryptedKey,
    "and deviceEncryptedKey",
    updateDeviceEncryptedKey,
  );
  await supabaseClient.from("users").upsert({
    id: session.user.id,
    public_key: newEmbeddedWallet.address,
    password_encrypted_private_key: updatePinEncryptedKey,
    iv: ivStr,
  });
  console.log("Finished updating user");
};

export const truncateAddress = (address: string) => {
  if (address && address.length <= 6) return address; // No need to truncate if the address is too short

  const prefix = address.slice(0, 4); // Typically "0x"
  const suffix = address.slice(-4); // The last 4 characters

  return `${prefix}...${suffix}`;
};