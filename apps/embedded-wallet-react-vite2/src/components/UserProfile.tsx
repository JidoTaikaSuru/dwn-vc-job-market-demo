import { FC, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";

export const UserProfile: FC = () => {
  const { web5Client } = useRecoilValue(web5ConnectSelector);
  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const profile = await web5Client?.dwnReadSelfReturnRecordAndData();
      setMyProfile(profile);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div>Profile</div>
      {myProfile && JSON.stringify(myProfile, null, 2)}
    </div>
  );
};
