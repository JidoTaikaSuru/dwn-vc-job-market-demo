import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Record } from "@web5/api";
import { Web5 } from "@web5/api";
import type { ProtocolDefinition } from "@tbd54566975/dwn-sdk-js";
import { protocols } from "@/lib/protocols.ts";
import { User } from "@supabase/supabase-js";
import { DEBUGGING } from "@/lib/common.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logIfDebug = (message: string) => {
  if (DEBUGGING) console.debug(message);
};

export const configureProtocol = async (
  web5: Web5,
  protocolDefinition: ProtocolDefinition,
) => {
  // query the list of existing protocols on the DWN
  const { protocols, status } = await web5.dwn.protocols.query({
    message: {
      filter: {
        protocol: protocolDefinition.protocol,
      },
    },
  });

  if (status.code !== 200) {
    alert("Error querying protocols  configureProtocol()");
    console.error("Error querying protocols configureProtocol()", status);
    return;
  }

  // if the protocol already exists, we return
  if (protocols.length > 0) {
    // console.log(
    //   "Protocol already exists and configured  configureProtocol() , " +
    //     protocolDefinition.protocol,
    // );
    return;
  }

  // configure protocol on local DWN
  const { status: configureStatus, protocol } =
    await web5.dwn.protocols.configure({
      message: {
        definition: protocolDefinition,
      },
    });

  console.debug(
    "Protocol configured configureProtocol()",
    configureStatus,
    protocol,
  );
};

export type DwnListType = {
  record: Record;
  data: any;
  id: string;
};

export const transformRecordToListType = async (
  record: Record,
): Promise<DwnListType> => {
  return {
    record,
    data: await record.data.json(),
    id: record.id,
  };
};

export const transformMultipleRecordsToListType = async (
  records: Array<Record>,
) => {
  if (records.length === 0) return [];
  const dwnList: DwnListType[] = [];
  for (const record of records) {
    dwnList.push(await transformRecordToListType(record));
  }
  return dwnList;
};

export const dwnCreateAndSendJApplicationReplyingToJob_deprecated = async (
  web5: Web5,
  user: User,
  myDid: string,
  recipientDWN: string,
  message: string,
  job_record_id: string,
) => {
  const mmmmessg =
    "JApplication message: " +
    message +
    " replying to job_record_id parentid=" +
    job_record_id;

  let email = "";
  if (user && user.email) {
    email = user.email;
  }
  const jobapp = {
    "@type": "japplication",
    title: "JApplication " + Math.random(),
    description: mmmmessg,
    author: myDid,
    email: email,
    recipient: recipientDWN,
    parentId: job_record_id,
    contextId: job_record_id,
  };

  try {
    const { record, status: createStatus } = await web5.dwn.records.create({
      data: jobapp,
      message: {
        protocolPath: "jobPost/japplication",
        protocol:
          protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].protocol,
        schema:
          protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].types
            .japplication.schema,
        dataFormat:
          protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].types
            .japplication.dataFormats?.[0],
        parentId: job_record_id,
        contextId: job_record_id,
        recipient: recipientDWN,
      },
    });
    console.log(
      "🚀 ~ file: utils.ts ~ dwnCreateAndSendJApplicationReplyingToJob ~ record:",
      record,
      createStatus,
    );

    if (record) {
      const { status: sendStatus } = await record.send(recipientDWN);

      if (sendStatus.code !== 202) {
        console.error(
          " dwnCreateAndSendJApplicationReplyingToJob() Unable to send to target ",
          JSON.stringify(sendStatus),
        );
        return;
      } else {
        console.log(
          " dwnCreateAndSendJApplicationReplyingToJob() japplication sent to recipient to " +
            recipientDWN +
            "  sendStatus=" +
            JSON.stringify(sendStatus),
        );
      }
    } else {
      console.log(
        "🚀 ~ file: utils.ts ~ dwnCreateAndSendJApplicationReplyingToJob ~ record:",
        record,
      );
      console.error(
        " dwnCreateAndSendJApplicationReplyingToJob record should not be undefined",
      );
    }
  } catch (e) {
    console.error(e);
    return;
  }
};

