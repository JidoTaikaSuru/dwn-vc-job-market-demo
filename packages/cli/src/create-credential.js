import { agent } from './setup.js'


/*
If this were put into a REST API (the below has several flaws in execution but is okay for a POC):
1. POST, provide email address in body
2. Get the JWT for supabase
3. Get the email address and user's pubkey from Supabase
4. Analyze the email address for credential details
5. Issue the credential
 */
async function main() {
  const identifier = await agent.didManagerGetByAlias({ alias: 'default' })

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: {
        id: identifier.did,
        name: "Decentralinked Issuer"
      },
      credentialSubject: {
        id: 'did:web:example.com', // This should be did:ethr:<the public key of the embedded wallet, or the id of the user from supabase>
        email: {
          verified: true,
          alias: false, // Set to true when user uses SimpleLogin or Relay
          customDomain: false, // Set to true when user uses custom domain
        },
      },
    },
    type: ['VerifiableCredential', 'ProofOfEmailOwnership'],
    proofFormat: 'jwt',
  })
  console.log(`New credential created`)
  console.log(JSON.stringify(verifiableCredential, null, 2))
}

main().catch(console.log)