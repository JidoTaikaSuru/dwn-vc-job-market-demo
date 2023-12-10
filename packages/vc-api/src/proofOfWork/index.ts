import { FastifyInstance, FastifyServerOptions } from "fastify";
import { agent, DEFAULT_IDENTIFIER_SCHEMA } from "../setup.js";
import { argon2id } from "hash-wasm";

export type ProofOfWorkPostBody = {
  did: string;
  validatorDid: string;
  answerHash: string;
  executionTime: number;
};

// default timeout value equal 100 seconds
const defaultValidTimeout = 100000;

// timeout delta to increase or decrease the valid timeout
// depending on successfull or failed proof of work
const timeoutDelta = 10000;

const answerHashVariable = "answerHash";

const challengeBody = "00000";

export default async function proofOfWorkRoutes(
  server: FastifyInstance,
  options: FastifyServerOptions,
) {
  server.post<{ Body: ProofOfWorkPostBody }>("/proofOfWork", {
    schema: {
      headers: {
        type: "object",
        properties: {
          "X-Challenge-Hash": { type: "string" },
          "X-Client-Id": { type: "string" },
          "X-Challenge-Salt": { type: "string" },
        },
        required: ["X-Challenge-Solution", "X-Client-Id"],
      },
      // body: {
      //   type: "object",
      //   properties: {
      //     did: {
      //       type: "string",
      //     },
      //     answerHash: {
      //       type: "string",
      //     },
      //     validatorDid: {
      //       type: "string",
      //     },
      //     executionTime: {
      //       type: "number",
      //     },
      //   },
      //   required: ["proofOfWork"],
      // },
    },

    handler: async (request, reply) => {
      const clientDid = request.headers["X-Client-Id"];
      const challengeSalt = request.headers["X-Challenge-Salt"];
      const challengeHash = request.headers["X-Challenge-Hash"];
      const serverDid = await agent.didManagerGetByAlias({
        alias: DEFAULT_IDENTIFIER_SCHEMA,
      });

      answerHash = await argon2id({
        password: validatorDid + myDid,
        salt,
        parallelism: 1,
        iterations: 1,
        memorySize: 1000,
        hashLength: 32, // output size = 32 bytes
        outputType: "hex",
      });

      reply.send({ nextValidatorDid, challenge, validDuration });
    },
  });
}
