import type { FC, PropsWithChildren } from "react";
import { useContext } from "react";
import { SessionContext } from "~/context/SessionContext";
import { redirect } from "@remix-run/node";

export const RequireUserLoggedIn: FC<PropsWithChildren> = ({ children }) => {
  const { session, wallet } = useContext(SessionContext);

  if (!session || !wallet) {
    redirect("/login");
    return;
  }

  return <>{children}</>;
};
