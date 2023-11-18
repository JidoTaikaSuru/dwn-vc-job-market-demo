import type { FC } from "react";
import ethers from "ethers";
import { wallet } from "../../../../embeddemo/embedded_wallet";
import { encryptData } from "~/lib/cryptoLib";

export const InternalEmbeddedWalletSignInForm: FC = () => {
  const signupform = document.querySelector("#signup");
  signupform.addEventListener(
    "submit",
    async function (event) {
      // don't reload the page!
      event.preventDefault();

      if (!devicePrivateKey) {
        const devicewallet = ethers.Wallet.createRandom();
        localStorage.setItem("devicepublickey", devicewallet.address);
        localStorage.setItem("deviceprivatekey", devicewallet.privateKey);
        device_pubkey = localStorage.getItem("devicepublickey");
        devicePrivateKey = localStorage.getItem("deviceprivatekey");

        console.log(
          "No device key found on signu[] createing a new one " +
            devicewallet.privateKey
        );
      }

      wallet = ethers.Wallet.createRandom();
      console.log("address:", wallet.address);
      console.log("mnemonic:", wallet.mnemonic.phrase);
      console.log("privateKey:", wallet.privateKey);

      private_key = wallet.privateKey;

      let pin_encrypted_private_key = encryptData(
        wallet.privateKey,
        document.getElementById("signup-key-encryption-pin").value
      ).toString();
      let device_encrypted_private_key = CryptoJS.AES.encrypt(
        wallet.privateKey,
        devicePrivateKey
      ).toString();

      try {
        const { data, error } = await client.auth.signUp({
          email: document.getElementById("signup-email").value,
          password: "WorkAroundForPasswordlessLogin" + Math.random(),
          options: {
            data: {
              pubkey: wallet.address,
              pin_encrypted_private_key: pin_encrypted_private_key,
              device_encrypted_private_key: device_encrypted_private_key,
            },
          },
        });

        if (data) {
          console.log("signUp data:", data);
          messagePubKeyToParent();
        }
        if (error) console.log("signUp error:", error);

        await checkLoginStatus();
      } catch (e) {
        console.log("singup catch error e:", e);
      }
    },
    false
  );

  return <div></div>;
};
