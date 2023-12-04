## Inspiration

We all genuinely believe in privacy and data ownership

## What it does

* DW
* On-device crypto wallet w/ encrypted cloud backup. Works just like Metamask, but you'll neve see a "sign" dialog

## How we built it

* React Frontend that interfaces with a local DWN in the browser, hosted DWNs from TBD w/ Ion as an identity provider
* Library code for composing Presentation Definitions, interacting with DWNs,
* NodeJS REST API that's configured as a "trusted" issuer of Verified Credentials. Includes utilities for building VCs
  and Presentation Exchanges for trust establishment

## Challenges we ran into

* We completely changed the direction of the project at 8 days before submission because of a security flaw with our
  embedded wallet design.
* TBD had a hosted DWN outage on the Saturday before submission. Some of our code caches DWN data for better ergonomics,
  and rewiring things to point to a local deployment was challenging.

## Accomplishments that we're proud of

* We have written a **ton** of code given the length of the hackathon, and most of it was implemented properly
* For the most pa8

## What we learned

* One of our devs learned React from basically scratch
* We learned how DWNs and Presentation Exchanges work
* We learned how to use tooling for verified credentials, Veramo and PEX

## What's next for Decentralinked

* We're looking at the TBD hackathon.
    * We're planning to spend some time hacking dwn-server, adding web3 wallet features