export const dwnQuerySelfGetAllVC = async (web5: Web5) => {
  //TODO adoll  get some VC here
  const protocol = protocols["cvPersonalStorageProtocol"].protocol;

  try {
    const { records } = await web5.dwn.records.query({
      message: {
        filter: {
          protocol: protocol,
        },
      },
    });
    console.log("dwnQuerySelfGetAllCV ~ records:", JSON.stringify(records));
    if (!records) return [];
    return await transformMultipleRecordsToListType(records);
  } catch (e) {
    console.log("dwnQuerySelf ~ e:", e);

    return undefined;
  }
};
export const dwnAddVCToDWNIfNotExists = async (
  web5: Web5,
  myDid: string,
  vcdata: any,
) => {
  //TODO adoll use this to store VC

  //Assumeing a format like this :
  /*
                                                                                        {
                                                                                          "issuer": {
                                                                                            "id": "did:ethr:goerli:0x03ee6b214c87fe28cb5cbc486cfb60295bb05ebd2803e98fa5a6e658e89991aa8b",
                                                                                            "name": "Decentralinked Issuer"
                                                                                          },
                                                                                          "credentialSubject": {
                                                                                            "signinMethod": "OTP",
                                                                                            "id": "did:eth:null"
                                                                                          },
                                                                                          "id": "did:web:gotid.org:credential:has-account:4b7a6302-ca53-4472-949d-cd54adf02cf8",
                                                                                          "type": [
                                                                                            "VerifiableCredential",
                                                                                            "HasAccountWithTrustAuthority"
                                                                                          ],
                                                                                          "@context": [
                                                                                            "https://www.w3.org/2018/credentials/v1"
                                                                                          ],
                                                                                          "issuanceDate": "2023-11-26T01:24:28.000Z",
                                                                                          "expirationDate": "2024-02-26T01:24:28.000Z",
                                                                                          "proof": {
                                                                                            "type": "JwtProof2020",
                                                                                            "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MDg5MTA2NjgsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJIYXNBY2NvdW50V2l0aFRydXN0QXV0aG9yaXR5Il0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InNpZ25pbk1ldGhvZCI6Ik9UUCJ9fSwiaXNzdWVyIjp7Im5hbWUiOiJEZWNlbnRyYWxpbmtlZCBJc3N1ZXIifSwic3ViIjoiZGlkOmV0aDpudWxsIiwianRpIjoiZGlkOndlYjpnb3RpZC5vcmc6Y3JlZGVudGlhbDpoYXMtYWNjb3VudDo0YjdhNjMwMi1jYTUzLTQ0NzItOTQ5ZC1jZDU0YWRmMDJjZjgiLCJuYmYiOjE3MDA5NjE4NjgsImlzcyI6ImRpZDpldGhyOmdvZXJsaToweDAzZWU2YjIxNGM4N2ZlMjhjYjVjYmM0ODZjZmI2MDI5NWJiMDVlYmQyODAzZTk4ZmE1YTZlNjU4ZTg5OTkxYWE4YiJ9.QFYGYn8Z3xi32wD1foTwwi6Vggppw-kDggVm8iASTmN6xrQpjwkyJs_RVxZwgWlmyPQ4llETLPBvaDXCgkRgrQ"
                                                                                          }
                                                                                        }
                                                                                      */

  const protocol = protocols["cvPersonalStorageProtocol"].protocol;

  if (vcdata && vcdata.id && vcdata.issuer && vcdata.issuer.id) {
    try {
      const { records } = await web5.dwn.records.query({
        //TODO this should not query everything every time there must be some cleaner way to filter out just one record matching by the conent of that record
        message: {
          filter: {
            protocol: protocol,
          },
        },
      });
      console.log(
        "dwnAddVCToDWNIfNotExists ~ records:",
        JSON.stringify(records),
      );

      if (records) {
        for (const record of records) {
          const data = await record.data.json();
          if (
            data &&
            data.vc &&
            data.vc.id &&
            data.vc.id === vcdata.id &&
            data.vc.issuer &&
            data.vc.issuer.id === vcdata.issuer.id
          ) {
            const list = { record, data, id: record.id };
            return list;
          }
        }
      }

      //Bookmark old

      const dwn_vc_data = {
        "@type": "cvPersonalStorage",
        author: myDid,
        vc: { ...vcdata },
      };
      const { record } = await web5.dwn.records.create({
        data: dwn_vc_data,
        message: {
          protocol: protocol,
          protocolPath: "cvPersonalStorage",
          schema:
            protocols["cvPersonalStorageProtocol"].types.cvPersonalStorage
              .schema,
          dataFormat:
            protocols["cvPersonalStorageProtocol"].types.cvPersonalStorage
              .dataFormats?.[0],
          published: true,
        },
      });

      if (record && record.id) {
        const rout = { record, dwn_vc_data, id: record.id };
        return rout;
      } else {
        console.error("dwnAddVCToDWNIfNotExists() record not created");
        return undefined;
      }
    } catch (e) {
      console.log("dwnAddVCToDWNIfNotExists() ~ e:", e);
      return undefined;
    }
  } else {
    console.error(
      " dwnAddVCToDWNIfNotExists()  VC missing one of the requred fields   vcdata.id &&  vcdata.issuer  && vcdata.issuer.id ",
    );
    return undefined;
  }
};

//
// const dwnQuerySelfSelector = selectorFamily({
//     key: "dwnQuerySelfSelector",
//     get: ({did}: { did: string }) => async ({get}) => {
//         console.groupCollapsed("dwnQuerySelfSelector");
//         const {web5} = get(web5ConnectSelector);
//         const res = await dwnQuerySelfProfile(web5);
//         console.groupEnd()
//         return res
//     }
// })
//
// export const dwnQueryprotocols["selfProfileProtocol"] = async (
//     web5: Web5,
//     did: string,
// ): Promise<DwnQuerySelfReturn | undefined> => {
//     const protocols["selfProfileProtocol"] = protocols["protocols["selfProfileProtocol"]"];
//     console.debug("dwnQuerySelf ~ protocol:", protocols["selfProfileProtocol"].protocol);
//     try {
//         const {records} = await web5.dwn.records.query({
//             message: {
//                 filter: {
//                     protocol: protocols["selfProfileProtocol"].protocol,
//                 },
//             },
//         });
//         console.log(
//             "dwnQuerySelf ~ records:",
//             JSON.stringify(records),
//         );
//
//         if (records) {
//             const outlist = [];
//             for (const record of records) {
//                 const data = await record.data.json();
//                 const list = {record, data, id: record.id};
//                 outlist.push(list);
//             }
//             return outlist;
//         }
//         return undefined;
//     } catch (e) {
//         console.error("dwnQuerySelf error:", e);
//         return undefined;
//     }
// };
