import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Web5 } from "@web5/api/browser";

export const DwnJobListingDrilldown: FC = () => {
  const { employerDid } = useParams();

  const [sendStatus, setSendStatus] = useState<string | undefined>();

  useEffect(() => {
    const runWeb5 = async () => {
      const { web5, did: myDid } = await Web5.connect({ sync: "5s" });



     let applicationProtocolWithoutDirectJobLink = JSON.parse(`{
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


      let selfProfileProtocol = JSON.parse(`{
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



        let jobPostThatCanTakeApplicationsAsReplyProtocol = JSON.parse(`{
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
      const configureProtocol = async (protocolDefinition) => {
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
      
      
      await configureProtocol(selfProfileProtocol );
      await configureProtocol(applicationProtocolWithoutDirectJobLink );
      //await configureProtocol(jobPostThatCanTakeApplicationsAsReplyProtocol );
      


      //@ts-ignore
      async function dwnQueryOtherDWN(fromDWN, protocol) {

          console.log("🚀 ~ file:  about to query fromDWN "+fromDWN+" for "+JSON.stringify(protocol))
          // Reads the indicated record from Bob's DWNs
          try { 
            const { record } = await web5.dwn.records.read({
              from: fromDWN,
              message: {
                filter:{
                  protocol: protocol,

                }
              }
            });
            console.log("🚀 ~ file: index.html:421 ~ dwnQueryOtherDWNgetName ~ record:", record)
        // assuming the record is a json payload
        const data = await record.data.json();
        console.log("🚀 ~ file: index.html:421 ~ dwnQueryOtherDWNgetName ~ data:", data)
        return data; 
          } catch (e ){
            console.log("🚀 ~ file: DwnJobListingDrilldown.tsx:190 ~ dwnQueryOtherDWN ~ e:", e)
            return undefined;
          }
   
      }

      let gotAName= await dwnQueryOtherDWN(employerDid,selfProfileProtocol.protocol)
      console.log("🚀 ~ file: DwnJobListingDrilldown.tsx:198 ~ runWeb5 ~ gotAName:", gotAName)

      let gotAllJobPosts= await dwnQueryOtherDWN(employerDid,jobPostThatCanTakeApplicationsAsReplyProtocol.protocol)
      console.log("🚀 ~ file: DwnJobListingDrilldown.tsx:201 ~ runWeb5 ~ gotAllJobPosts:", gotAllJobPosts)




      await web5.dwn.protocols.query({
        message: {
          filter: {
            protocol: applicationProtocolWithoutDirectJobLink.protocol,
          },
        },
      });

      const { record } = await web5.dwn.records.create({
        data: "Test Application from" + myDid,
        message: {
          protocol: applicationProtocolWithoutDirectJobLink.protocol,
          protocolPath: "japplication",
          schema:
            applicationProtocolWithoutDirectJobLink.types.japplication.schema,
          dataFormat:
            applicationProtocolWithoutDirectJobLink.types.japplication
              .dataFormats[0],
          recipient: employerDid,
        },
      });

      if (record === undefined) {
        console.log("web5.dwn.records.create returns undefined record");
        return;
      }

      if (employerDid !== undefined) {
        const { status: sendStatus } = await record.send(employerDid);

        setSendStatus(sendStatus);
      }
    };

    runWeb5();
  }, []);

  if (!sendStatus) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>{employerDid}</h1>
      <div>Send DID status - + {sendStatus}</div>
    </div>
  );
};
