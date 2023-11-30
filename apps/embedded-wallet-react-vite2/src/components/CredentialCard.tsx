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

type CredentialCardProps = {
  // id: string;
  title: string;
  expirationDate: Date;
  description: string;
  howToGet: string;
  userHasCredential: boolean;
  // credentials: IVerifiableCredential[];
};

export const CredentialCard: FC<CredentialCardProps> = ({
  title,
  expirationDate,
  description,
  howToGet,
  userHasCredential,
}) => {
  // Filter the user's credentials by id
  // Dedupe the credentials by finding the latest one tha was issued
  // Display the credential

  return (
    <Card
      className={"max-w-md text-center border-2"}
      style={{
        borderColor: userHasCredential ? "green" : "red",
      }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {/*<CardContent style={{ border: "1px solid blue" }}>*/}
      <CardContent>
        {userHasCredential ? (
          <div>Expires: {expirationDate.toLocaleDateString()}</div>
        ) : (
          <Dialog>
            <DialogTrigger>
              <a>How can I get this credential?</a>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to get the {title} credential</DialogTitle>
                <DialogDescription>{howToGet}</DialogDescription>
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
