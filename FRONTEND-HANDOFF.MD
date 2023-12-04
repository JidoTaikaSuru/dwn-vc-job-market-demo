This document contains info to onboard new team members who are working on the frontend

# Key dependencies

- [PEX](https://github.com/Sphereon-Opensource/PEX) - Presentation Exchange library. TL;DR, it gives types for
  Presentation Definition (provided by Verifier, defines what credentials are required for something), and wraps VCs
  from existing libraries (Veramo) in a format that can be run against the library's Presentation Definition format.
  This library feel beta, I've run. See PEX's ssi-types library for types. PEX code lives
  in [apps/dwn-vc-job-market/src/lib/credentialLib.ts]()
  into a lot of challenges with it. I pulled it into the repo so I could hack on it.
- [Veramo](https://github.com/uport-project/veramo) - Used for issuing, storing, and managing Verified Credentials.
  Works very well. Mostly relevant to the backend.
- @web5/api - TBD DWN hackathon code. By default, uses Ion for DIDs and uses TBD's hosted DWNs as endpoints. Code for
  this is in [apps/dwn-vc-job-market/src/lib/web5Client.ts]()
- Recoil - There's a ton of async operations with the backend and DWN. Our useEffect hooks were ridiculous. Recoil was
  an easy get that streamlined these ops. Most of our recoil code is selectors for Supabase and TBD. Code is
  in [apps/dwn-vc-job-market/src/lib/web5Recoil.ts]()
- shadcn/ui and radix/ui, everything in [apps/dwn-vc-job-market/src/components/ui]() is from shadcn. Probably shouldn't
  be under components. Can be relocated. I have no attachment to this UI library if you want to use something else
- Vite - The DWN operations in this app require interactions with local storage. We started with Remix, but it created a
  bunch of issues with browser interactions. You might be able to find a way to make it work. I couldn't in the range of
  the hackathon.
- Tailwind: Because Material UI is too heavy. Recommend keeping this since other frontend devs are familiar

# Things we aren't doing that I think we should

* We aren't using RxJS right now, but I would seriously consider doing so if we use an ActivityPub like inbox
* We aren't using storybooks, but we've spent so much time re-writing the same UI components that I'd highly recommend
  doing so.

# Key in-house libraries

* [apps/dwn-vc-job-market/src/lib/credentialManager.ts]() - Generic interface for fetching credentials. Currently only
  implementation is for the REST API (and the REST API uses Veramo). Should be expanded to run presentation exchanges.
* [apps/dwn-vc-job-market/src/lib/embeddedWalletLib.ts]() - web3 wallet code, completely ignore this
* [apps/dwn-vc-job-market/src/lib/presentationExchangeLib]() - Presentation exchange code written for the frontend. Has
  a bunch of duplicate code from the backend (scrambling last minute for the demo). We should move this code out of the
  frontend so both the backend and frontend can consume it

# Components:

* Company listings/home page: [apps/dwn-vc-job-market/src/components/Companies.tsx]()
* Company job listings: [apps/dwn-vc-job-market/src/components/CompanyJobListings.tsx](), this is the job listing page.
  Job listings have to be viewed per-company in the current design (because a company is represented by a DWN). This is
  tightly bound to TBD right now. We need to create an interface for fetching job data, and then move the code here into
  an implementation.
* Job replies table: [apps/dwn-vc-job-market/src/components/JobRepliesTable.tsx](), applicant responses to a job
  listing. You can see this in the job listing drilldown
* DwnJobListingDrilldown: [apps/dwn-vc-job-market/src/components/DwnJobListingDrilldown.tsx](), drilldown for a job
  listing. *This is the most current drilldown*, the supabase drilldown has code for fetching jobs from supabase, but
  doesn't have current features.
* SupabaseJobListingDrilldown: [apps/dwn-vc-job-market/src/components/SupabaseJobListingDrilldown.tsx](), supabase based
  job listing drilgration code, but features nood to be ported from the DwnJobListingDrilldown.tsx
* SessionContext: [apps/dwn-vc-job-market/src/components/SessionContext.tsx](), makes the Supabase session available to
  children. The web5 client selector from web5Recoil.ts is how you get the user's DWN
* CredentialCard: [apps/dwn-vc-job-market/src/components/CredentialCard.tsx](), displays a credential. This is used in
  the drilldowns to display the job seeker's credentials. Some of the code is good, but it was written sloppily and
  needs a refactor.

# Other notes:

* [apps/dwn-vc-job-market/src/lib/setupDwn.ts]() contains admin commands for forcing credential issuance and interacting
  with the DWN. Served through the playground at
  /playground ([apps/dwn-vc-job-market/src/components/AdminPlayground.tsx]())
* [apps/dwn-vc-job-market/src/components/UserProfile.tsx]() Contains UI for most of the web5 library code. Very useful
  for debugging
* There is a site map at /site-map that's current
* Any code that's commented out is dead, but was left in for reference since some parts can be used
    * [apps/dwn-vc-job-market/src/components/InternalEmbeddedWalletDemo.tsx]() embedded wallet ui, can be archived
    * [apps/dwn-vc-job-market/src/components/InternalIframeDemo.tsx]() same as above
      *[apps/dwn-vc-job-market/src/components/WalletModal.tsx]() web3 connect dialog. Not used anywhere. Conflicted with
      embedded wallet and would have taken too much time to salvage.
* Anything is experiments is functioning code that wasn't used in the DIF hackathon submission. Most/all of it is old,
  useless, and should be archived
* ./gen-types at the root generates TypeScript types from supabase. Run it after making a change in Supabase. Puts types
  in */**/__generated__
* [archive/*]() put dead code here so we can refer to it if needed in the hackathon