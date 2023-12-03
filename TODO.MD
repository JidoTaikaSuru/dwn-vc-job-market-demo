* Feature freeze tomorrow night, code freeze Sunday at 6PM EST
* Sign in
    * (30m-1h ) Needs to support OTP
* (ad0ll 4 hours) Job listing drilldown
    * (ad0ll WIP) Presentation exchange render
* Navbar
    * (roman) Add link to "Companies" page called "FIND JOBS"
* (1h) Jobs listing page
* User profile:
   * Show your applications in a table
   * Show your job listings in a table
   * Move "updateProfile" to your own user profile, deprecate updateProfile page
* Overall UI polish
   * Home page should be "Company listing" or better, "Jobs Listing"
   * Move site directory to footer instead of appearing on a page
   * Fill site directory with working links instead of placeholders
   * http://localhost:5173/dwnMyJobs link broken. Do we need to deprecate something?
   * http://localhost:5173/listings/view/47d78076-4c3c-45e8-a54f-c76c3cf1472e is broken
   * Company listing
      * Add location to self profile. Render location in the company listing + user profile
      * Add VERY BASIC search that only does a text search against the rendered entries
      * Header of table needs to be visually different from rows. Add background color to table
      * No space between header and table
   * Company drilldown
      * Render description
      * ID should link (same link as the "Apply" button)
      * ID column should be smaller, show overflow as ellipses
      * "Create new Listing" button shouldn't appear unless you are on the drilldown for your own
DWN, or it can appear in the nav bar as "CREATE JOB POST". Recommend adding to navbar
   * Job listing drilldown
      * "View as company", email can be a "mailto" link
      * Swap presentation definition and credential render order when viewing details
      * Raw details should appear UNDER apply
      * Apply button should appear first (since it's the primary button)
   * User profile
      * Credentials should appear in a grid instead of as a column
      * Show raw data render is messed up
   * Admin playground
      * Buttons should appear in grid
* (TODO 1-2 hours) Adding toasts to show interactions as they happen
   * Content shouldn't appear under nav bar when scrolling
   * Fix layout of User Profile
* Important side tasks
    * (30m) Add branding to navbar
* (4h) Video
* (30m) Devpost Write-up
* AFTER SUBMISSION
    * (15m) Move backend to other repo
    * (2-4 hours) Deploy

# DONE

* (ad0ll 4 hours) Job listing drilldown
    * Fetch and render the job listing from the DWN instead of from Supabase

* (roman 2-4 hour) Company drilldown
    * Add a dialog or control for creating a new job for the companys
    * Deprecate PostJob

* (roman) (30-1h) Form to create a job listing for a company
    * Add a button for this in the Company Drilldown

* Navbar
    * (ruben) (TODO 1-2 hours) Display statistic about the DWN, and we can show storage limit

* (ad0ll) Full user profile
    * Profile picture
    * Your wallet address
    * Your DWN DID
    * List your credentials
    * VC downloading + rendering

* (1 hours) Form to apply for a job
    * @roman is this done?
    * Needs to verify that it's working
    * (ad0ll) Dialog doesn't show that it's submitted and doesn't close on submit
    * (roman) Once we know submitting works, will add a toast to show it's submitted

* Job listing drilldown
    * (ad0ll) Fetch and render the job listing from the DWN instead of from Supabase
    * (roman) (Company view) Applications made against this job

* (WON'T DO) Add property to dwn "withCompany", that's a string that is the company did
    * If this property is not empty then render the applicants for a job in the drilldown

* Company drilldown
    * Shows jobs at company
* Navbar
    * (TODO 1-2 hours) Display statistic about the DWN, and we can show storage limit
* -VC downloading- + (1h) rendering against presentation exchange
* (15m) Rename repo to something else
* Job listing list
    * Roman, Ruben, and I
        * (TODO 1 hour) Deprecate 2/3 of these so we only have one
        * Update router
* Company job listing, already done
* VERY slow loading through the entire app
    * There is demo code for async calls
    * We got 503s but we don't know if that's because we were slamming it or because
    * We can do whatever we want against a local DWN network
* TBD rate limiting
    * Turned ou not to be rate limiting. TBD is having a service outage
