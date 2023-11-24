import { agent } from "./setup.js";

async function getIPAddressInfo(ipAddress, apiKey) {
  const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

async function main() {
  const identifier = await agent.didManagerGetByAlias({ alias: "default" });

  const ipAddress = "144.6.68.5";
  const apiKey = "0bb30a80239788";

  const ipInfo = await getIPAddressInfo(ipAddress, apiKey);
  const ipType = ipInfo?.asn?.type ?? "unknown";
  const isDataCenter = !(
    ipType?.toLowerCase() === "residential" ||
    ipType?.toLowerCase() === "unknown"
  );

  if (isDataCenter) {
    return;
  }

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: {
        id: identifier.did,
        name: "Decentralinked Issuer",
      },
      credentialSubject: {
        id: "did:web:example.com", // This should be did:ethr:<the public key of the embedded wallet, or the id of the user from supabase>
        location: {
          region: ipInfo.region,
          city: ipInfo.city,
        },
      },
    },
    type: ["VerifiableCredential", "ProofOfEmailOwnership"],
    proofFormat: "jwt",
  });
  console.log(`New credential created`);
  console.log(JSON.stringify(verifiableCredential, null, 2));
}

main().catch(console.log);
