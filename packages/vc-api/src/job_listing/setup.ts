import { JobListingPutBody } from "./index.js";
import { supabaseClient } from "../index.js";
import { IPresentationDefinition } from "@sphereon/pex";

export const hasAccountPresentationDefinition: IPresentationDefinition = {
  id: "2aec8c4c-e071-4bda-8a76-41ab27632afa",
  input_descriptors: [
    {
      id: "user has a HasAccount VC issued by us",
      name: "user has a HasAccount VC issued by us",
      purpose:
        "Please provide your HasAccount VC that we issued to you on account creation",
      constraints: {
        fields: [
          {
            path: ["$.jti"],
            purpose: "We only accept credentials with a specific jti",
            filter: {
              type: "string",
              const:
                "did:web:gotid.org:credential:has-account:4b7a6302-ca53-4472-949d-cd54adf02cf8",
              // pattern: "^did:web:gotid.org:credential:has-account:.*",
            },
          },
          {
            path: ["$.vc.credentialSubject.id"],
            purpose: "Holder must be did:eth:null",
            filter: {
              type: "string",
              const: "did:eth:null",
              // pattern: "^did:web:gotid.org:credential:has-account:.*",
            },
          },
          {
            path: ["$.issuer.id"],
            purpose: "We only accept credentials issued by our issuer",
            filter: {
              type: "string",
              const:
                "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
            },
          },
          {
            path: ["$.vc.type"],
            purpose: "Holder must possess HasAccountWithTrustAuthority VC",
            filter: {
              type: "array",
              contains: {
                type: "string",
                const: "HasAccountWithTrustAuthority",
              },
            },
          },
        ],
      },
    },
  ],
};

export const hasVerifiedEmailPresentationDefinition: IPresentationDefinition = {
  id: "2aec8c4c-e071-4bda-8a76-41ab27632afa",
  input_descriptors: [
    {
      id: "user has a HasAccount VC issued by us",
      name: "user has a HasAccount VC issued by us",
      purpose:
        "Please provide your HasAccount VC that we issued to you on account creation",
      constraints: {
        fields: [
          {
            path: ["$.jti"],
            purpose: "We only accept credentials with a specific jti",
            filter: {
              type: "string",
              const:
                "did:web:gotid.org:credential:has-account:4b7a6302-ca53-4472-949d-cd54adf02cf8",
              // pattern: "^did:web:gotid.org:credential:has-account:.*",
            },
          },
          {
            path: ["$.vc.credentialSubject.id"],
            purpose: "Holder must be did:eth:null",
            filter: {
              type: "string",
              const: "did:eth:null",
              // pattern: "^did:web:gotid.org:credential:has-account:.*",
            },
          },
          {
            path: ["$.issuer.id"],
            purpose: "We only accept credentials issued by our issuer",
            filter: {
              type: "string",
              const:
                "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
            },
          },
          {
            path: ["$.vc.type"],
            purpose: "Holder must possess HasAccountWithTrustAuthority VC",
            filter: {
              type: "array",
              contains: {
                type: "string",
                const: "HasAccountWithTrustAuthority",
              },
            },
          },
        ],
      },
    },
  ],
};

const preCreateJobListings: JobListingPutBody[] = [
  {
    id: "8ae3ea55-53f2-4000-ae39-8328816eb748",
    title: "Software Engineer",
    description: "We are looking for a software engineer",
    company: "Decentralinked",
    presentation_definition: hasAccountPresentationDefinition,
  },
  {
    id: "aaf168a8-1e16-41b3-8fa7-b7ee53e8aaea",
    title: "Software Engineer",
    description: "Engineer of software",
    company: "Deknilartneced",
    presentation_definition: hasAccountPresentationDefinition,
  },
  {
    id: "f453da48-1402-4a1c-8679-3f01ecc5849e",
    title: "Senior Software Engineer",
    description: "We are looking for a Sr software engineer",
    company: "Deknilartneced",
    presentation_definition: hasVerifiedEmailPresentationDefinition,
  },
  {
    id: "47d78076-4c3c-45e8-a54f-c76c3cf1472e ",
    title: "Senior Software Engineer",
    description: "We are looking for a Sr software engineer",
    company: "Decentralinked",
    presentation_definition: hasVerifiedEmailPresentationDefinition,
  },
];

// Seeding and upserting job listings wil let us iterate on presentation definitions faster
// This is necessary because PEX doesn't do everything we want it to do yet
export const precreateJobListings = async () => {
  for (const jobListing of preCreateJobListings) {
    console.log("Upserting jobListing", jobListing);
    const { data, error } = await supabaseClient
      .from("job_listings")
      .upsert(jobListing);
    if (error) {
      console.error(error);
    }
    console.log("data", data);
  }
};
