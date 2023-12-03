* Feature freeze tomorrow night, code freeze Sunday at 6PM EST
* Sign in
    * (30m-1h ) Needs to support OTP
* (ad0ll 4 hours) Job listing drilldown
    * (ad0ll WIP) Presentation exchange render
* Navbar
    * (roman) Add link to "Companies" page
* Overall UI polish
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
