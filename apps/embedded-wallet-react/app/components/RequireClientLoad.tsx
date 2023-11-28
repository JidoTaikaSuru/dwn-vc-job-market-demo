import type { FC, PropsWithChildren } from "react";
import { useEffect, useState } from "react";

let hydrating = true;

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

export const RequireClientLoad: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex items-center mt-8 justify-center">
      {useHydrated() ? <>{children}</> : <>Client-side code is loading</>}
    </div>
  );
};
