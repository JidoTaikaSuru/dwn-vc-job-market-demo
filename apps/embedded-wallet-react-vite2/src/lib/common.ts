import { createClient } from "@supabase/supabase-js";
import { Database } from "@/__generated__/supabase-types";
import { SupabaseCredentialManager } from "@/lib/client";
import { Web5 } from "@web5/api/browser";
//import { Web5 } from "@web5/api";
import { applicationProtocolWithoutDirectJobLink, configureProtocol, dwnCreateAndSendJApplication, dwnCreateJobPost, dwnCreateSelfProfileName, dwnQueryOtherDWN, dwnQuerySelf, dwnQuerySelfallJSONData, dwnReadOtherDWN, jobPostThatCanTakeApplicationsAsReplyProtocol, selfProfileProtocol } from "@/components/lib/utils";


export const DEBUGING=false;
const did_db_table='dwn_did_registry_2';


export const supabaseClient = createClient<Database>(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0",
);
export const credentialStore = new SupabaseCredentialManager();


export const { web5, did: myDid } = await Web5.connect({ sync: "5s" });
console.log("🚀 ~ file: common.ts:17 ~ web5:", web5)


export const { data: { user } } = await supabaseClient.auth.getUser()


export const { data: public_dwn_did_list } = await supabaseClient
.from(did_db_table)
.select('*')

export let user_agent="";
if(window.navigator.userAgent )
  user_agent = window.navigator.userAgent;

let location=""
let ip_info="";
fetch('https://ipinfo.io/json')
  .then(res => res.json())
  .then(data => { 
    console.log('Response', data);
     ip_info=data ; 
     if(ip_info && ip_info.city )
         location=ip_info.city;
    } )



  
  export async function didCreate() {


    const { data: { user } } = await supabaseClient.auth.getUser()

    let label= ""

   if(user && user.email  && myDid && web5){
        console.log("🚀 ~ file: common.ts:34 ~ initMyTestingData ~ user:", user.email)
        label=user.email;
        const curnamerecord = await dwnQuerySelf(selfProfileProtocol.protocol);
        console.log("🚀 ~ file: common.ts:31 ~ initMyTestingData ~ curnamerecord:", curnamerecord)
        if(!curnamerecord || curnamerecord.length==0)
            await dwnCreateSelfProfileName(user.email)

   }

      const { data:data_after_insert, error } = await supabaseClient
    .from(did_db_table)
    .upsert(
      { did: myDid, protocol_list: {"lol":["lol"]} , label:label, ip_info_jsonb:ip_info  , user_agent:user_agent , updated_client_side_time: (new Date()).toISOString()},
    )
    .select()

    console.log("data_after_insert: "+JSON.stringify(data_after_insert))
    console.log("did_db_table error: "+JSON.stringify(error))
  
    
      return myDid;
  
  
    }


await didCreate();


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
await dwnQuerySelfallJSONData();
   }
}


export const spamEveryDWNwithAJobApplication  = async() => {


      if(public_dwn_did_list){   
      for (let i = 0; i < public_dwn_did_list.length; i++) {  //TODO remove  trying to apply for a job at every DID DWN  we know of  no matter if they have a job or the protocol installed 
        const element=public_dwn_did_list[i]
        if(element.did){
          await dwnCreateAndSendJApplication(element.did)
        }
      }

 

    }

}

export let dids_with_names=[];

export const testStuffOnAllDWNs  = async() => {


  if(public_dwn_did_list){   

    let count_dwn_with_a_name=0;
    dids_with_names=[]
  for (let i = 0; i < public_dwn_did_list.length; i++) {  //TODO remove  trying to apply for a job at every DID DWN  we know of  no matter if they have a job or the protocol installed 
    const element=public_dwn_did_list[i]
    if(element.did){
      const data = await dwnReadOtherDWN(element.did,selfProfileProtocol)

      //if(data && data.length > 0 && data[0].name  ){
        if(data &&   data.name  ){
            console.log("🚀 ~ file: common.ts:190 ~ data:", data)
          count_dwn_with_a_name++;
          dids_with_names.push({did:element.did,  name:data.name })
      }

    }
  }
  console.log( " %%%$$$###  out of "+public_dwn_did_list.length+" DWN's we found "+count_dwn_with_a_name+" that have a name ")

console.log("🚀 ~   dids_with_names:", dids_with_names)



}

}




if(DEBUGING){

    await initMyTestingData();
    await testStuffOnAllDWNs();

}
