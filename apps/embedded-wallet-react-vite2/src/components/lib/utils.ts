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



export const cvPersonalStorageProtocol = JSON.parse(`{
  "protocol": "https://didcomm.org/uris/that/dont/resolve/are/funny/cvPersonalStorageProtocol",
    "published": true,
    "types": {
      "cvPersonalStorage": {
        "schema": "https://didcomm.org/uris/that/dont/resolve/are/funny/cvPersonalStorage.json",
        "dataFormats": ["application/json"]
      }
    },
    "structure": {
      "cvPersonalStorage": {
        "$actions": [
          {
            "who": "author",
            "of": "cvPersonalStorage",
            "can": "read"
          },
          {
            "who": "author",
            "of": "cvPersonalStorage",
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
        console.log('Protocol already exists and configured , '+protocolDefinition.protocol);
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
    export const dwnQuerySelfGetAllCV  = async() => {
        const protocol = cvPersonalStorageProtocol.protocol;
      

      try { 
        const { records } = await web5.dwn.records.query({
          message: {
            filter:{
              protocol: protocol,
            },
          }
        });
        console.log("🚀 ~ file: utils.ts:200 ~ dwnQuerySelfGetAllCV ~ records:", JSON.stringify(records))

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
    export const dwnAddVCToDWNIfNotExists  = async(vcdata) => {

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
      const protocol = cvPersonalStorageProtocol.protocol;
    
      if(  vcdata && vcdata.id &&  vcdata.issuer  && vcdata.issuer.id)
      {
      

    try { 
      const { records } = await web5.dwn.records.query({ //TODO this should not query everything every time there must be some cleaner way to filter out just one record matching by the conent of that record 
        message: {
          filter:{
            protocol: protocol,
          },
        }
      });
      console.log("🚀 ~ file: utils.ts:200 ~ dwnAddVCToDWNIfNotExists ~ records:", JSON.stringify(records))


      if(records){

      for (const record of records) {
          const data = await record.data.json();
          if( data && data.vc && data.vc.id && data.vc.id === vcdata.id  &&  data.vc.issuer && data.vc.issuer.id === vcdata.issuer.id ){


            const list = {record, data, id: record.id};
            return list;
          } 

      }
    }

      //Bookmark old 

      const dwn_vc_data = {
        "@type": "cvPersonalStorage",
        "author": myDid,
        "vc":{...vcdata}
    }
    const { record } = await web5.dwn.records.create({
      data: dwn_vc_data,
      message: {
          protocol: protocol,
          protocolPath: 'cvPersonalStorage',
          schema: cvPersonalStorageProtocol.types.cvPersonalStorage.schema,
          dataFormat: cvPersonalStorageProtocol.types.cvPersonalStorage.dataFormats[0],
          published: true
      }

  });

    if( record && record.id ){
      const rout = {record, dwn_vc_data, id: record.id};
      return rout
    }
    else {
      console.error("dwnAddVCToDWNIfNotExists() record not created")
      return undefined;
    }


   } catch (e ){
    console.log("🚀 ~ file: utils.ts:205 ~ dwnAddVCToDWNIfNotExists() ~ e:", e)
      return undefined;
    }
      } 
      else {
          console.error(" dwnAddVCToDWNIfNotExists()  VC missing one of the requred fields   vcdata.id &&  vcdata.issuer  && vcdata.issuer.id ")
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
        //console.log("🚀 ~ file: utils.ts:369 ~ dwnQuerySelfForAnyRecordsWrittenByOthers ~ records:", records)
      const outlist=[];
      for (const record of records) {
          const data = await record.data.json();
          const list = {record, data, id: record.id};
              if(data.author !==myDid)
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


export const dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords  = async() => {
      

  try { 
    const { records } = await web5.dwn.records.query({
      message: {
        filter:{
          dataFormat: 'application/json',
        }
      }
    });



    if(records){
      //console.log("🚀 ~ file: utils.ts:369 ~ dwnQuerySelfForAnyRecordsWrittenByOthers ~ records:", records)
    const outlist=[];
    for (const record of records) {
        const data = await record.data.json();
        const list = {record, data, id: record.id};
            if(data.author !==myDid){
                outlist.push(list);
                console.log("dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords() data.parentId=" +data.parentId+"  of data="+JSON.stringify(data)+ " also record:",record);

            }
    }
    console.log("🚀 ~ file: utils.ts:378 ~ dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords ~ "+outlist.length+" records from OTHERS outlist:", outlist)
    return outlist;
   
  } 
}
catch (e ){
  console.log("🚀 ~ file: utils.ts:383 ~ dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords ~ e:", e)


    return undefined;
  }

}


export async function dwnQueryJApplicationsWithoutJob() {

  const{ records } = await web5.dwn.records.query({
      message: {
          filter: {
              schema: applicationProtocolWithoutDirectJobLink.types.japplication.schema,
          },
          dateSort: 'createdAscending'
      }
  });
  console.log("JApplication records", records);

  const japplicationList=[];
  for (const record of records) {
      const data = await record.data.json();
      const list = {record, data, id: record.id};
      const record_author = record.author; 
      console.log("🚀 ~ file: utils.ts:581 ~ dwnQueryJApplicationsWithoutJob ~ data:", JSON.stringify(data))
      japplicationList.push(list);
  }
  console.log("🚀 ~ file:  ~ dwnQueryJApplicationsWithoutJob ~ japplicationList:", japplicationList)
};




export async function dwnQueryJApplicationsForJob() {

  const{ records } = await web5.dwn.records.query({
      message: {
          filter: {
              schema: applicationProtocolWithoutDirectJobLink.types.japplication.schema,
          },
          dateSort: 'createdAscending'
      }
  });
  console.log("JApplication records", records);

  const japplicationList=[];
  for (const record of records) {
      const data = await record.data.json();
      const list = {record, data, id: record.id};
      japplicationList.push(list);
  }
  console.log("🚀 ~ file:  ~ dwnQueryJApplicationsForJob ~ japplicationList:", japplicationList)
};





export const dwnCreateAndSendJApplicationReplyingToJob = async (recipientDWN:string , message:string, job_record_id:string) => {
    

  const mmmmessg="JApplication message: "+message+" replying to job_record_id parentid="+job_record_id;

  let email=""
  if(user && user.email){
    email=user.email;

  }
  const jobapp = {
    "@type": "japplication",
      "title": "JApplication "+Math.random(),
      "description": mmmmessg,
      "author": myDid,
      "email":email,
      "recipient": recipientDWN,
      "parentId":job_record_id
  }

  try {
      const { record, status: createStatus } = await web5.dwn.records.create({
          data: jobapp,
          message: {
              protocolPath: 'jobPost/japplication',
              protocol: jobPostThatCanTakeApplicationsAsReplyProtocol.protocol,
              schema: jobPostThatCanTakeApplicationsAsReplyProtocol.types.japplication.schema,
              dataFormat: jobPostThatCanTakeApplicationsAsReplyProtocol.types.japplication.dataFormats[0],
              parentId:job_record_id,
              contextId:job_record_id,
              recipient: recipientDWN
          }
      });
      console.log("🚀 ~ file: utils.ts ~ dwnCreateAndSendJApplicationReplyingToJob ~ record:", record , createStatus)


      if(record ){
      const { status: sendStatus } = await record.send(recipientDWN);

      if (sendStatus.code !== 202) {
          console.error(" dwnCreateAndSendJApplicationReplyingToJob() Unable to send to target ", JSON.stringify(sendStatus));
          return;
      }
      else {
          console.log(" dwnCreateAndSendJApplicationReplyingToJob() japplication sent to recipient to "+recipientDWN+"  sendStatus="+JSON.stringify(sendStatus));
      }
    }
    else{
      console.log("🚀 ~ file: utils.ts ~ dwnCreateAndSendJApplicationReplyingToJob ~ record:", record)
      console.error(" dwnCreateAndSendJApplicationReplyingToJob record should not be undefined"); 
    }
  } catch (e) {
      console.error(e);
      return;
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


  
      const jobdata = {
          "@type": "jobPost",
          "rando": Math.random(),
          "author": myDid,
          ...data
      }
  
      try {
          const { record } = await web5.dwn.records.create({
              data: jobdata,
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
  

  

