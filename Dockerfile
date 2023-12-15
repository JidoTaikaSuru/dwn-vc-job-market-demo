FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=vc-api --prod ./prod/vc-api
RUN pnpm deploy --filter=dwn-vc-job-market --prod /prod/dwn-vc-job-market

FROM base AS app1
COPY --from=build /prod/vc-api /prod/vc-api
WORKDIR /prod/app1
EXPOSE 8000
CMD [ "pnpm", "start" ]

FROM base AS app2
COPY --from=build /prod/dwn-vc-job-market /prod/dwn-vc-job-market
WORKDIR /prod/app2
EXPOSE 8001
CMD [ "pnpm", "start" ]