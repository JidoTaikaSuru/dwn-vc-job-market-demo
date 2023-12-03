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

export const web5ConnectSelector = selector({
  key: "web5ConnectSelector",
  get: async ({ get }) => {
    console.log("initializing web5 components");
    const { web5, did: myDid } = await getWeb5Connection();
    const { user } = get(getSupabaseUserSelector);
    if (!user) throw new Error("No user");
    const client = new DwnClient({ web5, user, myDid });
    for (const protocol of Object.values(protocols)) {
      await configureProtocol(web5, protocol);
    }
    return { web5, myDid, protocols: protocols, web5Client: client };
  },
});

const getSupabaseUserSelector = selector({
  key: "getSupabaseUserSelector",
  get: async () => {
    const { data } = await supabaseClient.auth.getUser();
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
export const dwnReadOtherDWNSelector = selectorFamily<
  any | undefined,
  {
    fromDWN: string;
    protocol: ProtocolDefinition;
  }
>({
  key: "dwnReadOtherDWN",
  get:
    ({ fromDWN, protocol }) =>
    async ({ get }) => {
      const { web5Client } = get(web5ConnectSelector);
      return await web5Client.dwnReadOtherDWN(fromDWN, protocol);
    },
});
export const dwnReadSelfReturnRecordAndDataSelector = selector<
  DwnListType | undefined
>({
  key: "dwnReadSelfReturnRecordAndData",
  get: async ({ get }) => {
    const { web5Client } = get(web5ConnectSelector);
    return await web5Client.dwnReadSelfReturnRecordAndData();
  },
});

export const dwnReadSelfProfile = selectorFamily<
  any,
  {
    did?: string;
  }
>({
  key: "dwnReadSelfProfile",
  get:
    ({ did }) =>
    async ({ get }) => {
      const { web5Client } = get(web5ConnectSelector);
      if (!did) return undefined;
      return await web5Client.dwnQueryOtherDWNByProtocol(
        did,
        protocols["selfProfileProtocol"],
      );
    },
});

export const dwnGetCompanyJobsSelector = selectorFamily<
  any,
  {
    did?: string;
  }
>({
  key: "dwnGetCompanyJobs",
  get:
    ({ did }) =>
    async ({ get }) => {
      const { web5Client } = get(web5ConnectSelector);
      if (!did) return undefined;
      return await web5Client.dwnQueryOtherDWNByProtocol(
        did,
        protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
      );
    },
});
