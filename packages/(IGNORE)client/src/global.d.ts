import {VerifiableCredential} from "@veramo/core";

export interface CredentialManager<RequestParameters, CredentialResponse = VerifiableCredential> {
    getCredentials: (requestParameters: RequestParameters) => Promise<CredentialResponse[]>;
    requestIssueBasicCredentials: (requestParameters: RequestParameters) => Promise<CredentialResponse[]>;
}

