import { IPresentationDefinition } from "@sphereon/pex";
import { Database } from "../__generated__/supabase-types.js";

export type PresentationDefinitionPlaceholder = {
  key: string;
  value?: string;
  validate?: (value: string) => boolean;
};

export const SAMPLE_PRESENTATION_DEFINITION: IPresentationDefinition = {
  id: "2aec8c4c-e071-4bda-8a76-41ab27632afa",
  input_descriptors: [
    {
      id: "user has a HasAccount VC issued by us",
      name: "HasAccount",
      purpose:
        "Please provide your HasAccount VC that we issued to you on account creation",
      constraints: {
        fields: [
          {
            path: ["$.issuer.id"],
            filter: {
              type: "string",
              const:
                "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
            },
            purpose: "We only accept credentials issued by our issuer",
          },
          {
            path: ["$.vc.type"],
            filter: {
              type: "array",
              contains: {
                type: "string",
                const: "HasAccountWithTrustAuthority",
              },
            },
            purpose: "Holder must possess HasAccountWithTrustAuthority VC",
          },
          {
            path: ["$.jti"],
            filter: {
              type: "string",
              const:
                "did:web:gotid.org:credential:has-account:{{user_did_value}}",
            },
            purpose: "We only accept credentials with a specific jti",
          },
        ],
      },
    },
  ],
};

export const knownPresentationDefinitions: {
  [key: string]: IPresentationDefinition;
} = {
  HasAccountVC: {
    id: "2aec8c4c-e071-4bda-8a76-41ab27632afa",
    input_descriptors: [
      {
        id: "user has a HasAccount VC issued by us",
        name: "HasAccount",
        purpose:
          "Please provide your HasAccount VC that we issued to you on account creation",
        constraints: {
          fields: [
            {
              path: ["$.issuer.id"],
              filter: {
                type: "string",
                const:
                  "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
              },
              purpose: "We only accept credentials issued by our issuer",
            },
            {
              path: ["$.vc.type"],
              filter: {
                type: "array",
                contains: {
                  type: "string",
                  const: "HasAccountWithTrustAuthority",
                },
              },
              purpose: "Holder must possess HasAccountWithTrustAuthority VC",
            },
            {
              path: ["$.jti"],
              filter: {
                type: "string",
                const:
                  "did:web:gotid.org:credential:has-account:{{user_did_value}}",
              },
              purpose: "We only accept credentials with a specific jti",
            },
            {
              path: ["$.vc.credentialSubject.id"],
              filter: { type: "string", const: "{{user_did}}" },
              purpose: "Holder must be {{user_did}}",
            },
          ],
        },
      },
    ],
  },
  HasVerifiedEmailVC: {
    id: "bd980aee-10ba-462c-8088-4afdda24ed97",
    input_descriptors: [
      {
        id: "user has a VerifiedEmail VC issued by us",
        name: "VerifiedEmail",
        purpose:
          "Please provide your VerifiedEmail VC that we issued to you on account creation. If you don't have one, try signing up for an account with us using OTP",
        constraints: {
          fields: [
            {
              path: ["$.issuer.id"],
              filter: {
                type: "string",
                const:
                  "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
              },
              purpose: "We only accept credentials issued by our issuer",
            },
            {
              path: ["$.vc.type"],
              filter: {
                type: "array",
                contains: { type: "string", const: "HasVerifiedEmail" },
              },
              purpose: "Holder must possess HasVerifiedEmail VC",
            },
            {
              path: ["$.jti"],
              filter: {
                type: "string",
                const:
                  "did:web:gotid.org:credential:has-account:{{user_did_value}}",
              },
              purpose: "We only accept credentials with a specific jti",
            },
            {
              path: ["$.vc.credentialSubject.id"],
              filter: { type: "string", const: "{{user_did}}" },
              purpose: "Holder must be {{user_did}}",
            },
          ],
        },
      },
    ],
  },
  HasPassedCaptchaVC: {
    id: "6edbf323-b47c-43e6-be94-2210ad55fbd0",
    input_descriptors: [
      {
        id: "user has a a PassedCaptcha VC issued by us",
        name: "PassedCaptcha",
        purpose:
          "Please provide your PassedCapctha VC that we issued to you on account creation. If you don't have one, too bad, this is a demo VC that is meant to intentionally fail",
        constraints: {
          fields: [
            {
              path: ["$.issuer.id"],
              filter: {
                type: "string",
                const:
                  "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
              },
              purpose: "We only accept credentials issued by our issuer",
            },
            {
              path: ["$.vc.type"],
              filter: {
                type: "array",
                contains: { type: "string", const: "PassedCaptcha" },
              },
              purpose: "Holder must possess PassedCaptcha VC",
            },
            {
              path: ["$.jti"],
              filter: {
                type: "string",
                const:
                  "did:web:gotid.org:credential:has-account:{{user_did_value}}",
              },
              purpose: "We only accept credentials with a specific jti",
            },
            {
              path: ["$.vc.credentialSubject.id"],
              filter: { type: "string", const: "{{user_did}}" },
              purpose: "Holder must be {{user_did}}",
            },
          ],
        },
      },
    ],
  },
};

