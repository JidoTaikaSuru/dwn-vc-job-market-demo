import { FastifyReply, FastifyRequest } from "fastify";
import { agent, DEFAULT_IDENTIFIER_SCHEMA } from "../../setup.js";

import { storeCredential } from "../lib.js";
import { IPAddressInfo } from "../../types.js";

export const issueHasVerifiedIPAddressCredentialHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { user } = request;
  console.log("Issuing has verified IP address credential to", user);
  const identifier = await agent.didManagerGetByAlias({
    alias: DEFAULT_IDENTIFIER_SCHEMA,
  });

  const ipAddress = "144.6.68.5";
  const apiKey = process.env.API_KEY;

  // get IP information from ipinfo.io. https://ipinfo.io/developers
  const getIPAddressInfo = async (ipAddress: string, apiKey: string) => {
    try {
      const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`An error occurred`, error);
    }
  };

  const ipInfo: IPAddressInfo = await getIPAddressInfo(ipAddress, apiKey);
  const ipType = ipInfo?.type ?? "unknown";
  const isDataCenter = !(
    ipType?.toLowerCase() === "residential" ||
    ipType?.toLowerCase() === "unknown"
  );

  if (isDataCenter) {
    return reply.status(400).send("IP address is not a residential address");
  }

  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      id: `did:web:gotid.org:credential:has-verified-ip-address:${user.id}`,
      issuer: {
        id: identifier.did,
        name: "Decentralinked Issuer",
      },
      expirationDate: date,
      type: ["VerifiableCredential", "HasVerifiedIPAddress"],
      credentialSubject: {
        id: `did:eth:${user.public_key}`, // This should be did:ethr:<the public key of the embedded wallet, or the id of the user from supabase>
        location: {
          region: ipInfo.region,
          city: ipInfo.city,
        },
      },
    },
    proofFormat: "jwt",
  });
  await storeCredential(verifiableCredential);
  reply.send(verifiableCredential);
};
