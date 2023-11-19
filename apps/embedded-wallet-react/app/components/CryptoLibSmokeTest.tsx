import type {FC, PropsWithChildren} from "react";
import {useEffect, useState} from "react";
import {Button, TextareaAutosize, TextField} from "@mui/material";
import {convertStringToCryptoKey} from "~/lib/cryptoLib";

/*
This function exists to test out the crypto lib functions without having to sign in
 */
export const CryptoLibSmokeTest: FC<PropsWithChildren> = ({ children }) => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [pinPrivateKey, setPinPrivateKey] = useState<CryptoKey | undefined>(
    undefined
  );
  const [payloadToEncrypt, setPayloadToEncrypt] = useState("");
  const [startEncrypt, setStartEncrypt] = useState(false);
  const [payloadToDecrypt, setPayloadToDecrypt] = useState("");
  const [startDecrypt, setStartDecrypt] = useState(false);
  const [startToCryptoKey, setStartToCryptoKey] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (startEncrypt) {
      } else if (startDecrypt) {
      } else if (startToCryptoKey) {
        const cryptoKey = await convertStringToCryptoKey(pin);
        console.log("cryptoKey", cryptoKey);
      } else {
        console.log("Not sure what operation to do here");
      }
    };

    fetchData();
  }, [startDecrypt, startEncrypt, startToCryptoKey]);

  return (
    <div>
      <TextField
        label="Email (test)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="PIN (test)"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      <TextareaAutosize
        aria-label="Payload to Encrypt"
        minRows={3}
        placeholder="Payload to Encrypt"
        value={payloadToEncrypt}
        onChange={(e) => setPayloadToEncrypt(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <TextareaAutosize
        aria-label="Payload to Decrypt"
        minRows={3}
        placeholder="Payload to Decrypt"
        value={payloadToDecrypt}
        onChange={(e) => setPayloadToDecrypt(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <Button variant="contained" onClick={() => setStartEncrypt(true)}>
        Start Encrypt
      </Button>
      <Button variant="contained" onClick={() => setStartDecrypt(true)}>
        Start Decrypt
      </Button>
      <Button variant="contained" onClick={() => setStartToCryptoKey(true)}>
        Start ToCryptoKey
      </Button>
    </div>
  );
};
