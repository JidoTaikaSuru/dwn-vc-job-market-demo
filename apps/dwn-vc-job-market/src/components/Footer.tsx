export const APP_NAME = "Decentralinked";

const Footer: React.FC = () => {

  return (
    <nav className="sticky top-0 z-50 bg-gray-100">
      <div className="flex w-screen items-center justify-between p-4">
        <a href={"/"}>
          <h5 className="tracking-tighter text-black">{APP_NAME}</h5>
        </a>
        <div style={{ display: "flex" }} >

          <a href="/listings"
            className="text-xs  mr-1">
            Companies (DWN)  |
          </a>

          <a href="/listings/view?companyDid=&applicationRecordId="
            className="text-xs  mr-1">
            Job Listing Drilldown (demo)  |
          </a>

          <a href="/listings/supabase"
            className="text-xs  mr-1">
            Companies (Supabase)  |
          </a>

          <a href="/listings/supabase/view/:supabase_listing_id"
            className="text-xs  mr-1">
            Job Listing Drilldown (Supabase, demo)  |
          </a>

          <a href="/listings/company/:companyDid"
            className="text-xs  mr-1">
            Company Drilldown (demo)  |
          </a>

          <a href="/profile/:userDid"
            className="text-xs  mr-1">
            User Profile  |
          </a>

          <a href="/playground"
            className="text-xs  mr-1">
            Troubleshooting/Admin
          </a>

        </div>
      </div>
    </nav>
  );
};
export default Footer;
