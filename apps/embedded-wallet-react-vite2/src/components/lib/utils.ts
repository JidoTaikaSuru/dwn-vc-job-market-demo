import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import {  web5 , myDid, user_agent, user, DEBUGING } from "@/lib/common.ts";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export const applicationProtocolWithoutDirectJobLink = JSON.parse(`{
  "protocol": "https://didcomm.org/uris/that/dont/resolve/are/funny/applicationProtocolWithoutDirectJobLink",
    "published": true,
    "types": {
      "japplication": {
        "schema": "https://didcomm.org/uris/that/dont/resolve/are/funny/japplication.json",
        "dataFormats": ["application/json"]
      }
    },
    "structure": {
      "japplication": {
        "$actions": [
          {
            "who": "author",
            "of": "japplication",
            "can": "read"
          },
          {
            "who": "author",
            "of": "japplication",
            "can": "write"
          },
          {
            "who": "recipient",
            "of": "japplication",
            "can": "read"
          },
          {
            "who": "anyone",
            "can": "write"
          }
        ]
      }
    }
  }
  `);


  export const selfProfileProtocol = JSON.parse(`{
    "protocol": "https://didcomm.org/uris/that/dont/resolve/are/funny/selfProfileProtocol",
      "published": true,
      "types": {
        "selfprofile": {
          "schema": "https://didcomm.org/uris/that/dont/resolve/are/funny/selfprofile.json",
          "dataFormats": ["application/json"]
        }
      },
      "structure": {
        "selfprofile": {
          "$actions": [
            {
              "who": "author",
              "of": "selfprofile",
              "can": "write"
            },
            {
              "who": "anyone",
              "can": "read"
            }
          ]
        }
      }
    }
    `);



    export const  jobPostThatCanTakeApplicationsAsReplyProtocol = JSON.parse(`{
      "protocol": "https://didcomm.org/uris/that/dont/resolve/are/funny/jobPostProtocol",
        "published": true,
        "types": {
          "jobPost": {
            "schema": "https://didcomm.org/uris/that/dont/resolve/are/funny/jobPost.json",
            "dataFormats": ["application/json"]
          },
          "japplication": {
            "schema": "https://didcomm.org/uris/that/dont/resolve/are/funny/japplication.json",
            "dataFormats": ["application/json"]
          }
        },
        "structure": {
          "jobPost": {
            "$actions": [
              {
                "who": "author",
                "of": "jobPost",
                "can": "write"
              },
              {
                "who": "anyone",
                "can": "read"
              }
            ],
            "japplication": {
              "$actions": [
                {
                  "who": "author",
                  "of": "japplication",
                  "can": "read"
                },
                {
                  "who": "recipient",
                  "of": "japplication",
                  "can": "read"
                },
                {
                  "who": "anyone",
                  "can": "write"
                }
              ]
            }
          }
        }
      }
    
      `);


  //@ts-ignore
  export const configureProtocol = async (protocolDefinition) => {
    // query the list of existing protocols on the DWN
    const { protocols, status } = await web5.dwn.protocols.query({
        message: {
            filter: {
                protocol: protocolDefinition.protocol,
            }
        }
    });
  
    if(status.code !== 200) {
        alert('Error querying protocols');
        console.error('Error querying protocols', status);
        return;
    }
  
    // if the protocol already exists, we return
    if(protocols.length > 0) {
        console.log('Protocol already exists');
        return;
    }
  
    // configure protocol on local DWN
    const { status: configureStatus, protocol } = await web5.dwn.protocols.configure({
        message: {
            definition: protocolDefinition,
        }
    });
  
      
  
    console.log('Protocol configured', configureStatus, protocol);
  }
  
  
    //@ts-ignore
    export const dwnQueryOtherDWN = async(fromDWN, protocol) => {
      let i_protocol=protocol;
      if( protocol.protocol  )
      i_protocol=protocol.protocol;

        console.log("🚀 ~  dwnQueryOtherDWN()  about to query fromDWN "+fromDWN+" for "+JSON.stringify(protocol))
        // Reads the indicated record from Bob's DWNs
        try { 
          const { records } = await web5.dwn.records.query({
            from: fromDWN,
            message: {
              filter:{
                protocol: i_protocol
  
              }
            }
          });


      // assuming the record is a json payload


      if(records){

        if(DEBUGING)
            console.log("🚀 ~ file: utils.ts:181 ~ dwnQueryOtherDWN ~ records:", records)


        let outdata =[];


        for (let i = 0; i < records.length; i++) {

          const record=  records[i];
          const  d = await records[i].data.json()  ;
          outdata.push( {record_id:record.id,...d } )
        }

      //@ts-ignore
      return outdata; 
    }
    else {

      return undefined;
    }

    
        } catch (e ){
        console.log("🚀 ~ file: utils.ts:203 ~ dwnQueryOtherDWN ~ e:", e)
        
          return undefined;
        }
  
    }

    //@ts-ignore
    export const dwnReadOtherDWNRecord  = async(fromDWN, protocol) => {
      let i_protocol=protocol
  
        if( protocol.protocol  )
          i_protocol=protocol.protocol;
  
        console.log("🚀 ~  dwnReadOtherDWN()  fromDWN "+fromDWN+" for "+JSON.stringify(i_protocol))
        // Reads the indicated record from Bob's DWNs
        return await web5.dwn.records.read({
            from: fromDWN,
            message: {
              filter:{
                protocol: i_protocol,
  
              }
            }
          });
  
    }

  //@ts-ignore
  export const dwnReadOtherDWN  = async(fromDWN, protocol) => {
    let i_protocol=protocol

      if( protocol.protocol  )
        i_protocol=protocol.protocol;
      

      console.log("🚀 ~  dwnReadOtherDWN()  fromDWN "+fromDWN+" for "+JSON.stringify(i_protocol))
      // Reads the indicated record from Bob's DWNs
      try { 
        const { record } = await web5.dwn.records.read({
          from: fromDWN,
          message: {
            filter:{
              protocol: i_protocol,

            }
          }
        });
        console.log("🚀 ~ file: index.html:421 ~ dwnReadOtherDWN ~ record:", record)
    // assuming the record is a json payload
    const data = await record.data.json();
    console.log("🚀 ~ file: index.html:421 ~ dwnReadOtherDWN ~ data:", data)
    return data; 
      } catch (e ){
        console.log("🚀 ~ file: DwnJobListingDrilldown.tsx:190 ~ dwnReadOtherDWN ~ e:", e)
        return undefined;
      }

  }


    //@ts-ignore
    export const dwnQuerySelf  = async(protocol) => {
      if(typeof protocol !== "string" && typeof protocol === "object"){
            if( protocol.protocol && protocol.protocol  === "string"  ){
              protocol=protocol.protocol;
           
            }
      }
      console.log("🚀 ~ file: utils.ts:200 ~ dwnQuerySelf ~ protocol:", protocol)
      try { 
        const { records } = await web5.dwn.records.query({
          message: {
            filter:{
              protocol: protocol,
            }
          }
        });
        console.log("🚀 ~ file: utils.ts:200 ~ dwnQuerySelf ~ records:", JSON.stringify(records))

    if(records){
    const outlist=[];
    for (const record of records) {
        const data = await record.data.json();
        const list = {record, data, id: record.id};
        outlist.push(list);
    }
    return outlist;
  }
    return undefined; 
      } catch (e ){
      console.log("🚀 ~ file: utils.ts:205 ~ dwnQuerySelf ~ e:", e)

        return undefined;
      }

  }


      //@ts-ignore
    export const dwnQuerySelfallJSONData  = async() => {
      

        try { 
          const { records } = await web5.dwn.records.query({
            from: myDid,
            message: {
              filter:{
                dataFormat: 'application/json',
              }
            }
          });

          console.log("🚀 ~ file:  ~ dwnQuerySelfallJSONData ~ records:", JSON.stringify(records))

          if(records){
          const outlist=[];
          let num_outside_author=0;
          for (const record of records) {
              const data = await record.data.json();
              if(record.author !==myDid)
                  num_outside_author++;
              const list = {record, data, id: record.id};
              outlist.push(list);
          }
          console.log("🚀 ~ file: utils.ts:333 ~ dwnQuerySelfallJSONData ~  num_outside_author="+num_outside_author+"  outlist:", outlist)
          return outlist;
         
        } 
      }
      catch (e ){
        console.log("🚀 ~ file: utils.ts:244 ~ dwnQuerySelfallJSONData ~ e:", e)

  
          return undefined;
        }
  
    }



   //@ts-ignore
   export const dwnQuerySelfForAnyRecordsWrittenByOthers  = async() => {
      

    try { 
      const { records } = await web5.dwn.records.query({
        message: {
          filter:{
            dataFormat: 'application/json',
          }
        }
      });



      if(records){
        console.log("🚀 ~ file: utils.ts:369 ~ dwnQuerySelfForAnyRecordsWrittenByOthers ~ records:", records)
      const outlist=[];
      for (const record of records) {
          const data = await record.data.json();
          const list = {record, data, id: record.id};
              if(record.author !==myDid)
          outlist.push(list);
      }
      console.log("🚀 ~ file: utils.ts:378 ~ dwnQuerySelfForAnyRecordsWrittenByOthers ~ "+outlist.length+" records from OTHERS outlist:", outlist)
      return outlist;
     
    } 
  }
  catch (e ){
    console.log("🚀 ~ file: utils.ts:383 ~ dwnQuerySelfForAnyRecordsWrittenByOthers ~ e:", e)


      return undefined;
    }

}





  export const dwnCreateAndSendJApplication = async (recipientDWN:string , message:string) => {
    

    const mmmmessg="JApplication message: "+message;

    let email=""
    if(user && user.email){
      email=user.email;

    }
    const sharedListData = {
        "@type": "japplication",
        "title": "JApplication "+Math.random(),
        "description": mmmmessg,
        "author": myDid,
        "email":email,
        "recipient": recipientDWN,
    }

    try {
        const { record } = await web5.dwn.records.create({
            data: sharedListData,
            message: {
                protocol: applicationProtocolWithoutDirectJobLink.protocol,
                protocolPath: 'japplication',
                schema: applicationProtocolWithoutDirectJobLink.types.japplication.schema,
                dataFormat: applicationProtocolWithoutDirectJobLink.types.japplication.dataFormats[0],
                recipient: recipientDWN
            }
        });
        console.log("🚀 ~ file: utils.ts:302 ~ dwnCreateAndSendJApplication ~ record:", record)


        if(record ){
        const { status: sendStatus } = await record.send(recipientDWN);

        if (sendStatus.code !== 202) {
            console.error(" dwnCreateAndSendJApplication() Unable to send to target ", JSON.stringify(sendStatus));
            return;
        }
        else {
            console.log(" dwnCreateAndSendJApplication() japplication sent to recipient to "+recipientDWN+"  sendStatus="+JSON.stringify(sendStatus));
        }
      }
      else{
        console.log("🚀 ~ file: utils.ts:302 ~ dwnCreateAndSendJApplication ~ record:", record)
        console.error(" dwnCreateAndSendJApplication record should not be undefined"); 
      }
    } catch (e) {
        console.error(e);
        return;
    }

  }


  
  export async function dwnCreateSelfProfileName(inputText:string) {
    console.log("🚀 ~ file: index.html:588 ~ dwnCreateSelfProfileName ~ inputText:", inputText)
  
      const profiledata = {
          "@type": "selfprofile",
          "name": inputText,
          "author": myDid,
      }
  
      try {
          const { record } = await web5.dwn.records.create({
              data: profiledata,
              message: {
                  protocol: selfProfileProtocol.protocol,
                  protocolPath: 'selfprofile',
                  schema: selfProfileProtocol.types.selfprofile.schema,
                  dataFormat: selfProfileProtocol.types.selfprofile.dataFormats[0],
                  published: true
              }
  
          });
  
          if(record)
            console.log("🚀 ~ file: utils.ts:238 ~ dwnCreateSelfProfileName ~   protocol: "+selfProfileProtocol.protocol+" record inputText="+inputText+"create SUCCESS  ", record)

      return record;
      }
      catch(e){
        console.log("🚀 ~ file: index.html:611 ~ dwnWriteTextRecord ~ ERROR :", e)
        
      }
  }


  //@ts-ignore
  export async function dwnCreateJobPost(data) {
  console.log("🚀 ~ file: utils.ts:292 ~ dwnCreateJobPost ~ data:", JSON.stringify(data))


  
      const profiledata = {
          "@type": "selfprofile",
          "rando": Math.random(),
          "author": myDid,
          ...data
      }
  
      try {
          const { record } = await web5.dwn.records.create({
              data: profiledata,
              message: {
                  protocol: jobPostThatCanTakeApplicationsAsReplyProtocol.protocol,
                  protocolPath: 'jobPost',
                  schema: jobPostThatCanTakeApplicationsAsReplyProtocol.types.jobPost.schema,
                  dataFormat: jobPostThatCanTakeApplicationsAsReplyProtocol.types.jobPost.dataFormats[0],
                  published: true
              }
  
          });
  
          if(record)
            console.log("🚀 ~ file:  ~  dwnCreateJobPost protocol: "+jobPostThatCanTakeApplicationsAsReplyProtocol.protocol+" create SUCCESS  ", record)

      return record;
      }
      catch(e){
      console.log("🚀 ~ file: utils.ts:322 ~ dwnCreateJobPost ~ e:", e)

        
      }
  }
  

  

