import type { FC } from "react";
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { createClient } from "@supabase/supabase-js";
import { decryptData } from "~/lib/cryptoLib";
import ethers from "ethers";

const iv = crypto.getRandomValues(new Uint8Array(12)); // random initialization vector
console.log("IV, whatever, make this constant", iv);

export const InternalEmbeddedWalletDemo: FC = () => {
  let wallet;
  const client = createClient(
    "https://api.gotid.org",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0"
  );
  const [loginEncryptionKeyPin, setLoginEncryptionKeyPin] = useState("");
  const [devicePrivateKey, setDevicePrivateKey] = useState("");
  const [devicePublicKey, setDevicePublicKey] = useState("");
  const [walletPrivKey, setWalletPrivKey] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(); //TODO fix any
  // let signupdata;
  // let logedinuser;

  if (localStorage.getItem("deviceprivatekey")) {
    console.log("device key found in local storage");
    const localStorageDevicePrivKey = localStorage.getItem("deviceprivatekey");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const localStorageDevicePubKey = localStorage.getItem("devicepublickey");
    setDevicePrivateKey(localStorageDevicePrivKey || "");
    setDevicePublicKey(localStorageDevicePubKey || "");
  } else {
    console.log("no device key found in local storage");
  }

  if (devicePrivateKey) {
    checkLoginStatus();
  }

  let currentDomain = "http://" + window.location.host;
  console.log("iframe.html window.location.host=" + window.location.host);

  async function checkLoginStatus() {
    console.log("checkLoginStatus()");
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user && user.user_metadata) {
      console.log("loggedin user:", user);
      console.log("user.user_metadata:" + JSON.stringify(user.user_metadata));
      if (
        !devicePrivateKey &&
        loginEncryptionKeyPin &&
        user.user_metadata.pin_encrypted_private_key
      ) {
        const walletPrivKeyDecryptRes = await decryptData(
          user.user_metadata.pin_encrypted_private_key,
          loginEncryptionKeyPin,
          iv
        );
        setWalletPrivKey(walletPrivKeyDecryptRes);
        console.log("pin decrypted private key from db :" + walletPrivKey);
      } else if (devicePrivateKey) {
        const walletPrivKeyDecryptRes = await decryptData(
          user.user_metadata.device_encrypted_private_key,
          devicePrivateKey,
          iv
        );
        setWalletPrivKey(walletPrivKeyDecryptRes);
        console.log(
          "device key decrypted private key from db :" + walletPrivKey
        );
      } else {
        console.log("no device key found please login with including pin");
      }
      if (walletPrivKey) {
        wallet = new ethers.Wallet(walletPrivKey);
        messagePubKeyToParent();
      }
    }

    console.log(
      "checkLoginStatus() device private key " + devicePrivateKey || "no key"
    );
    if (user) {
      console.log("logged in decrypted private key " + walletPrivKey);
      setIsSignedIn(true);
      setLoggedInUser(user);
    }
  }

  messagePubKeyToParent = () => {
    if (wallet && wallet.address)
      parent.postMessage(
        JSON.stringify({
          messageType: "giveParentPubkey",
          message: wallet.address,
        }),
        currentDomain
      );
  };

  createAccountSendPub = () => {
    wallet = ethers.Wallet.createRandom();
    document.getElementById("pubkeyDisplay").innerHTML = wallet.address;
    console.log("Finished loading iframe", wallet);
    messagePubKeyToParent();
  };

  const emailotp = document.getElementById("emailotp");

  const loginform = document.getElementById("loginform");
  if (devicePrivateKey) {
    loginform.style.display = "block";
    signupform.style.display = "none";
  }
  loginform.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();
      const { data, error } = await client.auth.signInWithOtp({
        //This also signs up users if they have not yet created an account.
        email: document.getElementById("login-email").value,
        shouldCreateUser: false,
        //password:document.getElementById('login-password').value,  //we will use the password for encrypting like the pin before
      });

      document.getElementById("check-email").style.display = "block";
      emailotp.style.display = "block";
      //const { data: { user } } = await client.auth.getUser()//Removed this b/c now we need to validate the OTP first.
      1 == 1;
      //await checkLoginStatus();
    },
    false
  );

  emailotp.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      try {
        const {
          data: { session },
          error,
        } = await client.auth.verifyOtp({
          email: document.getElementById("login-email").value,
          token: document.getElementById("emailotp-token").value,
          type: "email",
        });

        if (session) {
          console.log(" supabase.auth.verifyOtp() data=", session);

          await checkLoginStatus();
        }
        if (error) console.log(" supabase.auth.verifyOtp() error=", error);
      } catch (e) {
        console.log(" supabase.auth.verifyOtp() catch e=", e);
      }
    },
    false
  );

  const logoutform = document.querySelector("#logout");
  logoutform.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();
      try {
        const { error } = await client.auth.signOut(); //This logout is broken in Firefox for some reason,  even if i explicitly remove the localstorage token
        if (error) throw error;
        localStorage.removeItem("sb-api-auth-token");
      } catch (error) {
        console.error("signout error,", error.message);
      }

      //   await checkLoginStatus();
    },
    false
  );

  // Receive message from parent
  window.addEventListener("message", (event) => {
    if (event.origin !== currentDomain) {
      console.log("event.origin=" + event.origin);
      return;
    }
    console.log("Received message from parent", event.data);
    messageReceivedDisplay.innerHTML = event.data;
    wallet
      .signMessage(event.data)
      .then((signedMessage) => {
        signedMessageDisplay.innerHTML = signedMessage;
        console.log("Signed Message:", signedMessage);
        parent.postMessage(
          JSON.stringify({
            messageType: "signedMessage",
            message: signedMessage,
          }),
          currentDomain
        );
      })
      .catch((error) => {
        console.error("Error signing message:", error);
      });
    document.getElementById("iframeReceiveText").innerHTML = event.data;
  });
  return (
    <Box sx={{ backgroundColor: "white" }}>
      <Typography>Wallet</Typography>
    </Box>
  );
};
