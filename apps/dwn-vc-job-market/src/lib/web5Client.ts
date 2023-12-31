import { Record, Web5 } from "@web5/api";
import { User } from "@supabase/supabase-js";
import { DateSort, ProtocolDefinition } from "@tbd54566975/dwn-sdk-js";
import { protocols } from "@/lib/protocols.ts";
import { logIfDebug, transformMultipleRecordsToListType } from "@/lib/utils.ts";
import { faker } from "@faker-js/faker";

interface DwnClientFunctions {
  dwnCreateAndSendJApplicationReplyingToJob: (
    recipientDWN: string,
    message: string,
    job_record_id: string,
  ) => Promise<void>;
  dwnCreateAndSendJApplication: (
    recipientDWN: string,
    message: string,
  ) => Promise<void>;
  dwnCreateJobPostAgainstCompany: (data: any) => Promise<Record | undefined>;
  dwnCreateSelfProfileName: (name: string) => Promise<Record | undefined>;
}

export class DwnClient implements DwnClientFunctions {
  web5: Web5;
  user: User;
  myDid: string;

  constructor(props: { web5: Web5; user: User; myDid: string }) {
    this.web5 = props.web5;
    this.user = props.user;
    this.myDid = props.myDid;
  }

  async dwnQuerySelfByProtocol(protocol: ProtocolDefinition) {
    console.debug("dwnQuerySelf ~ protocol:", protocol);
    try {
      const { records } = await this.web5.dwn.records.query({
        message: {
          filter: {
            protocol: protocol.protocol,
          },
        },
      });
      console.log(
        "🚀 ~ file: utils.ts:200 ~ dwnQuerySelf ~ records:",
        JSON.stringify(records),
      );

      return await transformMultipleRecordsToListType(records || []);
    } catch (e) {
      console.log("🚀 ~ file: utils.ts:205 ~ dwnQuerySelf ~ e:", e);

      return undefined;
    }
  }

  async dwnQueryOtherDWNByProtocol(
    fromDWN: string,
    protocol: ProtocolDefinition,
  ) {
    try {
      console.debug(
        "dwnQueryOtherDWN()  about to query fromDWN " +
          fromDWN +
          " for " +
          protocol.protocol,
      );
      // Reads the indicated record from Bob's DWNs
      const { records, status } = await this.web5.dwn.records.query({
        from: fromDWN,
        message: {
          filter: {
            protocol: protocol.protocol,
          },
        },
      });

      console.log("dwnQueryOtherDWN ~ records:", records);
      if (status.code !== 200) {
        console.error("dwnReadOtherDWN ~ status:", status);
        return undefined;
      }
      return await transformMultipleRecordsToListType(records || []);
    } catch (e) {
      console.error(`dwnQueryOtherDWN ~ ${e}:`);
      console.groupEnd();
      return [];
    }
  }

  async dwnReadOtherDWN(
    fromDWN: string,
    protocol: ProtocolDefinition,
  ): Promise<any | undefined> {
    try {
      console.debug(
        "dwnReadOtherDWN()  fromDWN " + fromDWN + " for " + protocol.protocol,
      );
      // Reads the indicated record from Bob's DWNs
      console.log("protocol", protocol.protocol);
      const { record, status } = await this.web5.dwn.records.read({
        from: fromDWN,
        message: {
          filter: {
            protocol: protocol.protocol,
          },
        },
      });
      logIfDebug(`dwnReadOtherDWN ~ record: ${record}`);
      if (status.code !== 200) {
        console.error("dwnReadOtherDWN ~ status:", status);
        console.groupEnd();
        return undefined;
      }
      // assuming the record is a json payload
      const data = await record.data.json();
      logIfDebug(`dwnReadOtherDWN ~ data: ${data}`);
      return data;
    } catch (e) {
      console.error("dwnReadOtherDWN ~ e:", e);
      return undefined;
    }
  }

