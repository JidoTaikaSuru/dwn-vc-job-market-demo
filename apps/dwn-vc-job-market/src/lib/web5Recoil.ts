import { selector, selectorFamily } from "recoil";
import {
  ProtocolDefinition,
  ProtocolsQueryFilter,
} from "@tbd54566975/dwn-sdk-js";
import {
  did_db_table,
  getWeb5Connection,
  supabaseClient,
} from "@/lib/common.ts";
import { DwnClient } from "@/lib/web5Client.ts";
import { protocols } from "@/lib/protocols.ts";
import { configureProtocol, DwnListType, logIfDebug } from "@/lib/utils.ts";
import { User } from "@supabase/supabase-js";

export const web5ConnectSelector = selector({
  key: "web5ConnectSelector",
  get: async ({ get }) => {
    console.log("initializing web5 components");
    const { web5, did: myDid } = await getWeb5Connection();

    const { user } = get(getSupabaseUserSelector);
    const userRec = get(getSupabaseUserTableRecordSelector);

    const dwnClientUser = user || ({} as User); // Hack for when the user isn' signed in
    const client = new DwnClient({ web5, myDid, user: dwnClientUser });
    for (const protocol of Object.values(protocols)) {
      await configureProtocol(web5, protocol);
    }

    if (user) {
      // TODO, this is a hack, which we can remove later
      await supabaseClient.from("users").upsert({
        id: user.id,
        did: myDid,
      });
    }

    return {
      web5,
      myDid,
      protocols: protocols,
      web5Client: client,
      user,
      userRec,
    };
  },
});

const getSupabaseUserSelector = selector({
  key: "getSupabaseUserSelector",
  get: async () => {
    const { data, error } = await supabaseClient.auth.getUser();
    console.log("getSupabaseUserSelector ~ data:", data);
    if (error) {
      console.error("getSupabaseUserSelector ~ error:", error);
      return { user: undefined };
    }
    return data;
  },
});

const getSupabaseUserTableRecordSelector = selector({
  key: "getSupabaseUserTableRecordSelector",
  get: async ({ get }) => {
    const { user } = get(getSupabaseUserSelector);
    if (!user) return undefined;
    const { data, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return data;
  },
});
export const getPublicDwnDidListSelector = selector({
  key: "getPublicDwnDidListSelector",
  get: async () => {
    const { data: public_dwn_did_list } = await supabaseClient
      .from(did_db_table)
      .select("*");

    return public_dwn_did_list;
  },
});

export const dwnQueryOtherDWNSelector = selectorFamily({
  key: "dwnQueryOtherDWN",
  get:
    (props: { fromDWN: string; protocol: ProtocolDefinition }) =>
    async ({ get }) => {
      const { web5Client } = get(web5ConnectSelector);
      return await web5Client.dwnQueryOtherDWNByProtocol(
        props.fromDWN,
        props.protocol,
      );
    },
});
export const dwnQueryOtherDWNArbitraryFilterSelector = selectorFamily<
  Array<DwnListType>,
  {
    fromDWN: string;
    filter: ProtocolsQueryFilter;
  }
>({
  key: "dwnQueryOtherDWN",
  get:
    ({ fromDWN, filter }) =>
    async ({ get }) => {
      const { web5 } = get(web5ConnectSelector);
      console.groupCollapsed("dwnQueryOtherDWNArbitraryFilterSelector");
      console.log("filter", filter);

      // Reads the indicated record from Bob's DWNs
      try {
        const { records } = await web5.dwn.records.query({
          from: fromDWN,
          message: {
            filter: filter,
          },
        });
        if (!records) return [];

        logIfDebug(`dwnQueryOtherDWN ~ records: ${records}`);

        const outdata: Array<DwnListType> = [];

        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const d = await records[i].data.json();
          outdata.push({ data_id: d.id, record_id: record.id, ...d });
        }
        console.groupEnd();
        return outdata;
      } catch (e) {
        console.error("dwnQueryOtherDWN ~ e:", e);
        console.groupEnd();
        return [];
      }
    },
});

export const dwnReadOtherDWNSelector = selectorFamily({
  key: "dwnReadOtherDWN",
  get:
    (props: { did: string; protocol: ProtocolDefinition }) =>
    async ({ get }) => {
      console.groupCollapsed("dwnReadOtherDWNSelector");
      const { web5Client } = get(web5ConnectSelector);
      const res = await web5Client.dwnReadOtherDWN(props.did, props.protocol);
      console.groupEnd();
      return res;
    },
});

export const dwnReadOtherDWNByRecordIdSelector = selectorFamily({
  key: "dwnReadOtherDWN",
  get:
    (props: { did: string; recordId: string; protocol: ProtocolDefinition }) =>
    async ({ get }) => {
      console.groupCollapsed("dwnReadOtherDWNByRecordIdSelector");
      const { web5Client } = get(web5ConnectSelector);
      const res = await web5Client.dwnReadOtherDWNByRecordId(
        props.did,
        props.recordId,
        props.protocol,
      );
      console.groupEnd();
      return res;
    },
});

export const dwnReadSelfProfileSelector = selector({
  key: "dwnReadSelfProfileSelector",
  get: async ({ get }) => {
    const { web5Client } = get(web5ConnectSelector);
    return await web5Client.dwnReadSelfProfile();
  },
});

export const dwnQueryOtherDWNByProtocolSelector = selectorFamily({
  key: "dwnQueryOtherDWNByProtocolSelector",
  get:
    (props: { did: string; protocol: ProtocolDefinition }) =>
    async ({ get }) => {
      const { web5Client } = get(web5ConnectSelector);
      if (!props.did) return undefined;
      return await web5Client.dwnQueryOtherDWNByProtocol(
        props.did,
        props.protocol,
      );
    },
});

export const dwnQuerySelfProfileOtherDwn = selectorFamily({
  key: "dwnQuerySelfProfileOtherDwn",
  get:
    (props: { did: string }) =>
    async ({ get }) => {
      return get(
        dwnQueryOtherDWNByProtocolSelector({
          ...props,
          protocol: protocols["selfProfileProtocol"],
        }),
      );
    },
});

export const dwnQueryJobPostThatCanTakeApplicationsAsReplyProtocolSelector =
  selectorFamily({
    key: "dwnGetCompanyJobs",
    get:
      (props: { did: string }) =>
      async ({ get }) => {
        return get(
          dwnQueryOtherDWNByProtocolSelector({
            ...props,
            protocol:
              protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
          }),
        );
      },
  });

export const dwnQueryOtherDwnForJsonDataSelector = selectorFamily({
  key: "dwnQueryOtherDwnForJsonDataSelector",
  get:
    (props: { did: string }) =>
    async ({ get }) => {
      const { web5Client } = get(web5ConnectSelector);
      return await web5Client.dwnQueryOtherDwnAllJSONData(props);
    },
});

export const dwnQuerySelfByProtocolSelector = selectorFamily({
  key: "dwnQuerySelfByProtocol",
  get:
    (props: { protocol: ProtocolDefinition }) =>
    async ({ get }) => {
      const { web5Client } = get(web5ConnectSelector);
      return await web5Client.dwnQuerySelfByProtocol(props.protocol);
    },
});

// export const dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecordsSelector =
//     selector({
//         key: "dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords",
//         get: async ({ get }) => {
//             const { web5Client } = get(web5ConnectSelector);
//             return await web5Client.dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords();
//         },
//     });