export const stripDidPrefix = (did: string): string | undefined => {
  const regex = /did:([a-zA-Z]+:){1,}(.*)/; //TODO, not perfect, incompat with several did types, has pitfalls
  const match = did.match(regex);
  return match ? match[2] : undefined;
};

export const loadPlaceholdersIntoPresentationDefinition = (
  presentationDefinition: IPresentationDefinition,
  placeholders: PresentationDefinitionPlaceholder[],
): IPresentationDefinition => {
  let presentationDefinitionString = JSON.stringify(presentationDefinition);
  // For each placeholder in placeholders, check that the placeholder has either value or default value specified, then check that it passes validate, then do a string replace on presentationDefinitionString
  for (const placeholder of placeholders) {
    console.log(
      `loading placeholder ${placeholder.key} into presentation definition`,
    );
    if (!placeholder.value) {
      throw new Error(
        `Placeholder ${placeholder.key} is missing both value and default`,
      );
    }
    if (placeholder.validate && !placeholder.validate(placeholder.value)) {
      throw new Error(
        `Placeholder ${placeholder.key} has invalid value ${placeholder.value}`,
      );
    }
    presentationDefinitionString = presentationDefinitionString.replace(
      placeholder.key,
      placeholder.value,
    );
  }
  return JSON.parse(presentationDefinitionString);
};

export const loadUserDataPlaceholdersIntoPresentationDefinition = (
  presentationDefinition: IPresentationDefinition,
  user: Database["public"]["Tables"]["users"]["Row"],
) => {
  console.log(
    "loadUserDataPlaceholdersIntoPresentationDefinition ~ user",
    user,
  );

  return loadPlaceholdersIntoPresentationDefinition(presentationDefinition, [
    {
      key: "{{user_supabase_id}}",
      value: user.id,
      validate: (value) => {
        //TODO regex check for uuid
        return true;
      },
    },
    {
      key: "{{user_wallet_pubkey}}",
      value: user.public_key || "",
      validate: (value) => {
        //TODO regex check for ethereum address
        return true;
      },
    },

    {
      key: "{{user_did_value}}",
      value: stripDidPrefix(user.did || "") || "",
      validate: (value) => {
        //TODO regex check for ethereum address
        return true;
      },
    },
    {
      key: "{{user_did}}",
      value: user.did || "",
      validate: (value) => {
        //TODO regex check for ethereum address
        return true;
      },
    },
  ]);
};

export const getRandomPresentationDefinition = (): IPresentationDefinition => {
  return Object.values(knownPresentationDefinitions)[
    Math.floor(
      Math.random() * Object.values(knownPresentationDefinitions).length,
    )
  ];
};
