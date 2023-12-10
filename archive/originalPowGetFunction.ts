import { FastifyInstance, FastifyServerOptions } from "fastify";
import { agent, DEFAULT_IDENTIFIER_SCHEMA } from "../setup.js";

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
          "X-Challenge-Solution": { type: "string" },
          "X-Client-Id": { type: "string" },
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
      const challengeSolution = request.headers["X-Challenge-Solution"];
      const serverDid = await agent.didManagerGetByAlias({
        alias: DEFAULT_IDENTIFIER_SCHEMA,
      });

      const { did, answerHash, validatorDid, executionTime } = request.body;

      const validDuration = defaultValidTimeout;

      let nextValidatorDid: string;
      // create challenge task
      let challenge = `(${answerHashVariable}.match(/${challengeBody}/g) || []).length > 0`;

      // --- PoW INIT --- if no optional parameters consider initial PoW run
      if (
        answerHash === (undefined || "") &&
        validatorDid === (undefined || "") &&
        executionTime === 0
      ) {
        //TODO: search for the approriate initial validator node
        nextValidatorDid =
          "did:ion:EiDxKqbPxJLSqG9RePds3y5AtAdj8NkbXLFO4Hb3dzqbsA:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24tc2lnIiwicHVibGljS2V5SndrIjp7ImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ4IjoiMVdtN0VKNUxQTDBDTDc3NWY3bF9KXzkzT08tVWh6MmJyM3FsVS1jdmVoTSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifSx7ImlkIjoiZHduLWVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJ1eExOWE1ULVRlb3FzMDktbmxhUjZUczhpZkpjYkdsRDdqR2tkbVBwR0ZZIiwieSI6IjhzYnpHOGc2NFoyVzZiby1mbWJSQzhKRUxKRG5ISldtejNqZk1Od2R6b00ifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7ImVuY3J5cHRpb25LZXlzIjpbIiNkd24tZW5jIl0sIm5vZGVzIjpbImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMCIsImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMSJdLCJzaWduaW5nS2V5cyI6WyIjZHduLXNpZyJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlEQVMyZUdaUzlIYkNTaXIzejNaTTRxeW9oWmRGaFN3ZmQxZ3pFaW9HeXhjUSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpRER5cS1naDUwUzlmVTRMZ0ppM1M3MUd3Snk3STRQZ2hIVDM4NVRDNzY3aVEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUFFU3huVHA0elRwX0h3U0NkU1B5SVZDa1c1a2pFcFlIZFZnaHJScGNVdHlnIn19";
      } else {
        // --- PoW FAILED --- if no answerHash consider PoW failed and reconfiguration is required
        if (answerHash === (undefined || "")) {
          // as the PoW failed the same validator should be used again
          nextValidatorDid = validatorDid;

          // create challengeBody decreased by one symbol to ease the proof of work
          const newChallengeBody = challengeBody.substring(
            0,
            challengeBody.length - 2,
          );
          challenge = `(${answerHashVariable}.match(/${newChallengeBody}/g) || []).length > 0`;
        }
        // --- PoW SUCCESSFUL --- need check next validator and set new challenge
        else {
          // TODO: select next validator for the next validation
          nextValidatorDid =
            "did:ion:EiDxKqbPxJLSqG9RePds3y5AtAdj8NkbXLFO4Hb3dzqbsA:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24tc2lnIiwicHVibGljS2V5SndrIjp7ImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ4IjoiMVdtN0VKNUxQTDBDTDc3NWY3bF9KXzkzT08tVWh6MmJyM3FsVS1jdmVoTSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifSx7ImlkIjoiZHduLWVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJ1eExOWE1ULVRlb3FzMDktbmxhUjZUczhpZkpjYkdsRDdqR2tkbVBwR0ZZIiwieSI6IjhzYnpHOGc2NFoyVzZiby1mbWJSQzhKRUxKRG5ISldtejNqZk1Od2R6b00ifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7ImVuY3J5cHRpb25LZXlzIjpbIiNkd24tZW5jIl0sIm5vZGVzIjpbImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMCIsImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMSJdLCJzaWduaW5nS2V5cyI6WyIjZHduLXNpZyJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlEQVMyZUdaUzlIYkNTaXIzejNaTTRxeW9oWmRGaFN3ZmQxZ3pFaW9HeXhjUSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpRER5cS1naDUwUzlmVTRMZ0ppM1M3MUd3Snk3STRQZ2hIVDM4NVRDNzY3aVEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUFFU3huVHA0elRwX0h3U0NkU1B5SVZDa1c1a2pFcFlIZFZnaHJScGNVdHlnIn19";

          // if no validator selected then consider validation completed
          if (nextValidatorDid === (undefined || "")) {
            // TODO: notify client that validation passed
          }

          // increase dificulty of the challenge in case of overperformance
          if (executionTime < defaultValidTimeout / 2) {
            // create challengeBody increased by one symbol to complicate the proof of work
            const newChallengeBody = challengeBody + challengeBody[0];
            challenge = `(${answerHashVariable}.match(/${newChallengeBody}/g) || []).length > 0`;
          }
        }
      }

      reply.send({ nextValidatorDid, challenge, validDuration });
    },
  });
}
