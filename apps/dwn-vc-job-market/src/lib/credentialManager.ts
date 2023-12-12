import type {
  UniqueVerifiableCredential,
  VerifiableCredential,
} from "@veramo/core";
import axios from "axios";
import { Database } from "@/__generated__/supabase-types.ts";

export const REST_API_URL = "http://localhost:8080";

type BootstrapServer = {
  url: string;
  name: string;
  description?: string;
  logo?: string;
  did: string;
};
export const BOOTSTRAP_SERVERS: BootstrapServer[] = [
  {
    name: "LOCAL",
    url: REST_API_URL,
    did: "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
  },
];

export interface CredentialManager<
  RequestParameters,
  CredentialsResponse = UniqueVerifiableCredential,
  CredentialResponse = VerifiableCredential,
  JobListingResponse = Database["public"]["Tables"]["job_listings"]["Row"],
> {
  getCredentials: (
    requestParameters: RequestParameters,
  ) => Promise<CredentialsResponse[]>;
  requestIssueBasicCredentials: (
    requestParameters: RequestParameters,
  ) => Promise<CredentialResponse[]>;
  getJobListing: (
    requestParameters: RequestParameters & {
      jobListingId: string;
    },
  ) => Promise<JobListingResponse>;
}

export class SupabaseCredentialManager
  implements
    CredentialManager<{
      jwt: string;
    }>
{
  getCredentials = async (requestParameters: {
    jwt: string;
  }): Promise<UniqueVerifiableCredential[]> => {
    const res = await axios.get<UniqueVerifiableCredential[]>(
      `${REST_API_URL}/credentials`,
      {
        headers: {
          "x-access-token": requestParameters.jwt,
        },
      },
    );
    return res.data;
  };
  requestIssueBasicCredentials = async (requestParameters: {
    jwt: string;
  }): Promise<VerifiableCredential[]> => {
    console.log("requestIssueBasicCredentials", requestParameters.jwt);
    const res = await axios.post(
      `${REST_API_URL}/credentials/issue/has-account`,
      undefined,
      {
        headers: {
          "x-access-token": requestParameters.jwt,
        },
      },
    );
    console.log("requestIssueBasicCredentials", res);
    const res2 = await axios.post(
      `${REST_API_URL}/credentials/issue/has-verified-email`,
      undefined,
      {
        headers: {
          "x-access-token": requestParameters.jwt,
        },
      },
    );
    console.log("requestIssueBasicCredentials", res2);
    return [res.data, res2.data];
  };
  getJobListing = async (requestParameters: {
    jwt: string;
    jobListingId: string;
  }) => {
    const res = await axios.get<
      Database["public"]["Tables"]["job_listings"]["Row"]
    >(`${REST_API_URL}/job-listing/${requestParameters.jobListingId}`, {
      headers: {
        "x-access-token": requestParameters.jwt,
      },
    });
    return res.data;
  };

  getProofOfWorkChallenge = async (requestParameters: {
    clientDid: string;
    jwt: string;
  }) => {
    const res = await axios.get<{
      challenge: string;
      serverDid: string;
      timeOut: number;
    }>(
      `${REST_API_URL}/proofOfWork/getChallenge`,
      {
        headers: {
          "X-Client-Id": requestParameters.clientDid,
          "x-access-token": requestParameters.jwt,
        },
      },
    );
    return res.data;
  };

  submitProofOfWorkChallenge = async (requestParameters: {
    clientDid: string;
    challengeHash: string;
    jwt: string;
  }) => {
    const res = await axios.post(
      `${REST_API_URL}/proofOfWork`,
    undefined, 
    {
      headers: {
        "X-Client-Id": requestParameters.clientDid,
        "X-Challenge-Hash": requestParameters.challengeHash,
        "x-access-token": requestParameters.jwt,
      },
    });
    return res.data;
  };
}
