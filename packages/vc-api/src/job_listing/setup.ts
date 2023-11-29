import {JobListingPutBody} from "./index.js";
import {supabaseClient} from "../index.js";
import {IPresentationDefinition} from "@sphereon/pex";
import {loadPlaceholdersIntoPresentationDefinition, PresentationDefinitionPlaceholder,} from "../presentation/lib.js";

/* This script seeds the job_listings table in Supabase
 *  It was written so we can quickly iterate on presentation definitions and troubleshoot edge cases
 * */

const issuerIdPlaceholder: PresentationDefinitionPlaceholder = {
  // issuer_id key, default did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b, validate should be a regex that matches the  pattern
  key: "{{issuer_id}}",
  value:
    "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
  validate: (value: string) => {
    //TODO validate did
    // Check value regex match did:ethr:goerli:0x<hexString>
    // return value.match(/^did:ethr:goerli:0x[0-9a-fA-F]{20,40}$/) !== null; // TODO fixme
    return true;
  },
};

// const requireIssuer = {
//   path: ["$.issuer.id"],
//   purpose: "We only accept credentials issued by our issuer",
//   filter: {
//     type: "string",
//     const: "{{issuer_id}}",
//   },
// };

const requireType = (typeString: string) => ({
  path: ["$.type"],
  purpose: `Holder must possess ${typeString} VC`,
  filter: {
    type: "array",
    contains: {
      type: "string",
      const: typeString,
    },
  },
});

// const requireJti = {
//   path: ["$.jti"],
//   purpose: "We only accept credentials with a specific jti",
//   filter: {
//     type: "string",
//     const: "did:web:gotid.org:credential:has-account:{{user_supabase_id}}",
//     // pattern: "^did:web:gotid.org:credential:has-account:.*",
//   },
// };
//
// const requireCredentialSubjectId = {
//   path: ["$.vc.credentialSubject.id"],
//   purpose: "Holder must be did:eth:{{user_wallet_pubkey}}",
//   filter: {
//     type: "string",
//     const: "did:eth:{{user_wallet_pubkey}}",
//   },
// };

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
          // requireIssuer,
          requireType("HasAccountWithTrustAuthority"),
          // requireJti,
          // requireCredentialSubjectId,
        ],
      },
    },
  ],
};

export const hasVerifiedEmailPresentationDefinition: IPresentationDefinition = {
  id: "bd980aee-10ba-462c-8088-4afdda24ed97",
  input_descriptors: [
    {
      id: "user has a HasAccount VC issued by us",
      name: "user has a HasAccount VC issued by us",
      purpose:
        "Please provide your HasAccount VC that we issued to you on account creation",
      constraints: {
        fields: [
          // requireIssuer,
          requireType("HasVerifiedEmail"),
          // requireJti,
          // requireCredentialSubjectId,
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
    presentation_definition: loadPlaceholdersIntoPresentationDefinition(
      hasAccountPresentationDefinition,
      [issuerIdPlaceholder],
    ),
  },
  {
    id: "aaf168a8-1e16-41b3-8fa7-b7ee53e8aaea",
    title: "Software Engineer",
    description: "Engineer of software",
    company: "Deknilartneced",
    presentation_definition: loadPlaceholdersIntoPresentationDefinition(
      hasAccountPresentationDefinition,
      [issuerIdPlaceholder],
    ),
  },
  {
    id: "f453da48-1402-4a1c-8679-3f01ecc5849e",
    title: "Senior Software Engineer",
    description: "We are looking for a Sr software engineer",
    company: "Deknilartneced",
    presentation_definition: loadPlaceholdersIntoPresentationDefinition(
      hasVerifiedEmailPresentationDefinition,
      [issuerIdPlaceholder],
    ),
  },
  {
    id: "47d78076-4c3c-45e8-a54f-c76c3cf1472e ",
    title: "Senior Software Engineer",
    description: "We are looking for a Sr software engineer",
    company: "Decentralinked",
    presentation_definition: loadPlaceholdersIntoPresentationDefinition(
      hasVerifiedEmailPresentationDefinition,
      [issuerIdPlaceholder],
    ),
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
