import { FastifyReply, FastifyRequest } from "fastify";
import { agent, DEFAULT_IDENTIFIER_SCHEMA } from "../../setup.js";
import { storeCredential } from "../lib.js";

export const issuePassedCaptchaCredential = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // ID for the key store, no need to change this
  const identifier = await agent.didManagerGetByAlias({
    alias: DEFAULT_IDENTIFIER_SCHEMA,
  });
  // User has already authenticated w/ JWT by the time they reach this. This means they have an account w/ us
  // User is data from the "users" table (see __generated__/supabase-types.ts, search for users: {, see the "Row" type)
  // authData is data from Supabase auth, drill into it to see the type
  const { user, authData } = request;

  console.log("Issuing passed captcha credential to", user);
  console.log("authData", authData);

  /*
    TODO Do validation to make sure the user has passed the captcha right here.*/
  
  const recaptchaToken = ""; //Get token from challenge from the request body??
  const recaptchaSecretKey = ""; //To be added from admin console

 try {
    const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: recaptchaSecretKey,
        response: recaptchaToken,
      }),
    });

    const recaptchaData = await recaptchaResponse.json();
    //@ts-ignore
    if (!recaptchaData.success) {
      return reply.status(400).send("reCAPTCHA verification failed");
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return reply.status(500).send("Internal Server Error");
  }

   /* If they fail validation, return reply.status(400 or 401).send("message about why user faileValidation");
     */

  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      id: `did:web:gotid.org:credential:has-verified-email:${user.id}`,
      issuer: {
        id: identifier.did,
        name: "Decentralinked Issuer",
      },
      expirationDate: date,
      type: ["VerifiableCredential", "HasVerifiedEmail"],
      credentialSubject: {
        id: `did:eth:${user.public_key}`,
        // TODO Change the below to have the properties that a "passedCaptcha" credential should have, like "passedCaptcha: true"
        passedCaptcha: true,
      },
    },
    proofFormat: "jwt",
  });
  await storeCredential(verifiableCredential);
  reply.send(verifiableCredential);
};
