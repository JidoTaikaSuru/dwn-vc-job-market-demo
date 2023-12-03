import { createClient } from "@supabase/supabase-js";
import { Database } from "@/__generated__/supabase-types";
import { SupabaseCredentialManager } from "@/lib/credentialManager.ts";
import { Web5, Web5ConnectOptions } from "@web5/api/browser";
import { protocols } from "@/lib/protocols.ts";
import { DwnClient } from "@/lib/web5Client.ts";
import { configureProtocol } from "@/lib/utils.ts";

export const did_db_table = "dwn_did_registry_2";
export const DEBUGGING = false;
export const LOCAL_DWN = false;
export const supabaseClient = createClient<Database>(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0",
);
export const credentialStore = new SupabaseCredentialManager();

export const getWeb5Connection = async () => {
  const options: Web5ConnectOptions = {
    sync: "10s",
  };
  // if (LOCAL_DWN) {
  //   options.techPreview = {
  //     // See README.md for setup instructions
  //     dwnEndpoints: [
  //       // "http://localhost:3000/",
  //       "http://localhost:3001/",
  //       "http://localhost:3002/",
  //       "http://localhost:3003/",
  //     ],
  //   };
  // }
  console.log("Starting web5 connection with options: ", options);
  const web5Connection = await Web5.connect(options);
  for (const protocol of Object.values(protocols)) {
    await configureProtocol(web5Connection.web5, protocol);
  }
  console.log("web5 connection established", web5Connection);
  return web5Connection;
};

export const getWeb5Client = async () => {
  const { web5, did: myDid } = await getWeb5Connection();
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) throw new Error("No user");
  return new DwnClient({ web5, user: data.user, myDid });
};
