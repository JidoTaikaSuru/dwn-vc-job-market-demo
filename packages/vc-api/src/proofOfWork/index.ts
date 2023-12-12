import { FastifyInstance, FastifyServerOptions } from "fastify";
import { agent, DEFAULT_IDENTIFIER_SCHEMA } from "../setup.js";
import { argon2Verify } from "hash-wasm";

export type ProofOfWorkHeaders = {
  "x-challenge-hash": string;
  "x-client-id": string;
};

export default async function proofOfWorkRoutes(
  server: FastifyInstance,
  options: FastifyServerOptions,
) {
  server.route({
    method: "POST",
    url: "/proofOfWork",
    schema: {
      headers: {
        type: "object",
        properties: {
          "x-challenge-hash": { type: "string" },
          "x-client-id": { type: "string" },
        },
        required: ["x-challenge-hash", "x-client-id"],
      },
    },

    handler: async (request, reply) => {
      const clientDid = request.headers["x-client-id"];
      const challengeHash = request.headers["x-challenge-hash"];
      if (!clientDid || !challengeHash) {
        return reply.status(400).send(`You are missing a required header`);
      } else if (
        Array.isArray(clientDid) ||
        Array.isArray(challengeHash)
      ) {
        return reply
          .status(400)
          .send("You passed the same authorization header more than once");
      }

      const { did } = await agent.didManagerGetByAlias({
        alias: DEFAULT_IDENTIFIER_SCHEMA,
      });
      console.log("🚀 ~ file: index.ts:67 ~ handler: ~ clientDid:", clientDid)
      console.log("🚀 ~ file: index.ts:78 ~ handler: ~ serverDid:", did)

      const isValid = await argon2Verify({
        password: did + clientDid,
        hash: challengeHash,
      });

      console.log(
        "serverAnswer:",
        did,
        "challengeHash:",
        challengeHash,
        "isValid",
        isValid,
      );

      if (!isValid) {
        return reply.status(401).send("Failed to verify hash");
      }
      reply.status(200);
    },
  });
}