  async dwnReadOtherDWNByRecordId(
    fromDWN: string,
    recordId: string,
    protocol: ProtocolDefinition,
  ): Promise<any | undefined> {
    try {
      console.debug(
        "dwnReadOtherDWNByRecordId()  fromDWN " +
          fromDWN +
          " for " +
          protocol.protocol,
      );
      // Reads the indicated record from Bob's DWNs
      console.log("protocol", protocol.protocol);
      const { record, status } = await this.web5.dwn.records.read({
        from: fromDWN,
        message: {
          filter: {
            recordId: recordId,
            protocol: protocol.protocol,
          },
        },
      });
      logIfDebug(`dwnReadOtherDWNByRecordId ~ record: ${record}`);
      if (status.code !== 200) {
        console.error("dwnReadOtherDWN ~ status:", status);
        console.groupEnd();
        return undefined;
      }
      // assuming the record is a json payload
      const data = await record.data.json();
      logIfDebug(`dwnReadOtherDWN ~ data: ${data}`);
      return data;
    } catch (e) {
      console.error("dwnReadOtherDWNByRecordId ~ e:", e);
      return undefined;
    }
  }

  async dwnQueryOtherDwnAllJSONData(props: { did: string }) {
    try {
      const { records } = await this.web5.dwn.records.query({
        from: props.did,
        message: {
          filter: {
            dataFormat: "application/json",
          },
        },
      });

      console.log("dwnQuerySelfallJSONData ~ records:", records);

      if (records) {
        const outlist: Array<{
          record: Record;
          data: any;
          id: string;
        }> = [];
        let num_outside_author = 0;

        for (const record of records) {
          const data = await record.data.json();
          if (record.author !== this.myDid) num_outside_author++;
          const list = { record, data, id: record.id };
          outlist.push(list);
        }
        console.log(
          "dwnQuerySelfallJSONData ~  num_outside_author=" +
            num_outside_author +
            "  outlist:",
          outlist,
        );
        return outlist;
      }
    } catch (e) {
      console.log("dwnQuerySelfallJSONData ~ e:", e);

      return undefined;
    }
  }

  async dwnQuerySelfForAnyRecordsWrittenByOthers() {
    try {
      const { records } = await this.web5.dwn.records.query({
        message: {
          filter: {
            dataFormat: "application/json",
          },
        },
      });

      if (records) {
        //console.log("dwnQuerySelfForAnyRecordsWrittenByOthers ~ records:", records)
        const outlist: Array<{
          record: Record;
          data: any;
          id: string;
        }> = [];
        for (const record of records) {
          const data = await record.data.json();
          const list = { record, data, id: record.id };
          if (data.author !== this.myDid) outlist.push(list);
        }
        console.log(
          "dwnQuerySelfForAnyRecordsWrittenByOthers,",
          outlist.length,
          "records from OTHERS outlist:",
          outlist,
        );
        return outlist;
      }
    } catch (e) {
      console.log("dwnQuerySelfForAnyRecordsWrittenByOthers ~ e:", e);

      return undefined;
    }
  }

  async dwnReadSelfProfile() {
    console.log(
      "dwnReadSelfProfile ~ protocol:",
      protocols["selfProfileProtocol"].protocol,
    );
    try {
      const { record, status } = await this.web5.dwn.records.read({
        message: {
          filter: {
            protocol: protocols["selfProfileProtocol"].protocol,
          },
        },
      });
      console.log("dwnReadSelfProfile ~ record:", record);
      return await record.data.json();
    } catch (e) {
      console.log("dwnReadSelfProfile ~ e:", e);

      return undefined;
    }
  }

