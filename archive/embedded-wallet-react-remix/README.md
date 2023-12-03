# Embedded Wallet React demo

This is a demo of the [Embedded Wallet](). It contains a landing page that hosts a login button, and an iframe interface
for interacting with the wallet

## Getting Started

1. [Install NVM](https://github.com/nvm-sh/nvm) and then install node 20 (as of writing this, `nvm install stable`
   then `nvm alias default`)
2. Install [pnpm](https://pnpm.io/installation) globally: `npm i -g pnpm`
3. Install dependencies: `pnpm i`
4. Start the app: `pnpm dev`

## Notes on Remix

This is my first time giving remix a try, and it's been mixed. The requirements for our app might be a bad fit.

If you get errors on pnpm dev on init, especially after importing packages, try running `pnpm build` before
running `pnpm dev`

## Notes

[Material UI and Remix do not play well together](https://github.com/mui/material-ui/issues/39765). If you run into
problems, check if there's an open issue on the issues
page, and refer
to [the starter example for basic setup](https://github.com/mui/material-ui/tree/master/examples/material-ui-remix-ts)

## Development

From your terminal:

```sh
pnpm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
pnpm run build
```

Then run the app in production mode:

```sh
pnpm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
