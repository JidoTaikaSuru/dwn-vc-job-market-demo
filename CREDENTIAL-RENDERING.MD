High level requirements

* A company can specify what credentials an applicant must have in order to apply for a job. This is a presentation
  definition.
* A company **doesn't know what credentials a user has**. Only us and the user knows what credentials a user has. We'll
  support viewing credentials in the app (because it's a feature), but we should pretend that we support zero knowledge
  proofs (ZKPs)
* We issue credentials to a user through our backend. Companies **trust us as an issuer**, when they check if a user has
  credentials in the app, they will initially always check the it was us who issued the credential.
* We host the data for the user's credentials in our backend. Only us and the user can retrieve their credential data.
* A user can see their credentials in their profile or settings.
* When a user applies for the job, they can pass credentials against the company's presentation definition (presentation
  exchange)
* If the user passes the presentation exchange, they can apply for the job


* What can be rendered:
    * A credential has a few pieces of information that we should show somehow in the app
        * Credential type ("type": HasAccount, HasVerifiedEmail)
        * Credential body ("credentialSubject": arbitrary data, we can put whatever we want in here)
            * This body will **always** contain an identifier for who this credential was issued to
        * Date the credential was issued ("issuanceDate")
        * Date the credential will expire ("expirationDate")
        * Who issued the credential ("issuer", will always be us)
        * The "proof" of authenticity ("proff"). We wouldn't render this proof in the UI, but we want the user to be
          able to independently verify the proof of a credential.
    * This is what the raw data in a credential looks like
    ```json
        {
            "issuer": {
                "id": "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
                "name": "Decentralinked Issuer"
            },
            "credentialSubject": {
                "id": "did:ion:EiC4xdjih0cgRi7qq_Kt9miYRXyNu...97000003797",
                "pubkey": "did:eth:0x11CFAf53E05C7A90b1a59AFa055BF1d1F27B72ff",
                "supabaseId": "9ace747d-4fd6-4431-9bf8-08f49529d384",
                "verifiedEmail": true,
                "emailAliased": false
            },
            "id": "did:web:gotid.org:credential:has-verified-email:EiC4xdjih0cgRi7qq_Kt9miYRXyNu...97000003797",
            "type": [
                "VerifiableCredential",
                "HasVerifiedEmail"
            ],
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "issuanceDate": "2023-12-04T21:10:21.000Z",
            "expirationDate": "2024-03-04T21:10:21.000Z",
            "proof": {
                "type": "JwtProof2020",
                "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1...njBY62QI3sIpYkxBlZe1lWFt23_PQ"
            }
        }
        ```

Where to render the credentials

* Account settings:
    * A user should be able to see their credentials when they're in their profile.
    * Where their credentials are rendered, they should be able to "refresh" a credential that's about to expire.
    * A user must be able to delete a credential from their account.
* User profile:
    * We can show what credentials a user has in their profile.
    * The user can have a lot of different credentials, and a user can have two or more of the same credential, so I
      think we should only show 2-4, and should require the user to press a button to show more.
    * I think we should show a very limited amount of info in the card, and support some interaction that lets you see
      more details
* When creating a job:
    * The company should be able to specify what types of credentials a candidate must have to apply for the job
        * To keep the hackathon simple, we should only check if the client does or doesn't have a specific type of
          credential, and should avoid checking if a user has a credential with a specific value (so like, check if a
          user has a "Residential IP Address" credential, don't check if the have an "IP Address" credential with a "
          residential" value)
    * For the hackathon, there will be a known set of credentials, so there can be a dropdown/list control to choose
      which ones are required
    * The known credentials are:
        * HasAccount
        * HasVerifiedEmail
        * PassedCaptcha
        * GeolocationDetails
        * PublicMedia (youtube of a conference, publication)
    * This can go in the control where you choose what fields are required/optional when applying for the job
* When applying for a job:
    * If you don't, we should tell the user and disable any buttons that would let them apply
    * When you don't have a credential, we should show you exactly which ones you don't have
    * When you don't have a credential, we should somehow tell the user what they can do to get the credential
    * We should show what credentials are required that the user DOES have, but it should be hidden by default
* What to render when we automatically issue credentials
    * I wouldn't render anything for this. The most important thing to render is what credentials a user doesn't have
      when they're blocked from applying. Beyond that, most credentials can appear in the background.