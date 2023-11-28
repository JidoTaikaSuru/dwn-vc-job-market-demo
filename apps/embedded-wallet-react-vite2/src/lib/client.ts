import type { VerifiableCredential } from "@veramo/core";
import axios from "axios";

export const REST_API_URL = "http://localhost:8080";

export interface CredentialManager<
  RequestParameters,
  CredentialResponse = VerifiableCredential,
> {
  getCredentials: (
    requestParameters: RequestParameters,
  ) => Promise<CredentialResponse[]>;
  requestIssueBasicCredentials: (
    requestParameters: RequestParameters,
  ) => Promise<CredentialResponse[]>;
}

export class SupabaseCredentialManager
  implements CredentialManager<{ jwt: string }, VerifiableCredential>
{
  getCredentials = async (requestParameters: {
    jwt: string;
  }): Promise<VerifiableCredential[]> => {
    const res = await axios.get<VerifiableCredential[]>(
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
      `${REST_API_URL}/credentials/issue/has-account`,
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
}
