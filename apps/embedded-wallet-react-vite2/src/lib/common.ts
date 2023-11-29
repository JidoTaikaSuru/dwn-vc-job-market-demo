import { createClient } from "@supabase/supabase-js";
import { Database } from "@/__generated__/supabase-types";
import { SupabaseCredentialManager } from "@/lib/client";
import { Web5 } from "@web5/api/browser";
//import { Web5 } from "@web5/api";
import { applicationProtocolWithoutDirectJobLink, configureProtocol, dwnCreateJobPost, dwnCreateSelfProfileName, dwnQuerySelf, dwnQuerySelfallJSONData, jobPostThatCanTakeApplicationsAsReplyProtocol, selfProfileProtocol } from "@/components/lib/utils";


const DEBUGING=true;

export const supabaseClient = createClient<Database>(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0",
);
export const credentialStore = new SupabaseCredentialManager();


export const { web5, did: myDid } = await Web5.connect({ sync: "5s" });
console.log("🚀 ~ file: common.ts:17 ~ web5:", web5)




export const initMyTestingData  = async() => {

  console.log("trigger rebuild git  go go turbo vercel netlfiy gods give us reuslts")
  console.log("HELLO WORLD, initMyTestingData()")
  const { data: { user } } = await supabaseClient.auth.getUser()

   if(user && user.email  && myDid && web5){
        console.log("🚀 ~ file: common.ts:34 ~ initMyTestingData ~ user:", user.email)
    const curnamerecord = await dwnQuerySelf(selfProfileProtocol.protocol);
    console.log("🚀 ~ file: common.ts:31 ~ initMyTestingData ~ curnamerecord:", curnamerecord)
    if(!curnamerecord || curnamerecord.length==0)
        await dwnCreateSelfProfileName(user.email)

    //@ts-ignore
    const { record:record_plain } = await web5.dwn.records.create({
      data: "hello world text",
      message: {
        dataFormat: 'text/plain',
      },
    });
    console.log("🚀 ~ file: common.ts:27 ~ record_plain:", record_plain)

    //@ts-ignore
    const { record:plainrecords } = await web5.dwn.records.read({
      message: {
        filter:{
          dataFormat:  'text/plain',
        }
      }
    });

    //@ts-ignore
    const { record:insertrecord  } = await web5.dwn.records.create({
      data: {
          content: "Hello World",
          description: "unstable"
      },
      message: {
          dataFormat: 'application/json'
      }
    });
    console.log("🚀 ~ file: common.ts:29 ~ insertrecord:", insertrecord)



    //@ts-ignore
    const { records:josnrecords } = await web5.dwn.records.query({
      message: {
        filter:{
          dataFormat: 'application/json',
        }
      }
    });
    // assuming the record is a json payload
    console.log("🚀 ~ file: common.ts:28 ~ records:", josnrecords)


    await configureProtocol(selfProfileProtocol );
    await configureProtocol(applicationProtocolWithoutDirectJobLink );
    await configureProtocol(jobPostThatCanTakeApplicationsAsReplyProtocol );



  const jobdata ={
    title:"Senior Software Engineer",
    description:"We are looking for a Sr software engineer",
    presentation_definition:`{"id":"bd980aee-10ba-462c-8088-4afdda24ed97","input_descriptors":[{"id":"user has a HasAccount VC issued by us","name":"user has a HasAccount VC issued by us","purpose":"Please provide your HasAccount VC that we issued to you on account creation","constraints":{"fields":[{"path":["$.vc.type"],"filter":{"type":"array","contains":{"type":"string","const":"HasVerifiedEmail"}},"purpose":"Holder must possess HasVerifiedEmail VC"}]}}]}`
  }
await dwnCreateJobPost(jobdata)



   }

}


if(DEBUGING){


await initMyTestingData();
await dwnQuerySelfallJSONData();
}
