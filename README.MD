# DWN + VC Job Market

> This is our submission for first the [DIF Hackathon](https://devpost.com/software/decentralinked), then second the TBD Hackathon (the schedules for the two
> overlapped)

## Links

* Devpost: https://devpost.com/software/decentralinked
* Video: TODO
* Live application: TODO (vercel link here)

## Key features

## Repo structure:

* [./apps/dwn-vc-job-market](): Our React app
* [./packages/vc-api](): Our REST API. This will be moved to a separate repo shortly after the DIF hackathon submission
* [./packages/PEX](): A copy of PEX that is currently unmodified, sans a few console.logs to troubleshoot compat issues
  with Veramo and PEX, needs to be
  made into a submodule later
* [./apps/dwn-server](): Our fork of the TBD dwn server code
* (Will be archived soon) [./packages/cli](): Ignore this, was a CLI for the Veramo node starter before we had our REST
  API

## Access you need to work on this project

Ask @reisepass for access to the following:

* [Supabase](https://supabase.com/dashboard/project/ubpnbnzpfmtbbrgigzjq)
* Database credentials for Supabase (needed for the REST API)
* Admin access on this repo

Ask @ad0ll for access to the following:

* [Insomnia](https://insomnia.rest/download)

Ask anyone for access to the following:

* [Discord]()

## Development

### Local DWN cluster

```shell
    git submodule update --ini
    docker-compose -f local-dwn-cluster.docker-compose.yml up
```
