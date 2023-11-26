import { IVerifiableCredential } from "@sphereon/ssi-types";
import {IPresentationDefinition, PEX} from "@sphereon/pex";

const pex = new PEX();

const hasAccountPresentationDefinition: IPresentationDefinition = {
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
              const:
                  "did:eth:null",
              // pattern: "^did:web:gotid.org:credential:has-account:.*",
            },
          },
          {
            path: ["$.issuer.id"],
            purpose:
              "We only accept credentials issued by our issuer",
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

const credentials: IVerifiableCredential[] = [
  {
    issuer: {
      id: "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
      name: "Decentralinked Issuer",
    },
    credentialSubject: {
      signinMethod: "OTP",
      id: "did:eth:null",
    },
    id: "did:web:gotid.org:credential:has-account:4b7a6302-ca53-4472-949d-cd54adf02cf8",
    type: ["VerifiableCredential", "HasAccountWithTrustAuthority"],
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    issuanceDate: "2023-11-26T01:26:04.000Z",
    expirationDate: "2024-02-26T01:26:04.000Z",
    proof: {
      type: "JwtProof2020",
      jwt: "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MDg5MTA3NjQsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJIYXNBY2NvdW50V2l0aFRydXN0QXV0aG9yaXR5Il0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InNpZ25pbk1ldGhvZCI6Ik9UUCJ9fSwiaXNzdWVyIjp7Im5hbWUiOiJEZWNlbnRyYWxpbmtlZCBJc3N1ZXIifSwic3ViIjoiZGlkOmV0aDpudWxsIiwianRpIjoiZGlkOndlYjpnb3RpZC5vcmc6Y3JlZGVudGlhbDpoYXMtYWNjb3VudDo0YjdhNjMwMi1jYTUzLTQ0NzItOTQ5ZC1jZDU0YWRmMDJjZjgiLCJuYmYiOjE3MDA5NjE5NjQsImlzcyI6ImRpZDpldGhyOmdvZXJsaToweDAzZWU2YjIxNGM4N2ZlMjhjYjVjYmM0ODZjZmI2MDI5NWJiMDVlYmQyODAzZTk4ZmE1YTZlNjU4ZTg5OTkxYWE4YiJ9.D8qE2VzA8quYxhYU5OST7Bcq8cqvOP9tgSFZiG1T4hJsW11zZaD7lESq6Xz6FcehVo_sbXwtHNJOmHaK51HBgw",
      proofPurpose: "assertionMethod",
      created: new Date().toLocaleString(),
      verificationMethod: "dunno",
    },
  },
];

const srMatches = pex.selectFrom(
  hasAccountPresentationDefinition,
  credentials,
  { holderDIDs: ["did:eth:null"] },
);

console.log(srMatches);
