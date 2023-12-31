import { UniqueVerifiableCredential } from "@veramo/core";
import { IVerifiableCredential } from "@sphereon/ssi-types";
import { IPresentationDefinition, PEX } from "@sphereon/pex";
import { Wallet } from "ethers";
import { PresentationExchangeStatus } from "@/components/CredentialCard.tsx";

const pex = new PEX();
export const HAS_ACCOUNT_PRESENTATION_DEFINITION =
  "2aec8c4c-e071-4bda-8a76-41ab27632afa";
export const HAS_VERIFIED_EMAIL_PRESENTATION_DEFINITION =
  "bd980aee-10ba-462c-8088-4afdda24ed97";
export const HAS_CAPTCHA_PRESENTATION_DEFINITION =
  "6edbf323-b47c-43e6-be94-2210ad55fbd0";

export const convertVeramoVcToPexFormat = (
  credentials: UniqueVerifiableCredential[],
): IVerifiableCredential[] => {
  return credentials.map((credential): IVerifiableCredential => {
    const base = {
      ...credential,
      verifiableCredential: {
        ...credential.verifiableCredential,
        type:
          typeof credential.verifiableCredential.type === "string"
            ? [credential.verifiableCredential.type]
            : credential.verifiableCredential.type || [],
        proof: {
          ...credential.verifiableCredential.proof,
          type: credential.verifiableCredential.proof.type || "JwtProof2020",
          proofPurpose: "assertionMethod",
          created: new Date().toLocaleString(),
          verificationMethod: "dunno",
        },
      },
    };
    return base.verifiableCredential;
  });
};

export const checkVcMatchAgainstPresentation = (
  presentation: IPresentationDefinition,
  credentials: IVerifiableCredential[],
  wallet: Wallet,
) => {
  console.log("presentationDefinition", presentation);
  const matchingCredentials = pex.selectFrom(
    presentation,
    credentials,
    // [userCredentials[0]] as OriginalVerifiableCredential[],
    { holderDIDs: [`did:ethr:${wallet?.address}`] },
  );
  console.log("matchingCredentials", matchingCredentials);
  const pass = !(
    matchingCredentials.errors && matchingCredentials.errors.length > 0
  );
  return {
    pass: pass
      ? PresentationExchangeStatus.pass
      : PresentationExchangeStatus.fail,
    matchingVcs: matchingCredentials,
  };
};
