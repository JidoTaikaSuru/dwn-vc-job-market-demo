// Listen for changes to localStorage, and update state accordingly
import { convertStringToCryptoKey } from "../../apps/embedded-wallet-react-remix/app/lib/cryptoLib";
import { useEffect } from "react";

useEffect(() => {
  const handleStorageChange = async (event: StorageEvent) => {
    console.log("storage event", event);
    if (event.key === "deviceprivatekey") {
      const strPrivateKey = localStorage.getItem("deviceprivatekey");
      if (strPrivateKey) {
        console.log(
          "deviceprivatekey found in localstorage after change",
          strPrivateKey,
        ); //TODO, don't log me later
        const cryptoPrivateKey = await convertStringToCryptoKey(strPrivateKey);
        setDevicePrivateKey(cryptoPrivateKey);
        setDevicePrivateKeyStr(strPrivateKey);
        setWallet(new Wallet(strPrivateKey));
      } else {
        console.log("deviceprivatekey not found in localstorage after change");
      }
    } else if (event.key === "devicepublickey") {
      const strPublicKey = localStorage.getItem("deviceprivatekey");
      if (strPublicKey) {
        console.log(
          "devicepublickey found in localstorage after change",
          strPublicKey,
        ); //TODO, don't log me later
        setDevicePublicKey(strPublicKey);
      } else {
        console.log("devicepublickey not found in localstorage after change");
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);
