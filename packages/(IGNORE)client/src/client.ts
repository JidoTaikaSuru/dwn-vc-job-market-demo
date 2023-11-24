import { VerifiableCredential } from "@veramo/core";
import axios from "axios";
import { CredentialManager } from "./global.js";

export const REST_API_URL = "http://localhost:8080";

export class SupabaseCredentialManager
    implements CredentialManager<{ jwt: string }, VerifiableCredential>
{
    getCredentials = async (requestParameters: { jwt: string }) => {
        const res = await axios.get(`${REST_API_URL}/credentials`, {
            headers: {
                "x-access-token": requestParameters.jwt,
            },
        });
        return res.data;
    };
    requestIssueBasicCredentials = async (requestParameters: { jwt: string }) => {
        const res = await axios.post(
            `${REST_API_URL}/credentials/issue/has-account`,
            {
                headers: {
                    "x-access-token": requestParameters.jwt,
                },
            }
        );
        const res2 = await axios.post(
            `${REST_API_URL}/credentials/issue/has-account`,
            {
                headers: {
                    "x-access-token": requestParameters.jwt,
                },
            }
        );
        return [res.data, res2.data];
    };
}
