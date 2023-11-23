import {FastifyReply, FastifyRequest} from "fastify";
import {agent, DEFAULT_IDENTIFIER_SCHEMA} from "../../setup.js";

import {storeCredential} from "../lib.js";

export const issueHasAccessCredentialHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    // User has authenticated, they exist, issue the credential
    const { user } = request;
    console.log("Issuing has account credential to", user);
    const identifier = await agent.didManagerGetByAlias({
        alias: DEFAULT_IDENTIFIER_SCHEMA,
    });
    const date = new Date();
    const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
            id: `did:web:gotid.org:credential:has-account:${user.id}`,
            issuer: {
                id: identifier.did,
                name: "Decentralinked Issuer",
            },
            expirationDate: date.setMonth(date.getMonth() + 3).toString(),
            type: ["VerifiableCredential", "HasAccountWithTrustAuthority"],
            credentialSubject: {
                id: `did:eth:${user.public_key}`, // This should be did:ethr:<the public key of the embedded wallet, or the id of the user from supabase>
                signinMethod: "OTP",
            },
        },
        proofFormat: "jwt",
    });
    await storeCredential(verifiableCredential);
    reply.send(verifiableCredential)
}