  async dwnQuerySelfJApplicationsFromOthers() {
    const { records } = await this.web5.dwn.records.query({
      message: {
        filter: {
          schema:
            protocols["jobApplicationSimpleProtocol"].types.japplication.schema,
        },
        dateSort: DateSort.CreatedAscending,
      },
    });
    console.log("JApplication records", records);
    if (!records) return [];
    const japplicationList = [];
    const japplicationList_from_others = [];
    for (const record of records) {
      const data = await record.data.json();
      const list = { record, data, id: record.id };
      console.log(
        "dwnQueryJApplicationsWithoutJob ~ data:",
        JSON.stringify(data),
      );
      japplicationList.push(list);
      if (data.author !== this.myDid) japplicationList_from_others.push(list);
    }
    console.log(
      "🚀 ~ file:  ~ dwnQueryJApplicationsWithoutJob ~ japplicationList:",
      japplicationList,
    );
    console.log(
      "🚀 ~ file:  ~ dwnQueryJApplicationsWithoutJob ~ japplicationList_from_others:",
      japplicationList_from_others,
    );
    return japplicationList_from_others;
  }

  async dwnQueryJApplicationsForJob() {
    const { records } = await this.web5.dwn.records.query({
      message: {
        filter: {
          schema:
            protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].types
              .japplication.schema,
        },
        dateSort: DateSort.CreatedAscending,
      },
    });
    console.log(" dwnQueryJApplicationsForJob() JApplication records", records);

