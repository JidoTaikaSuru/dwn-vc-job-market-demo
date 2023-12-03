import type { FC, PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { convertStringToCryptoKey } from "~/lib/cryptoLib";
import { Button } from "@/components/ui/button";

/*
This function exists to test out the crypto lib functions without having to sign in
 */
export const CryptoLibSmokeTest: FC<PropsWithChildren> = ({ children }) => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  // const [pinPrivateKey, setPinPrivateKey] = useState<CryptoKey | undefined>(
  //   undefined,
  // );
  const [payloadToEncrypt, setPayloadToEncrypt] = useState("");
  const [startEncrypt, setStartEncrypt] = useState(false);
  const [payloadToDecrypt, setPayloadToDecrypt] = useState("");
  const [startDecrypt, setStartDecrypt] = useState(false);
  const [startToCryptoKey, setStartToCryptoKey] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (startEncrypt) {
          console.log("encrypting", payloadToEncrypt);
      } else if (startDecrypt) {
        console.log("decrypting", payloadToDecrypt);
      } else if (startToCryptoKey) {
        const cryptoKey = await convertStringToCryptoKey(pin);
        console.log("cryptoKey", cryptoKey);
      } else {
        console.log("Not sure what operation to do here");
      }
    };

    fetchData();
  }, [startDecrypt, startEncrypt, startToCryptoKey, pin, payloadToDecrypt, payloadToEncrypt]);

  return (
    <div>
      <input
        // label="Email (test)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        // label="PIN (test)"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      <input
        aria-label="Payload to Encrypt"
        // minRows={3}
        placeholder="Payload to Encrypt"
        value={payloadToEncrypt}
        onChange={(e) => setPayloadToEncrypt(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <input
        aria-label="Payload to Decrypt"
        // minRows={3}
        placeholder="Payload to Decrypt"
        value={payloadToDecrypt}
        onChange={(e) => setPayloadToDecrypt(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <Button onClick={() => setStartEncrypt(true)}>Start Encrypt</Button>
      <Button onClick={() => setStartDecrypt(true)}>Start Decrypt</Button>
      <Button onClick={() => setStartToCryptoKey(true)}>
        Start ToCryptoKey
      </Button>
    </div>
  );
};
