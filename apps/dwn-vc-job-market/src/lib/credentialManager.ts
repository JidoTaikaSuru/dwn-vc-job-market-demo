import type { UniqueVerifiableCredential, VerifiableCredential } from '@veramo/core';
import axios from 'axios';

export const REST_API_URL = import.meta.env.VITE_BACKEND_URL;

type BootstrapServer = {
  url: string;
  name: string;
  description?: string;
  logo?: string;
  did: string;
};
export type GetChallengeResponse = {
  serverDid: string;
};

export const BOOTSTRAP_SERVERS: BootstrapServer[] = [
  {
    name: 'LOCAL',
    url: REST_API_URL,
    did: 'did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b',
  },
];

export interface BasicCredentialManager<RequestParameters> {
  getCredentials: (requestParameters: RequestParameters) => Promise<UniqueVerifiableCredential[]>;
  requestIssueBasicCredentials: (requestParameters: RequestParameters) => Promise<VerifiableCredential[]>;
}

export interface ProofOfWorkManager<RequestParameters, ChallengeParameters> {
  getProofOfWorkChallenge: (requestParameters: RequestParameters & ChallengeParameters) => Promise<GetChallengeResponse>;
  submitProofOfWorkChallenge: (requestParameters: RequestParameters & ChallengeParameters) => Promise<null>;
}


export interface CredentialManager<
  RequestParameters,
> {
  getCredentials: (
    requestParameters: RequestParameters,
  ) => Promise<UniqueVerifiableCredential[]>;
  requestIssueBasicCredentials: (
    requestParameters: RequestParameters,
  ) => Promise<VerifiableCredential[]>;
  getProofOfWorkChallenge: (
    requestParameters: RequestParameters & {
      clientDid: string;
    },
  ) => Promise<GetChallengeResponse>;
  submitProofOfWorkChallenge: (
    requestParameters: RequestParameters & {
      clientDid: string;
      challengeHash: string;
    },
  ) => Promise<null>;
}



export class SupabaseCredentialManager
  implements CredentialManager<{
    jwt: string;
  }> {
  getCredentials = async (requestParameters: {
    jwt: string;
  }): Promise<UniqueVerifiableCredential[]> => {
    const res = await axios.get<UniqueVerifiableCredential[]>(
      `${REST_API_URL}/credentials`,
      {
        headers: {
          'x-access-token': requestParameters.jwt,
        },
      },
    );
    return res.data;
  };
  requestIssueBasicCredentials = async (requestParameters: {
    jwt: string;
  }): Promise<VerifiableCredential[]> => {
    console.log('requestIssueBasicCredentials', requestParameters.jwt);
    const res = await axios.post(
      `${REST_API_URL}/credentials/issue/has-account`,
      undefined,
      {
        headers: {
          'x-access-token': requestParameters.jwt,
        },
      },
    );
    console.log('requestIssueBasicCredentials', res);
    const res2 = await axios.post(
      `${REST_API_URL}/credentials/issue/has-verified-email`,
      undefined,
      {
        headers: {
          'x-access-token': requestParameters.jwt,
        },
      },
    );
    console.log('requestIssueBasicCredentials', res2);
    return [res.data, res2.data];
  };


  getProofOfWorkChallenge = async (requestParameters: {
    clientDid: string;
  }) => {
    const res = await axios.get<{
      serverDid: string;
    }>(
      `${REST_API_URL}/proofOfWork/getChallenge`,
      {
        headers: {
          'x-client-id': requestParameters.clientDid,
        },
      },
    );
    return res.data;
  };

  submitProofOfWorkChallenge = async (requestParameters: {
    clientDid: string;
    challengeHash: string;
  }) => {
    const res = await axios.post(
      `${REST_API_URL}/proofOfWork`,
      undefined,
      {
        headers: {
          'x-client-id': requestParameters.clientDid,
          'x-challenge-hash': requestParameters.challengeHash,
        },
      });
    return res.data;
  };

  registerDataSubscriptionEndpoint = async (requestParameters: {
    clientDid: string;
    answerHash: string;
    endpoint: string;
  }) => {
    const res = await axios.post(
      `${REST_API_URL}/registerDataSubscriptionEndpoint`,
    undefined, 
    {
      headers: {
        "x-client-id": requestParameters.clientDid,
        "x-answer-hash": requestParameters.answerHash,
        "x-client-endpoint": requestParameters.endpoint,
      },
    });
    return res.data;
  };

  getProofOfLatency = async () => {
    const res = await axios.get(
      `${REST_API_URL}/getProofOfLatency`,
    undefined);
    return res.data;
  };

  postProofOfLatency = async (requestParameters: {
    did: string;
    jwt: string;
    endpoint : string;
  }) => {
    const res = await axios.post(
      `${REST_API_URL}/postProofOfLatency`,
    undefined, 
    {
      headers: {
        "x-did": requestParameters.did,
        "x-jwt": requestParameters.jwt,
        "x-endpoint": requestParameters.endpoint,
      },
    });
    return res.data;
  };
}
