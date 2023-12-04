import React, { FC } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { IVerifiableCredential } from "@sphereon/ssi-types";
import { APP_NAME } from "@/components/Navbar.tsx";

type CredentialCardProps = {
  // id: string;
  title: string;
  expirationDate: Date;
  issuanceDate: Date;
  description: string;
  howToGet: string;
  userHasCredential: PresentationExchangeStatus;
  // credentials: IVerifiableCredential[];
};

const todayPlus3Months = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d;
};

export enum PresentationExchangeStatus {
  pass = "PASS",
  fail = "FAIL",
  profileView = "PROFILE",
}

export const CredentialToCredentialCard: FC<{
  credential: IVerifiableCredential;
  userHasCredential: PresentationExchangeStatus;
}> = ({ credential, userHasCredential }) => {
  const hasAccountId = "user has a HasAccount VC issued by us";

  console.debug("converting credential to credential card", credential);
  if (
    credential.id === hasAccountId ||
    credential.id?.includes("has-account")
  ) {
    // const matchingVc = getMatchingVc(hasAccountId);
    return (
      <CredentialCard
        title={`Has an account with ${APP_NAME}`}
        expirationDate={new Date(credential.expirationDate || "")}
        issuanceDate={new Date(credential.issuanceDate || "")}
        description={
          "The user has an account with a us, a spam prevention authority"
        }
        howToGet={"You can get it if you wish for it really hard"}
        userHasCredential={userHasCredential}
      />
    );
  } else if (credential.id?.includes("has-verified-email")) {
    return (
      <CredentialCard
        title={`Has a verified email`}
        expirationDate={todayPlus3Months()}
        issuanceDate={new Date(credential.issuanceDate || "")}
        description={
          "The user has passed OTP authentication with us, a spam prevention authority"
        }
        howToGet={"Log into this application w/ OTP"}
        userHasCredential={userHasCredential}
      />
    );
  }
  return (
    <CredentialCard
      title={`Unknown VC ${credential.id}`}
      expirationDate={new Date(credential.expirationDate || "")}
      issuanceDate={new Date(credential.issuanceDate || "")}
      description={"Test description for the VC"}
      howToGet={"You can get it if you wish for it really hard"}
      userHasCredential={userHasCredential}
    />
  );
};

export const CredentialCard: FC<CredentialCardProps> = ({
  title,
  expirationDate,
  issuanceDate,
  description,
  howToGet,
  userHasCredential,
}) => {
  // Filter the user's credentials by id
  // Dedupe the credentials by finding the latest one tha was issued
  // Display the credential

  let borderColor = "red";
  if (userHasCredential === PresentationExchangeStatus.pass) {
    borderColor = "green";
  } else if (userHasCredential === PresentationExchangeStatus.profileView) {
    borderColor = "blue";
  }
  return (
    <Card
      className={"max-w-sm text-center border-2"}
      style={{
        borderColor,
      }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {/*<CardContent style={{ border: "1px solid blue" }}>*/}
      <CardContent>
        {userHasCredential !== PresentationExchangeStatus.fail ? (
          <>
            <div>Issued: {issuanceDate.toLocaleString()}</div>
            <div>Expires: {expirationDate.toLocaleString()}</div>
          </>
        ) : (
          <Dialog>
            <DialogTrigger>
              <a>How can I get this credential?</a>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to get the {title} credential</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                <div>{howToGet}</div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      {/*TODO add check or X depending on if you have credential*/}
      {/*<div*/}
      {/*  style={{*/}
      {/*    position: "relative",*/}
      {/*    right: 20,*/}
      {/*    bottom: 20,*/}
      {/*    textAlign: "right",*/}
      {/*    border: "1px solid black",*/}
      {/*  }}*/}
      {/*>*/}
      {/*  XXX*/}
      {/*</div>*/}
    </Card>
  );
};