    if (!records) return [];
    const japplicationList = [];
    const japplicationList_from_others = [];
    for (const record of records) {
      const data = await record.data.json();
      const list = { record, data, id: record.id };
      japplicationList.push(list);
      if (data.author !== this.myDid) japplicationList_from_others.push(list);
    }
    console.log(
      "🚀 ~ file:  ~ dwnQueryJApplicationsForJob ~ japplicationList:",
      japplicationList,
    );
    console.log(
      "🚀 ~ file:  ~ dwnQueryJApplicationsForJob ~ japplicationList_from_others:",
      japplicationList_from_others,
    );
  }

  async dwnCreateAndSendJApplicationReplyingToJob(
    recipientDWN: string,
    message: string,
    job_record_id: string,
    additionalData?: {
      [key: string]: any;
    },
  ) {
    //bookmark
    const mmmmessg = "JApplication message: " + message;

    const appdata = {
      "@type": "japplication",
      title: "JApplication " + Math.random(),
      description: mmmmessg,
      author: this.myDid,
      email: this.user.email,
      parent_job: job_record_id,
      recipient: recipientDWN,
      ...additionalData,
    };

    try {
      const { record, status } = await this.web5.dwn.records.create({
        data: appdata,
        message: {
          protocol: protocols["jobApplicationSimpleProtocol"].protocol,
          protocolPath: "japplication",
          schema:
            protocols["jobApplicationSimpleProtocol"].types.japplication.schema,
          dataFormat:
            protocols["jobApplicationSimpleProtocol"].types.japplication
              .dataFormats?.[0],
          recipient: recipientDWN,
        },
      });
      console.log(
        "dwnCreateAndSendJApplicationReplyingToJob ~ record & status:",
        record,
        status,
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
          "dwnCreateAndSendJApplicationReplyingToJob ~ record:",
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
  }

  async dwnCreateAndSendJApplication(recipientDWN: string, message: string) {
    const mmmmessg = "JApplication message: " + message;

    const appdata = {
      "@type": "japplication",
      title: "JApplication " + Math.random(),
      description: mmmmessg,
      author: this.myDid,
      email: this.user.email,
      recipient: recipientDWN,
    };

    try {
      const { record } = await this.web5.dwn.records.create({
        data: appdata,
        message: {
          protocol: protocols["jobApplicationSimpleProtocol"].protocol,
          protocolPath: "japplication",
          schema:
            protocols["jobApplicationSimpleProtocol"].types.japplication.schema,
          dataFormat:
            protocols["jobApplicationSimpleProtocol"].types.japplication
              .dataFormats?.[0],
          recipient: recipientDWN,
        },
      });
      console.log("dwnCreateAndSendJApplication ~ record:", record);

      if (record) {
        const { status: sendStatus } = await record.send(recipientDWN);

        if (sendStatus.code !== 202) {
          console.error(
            " dwnCreateAndSendJApplication() Unable to send to target ",
            JSON.stringify(sendStatus),
          );
          return;
        } else {
          console.log(
            " dwnCreateAndSendJApplication() japplication sent to recipient to " +
              recipientDWN +
              "  sendStatus=" +
              JSON.stringify(sendStatus),
          );
        }
      } else {
        console.log("dwnCreateAndSendJApplication ~ record:", record);
        console.error(
          " dwnCreateAndSendJApplication record should not be undefined",
        );
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async dwnCreateSelfProfileName(name: string) {
    console.log(
      "🚀 ~ file: index.html:588 ~ dwnCreateSelfProfileName ~ inputText:",
      name,
    );

    const industries = [
      "Gaming",
      "Aerospace",
      "Agriculture",
      "Automotive",
      "Banking",
      "Biotechnology",
      "Cryptocurrency",
      "Identity Services",
      "Security",
      "Social Media",
    ];

    const profileData = {
      "@type": "selfprofile",
      name: name,
      author: this.myDid,
      country: faker.location.country(),
      industry: industries[Math.floor(Math.random() * industries.length)],
    };
    console.log("dwnCreateSelfProfileName ~ profileData:", profileData);

    try {
      const { record } = await this.web5.dwn.records.create({
        data: profileData,
        message: {
          protocol: protocols["selfProfileProtocol"].protocol,
          protocolPath: "selfprofile",
          schema: protocols["selfProfileProtocol"].types.selfprofile.schema,
          dataFormat:
            protocols["selfProfileProtocol"].types.selfprofile.dataFormats?.[0],
          published: true,
        },
      });

      if (record)
        console.log(
          "dwnCreateSelfProfileName ~   protocol: " +
            protocols["selfProfileProtocol"].protocol +
            " record inputText=" +
            name +
            "create SUCCESS  ",
          record,
        );

      return record;
    } catch (e) {
      console.log(
        "🚀 ~ file: index.html:611 ~ dwnWriteTextRecord ~ ERROR :",
        e,
      );
    }
  }

  async dwnCreateJobPostAgainstCompany(data: any) {
    console.log("dwnCreateJobPost ~ data:", JSON.stringify(data));

    const jobdata = {
      "@type": "jobPost",
      rando: Math.random(),
      author: this.myDid,
      ...data,
    };

    console.log("dwnCreateJobPost ~ jobdata:", jobdata);

    try {
      const { record, status } = await this.web5.dwn.records.create({
        data: jobdata,
        message: {
          protocol:
            protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].protocol,
          protocolPath: "jobPost",
          schema:
            protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].types
              .jobPost.schema,
          dataFormat:
            protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].types
              .jobPost.dataFormats?.[0],
          published: true,
        },
      });
      if (status.code !== 202) {
        throw new Error("failed to create job post: " + status.detail);
      }
      console.log(
        "dwnCreateJobPost protocol: " +
          protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"].protocol +
          " create SUCCESS  ",
        record,
      );

      return record;
    } catch (e) {
      console.log("dwnCreateJobPost ~ e:", e);
      throw new Error(`${e}`);
    }
  }
}

// async dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords() {
//   try {
//     const { records } = await this.web5.dwn.records.query({
//       message: {
//         filter: {
//           dataFormat: "application/json",
//         },
//       },
//     });
//
//     if (records) {
//       //console.log("dwnQuerySelfForAnyRecordsWrittenByOthers ~ records:", records)
//       const outlist: Array<{
//         record: Record;
//         data: any;
//         id: string;
//       }> = [];
//       for (const record of records) {
//         const data = await record.data.json();
//         const list = { record, data, id: record.id };
//         if (data.author !== this.myDid) {
//           outlist.push(list);
//           console.log(
//               "dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords() data.parentId=" +
//               data.parentId +
//               "  of data=" +
//               JSON.stringify(data) +
//               " also record:",
//               record,
//           );
//         }
//       }
//       console.log(
//           "dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords ~ " +
//           outlist.length +
//           " records from OTHERS outlist:",
//           outlist,
//       );
//       return outlist;
//     }
//   } catch (e) {
//     console.log(
//         "dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords ~ e:",
//         e,
//     );
//
//     return undefined;
//   }
// }
