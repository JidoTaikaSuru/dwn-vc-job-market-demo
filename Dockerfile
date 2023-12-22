#This dockerfile is exclusively for the frontend
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN rm pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=dwn-vc-job-market --prod /prod/dwn-vc-job-market

FROM base AS app2
COPY --from=build /prod/dwn-vc-job-market /prod/dwn-vc-job-market
WORKDIR /prod/app2
EXPOSE 8001
CMD [ "pnpm", "start" ]