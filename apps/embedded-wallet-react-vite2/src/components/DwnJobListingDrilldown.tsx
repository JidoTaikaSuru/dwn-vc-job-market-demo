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
        }
          `);


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
