import createCache from "@emotion/cache";

//TODO This was added for MUI, but now that we've dropped MUI, can we drop this too?
export default function createEmotionCache() {
  return createCache({ key: "css" });
}
