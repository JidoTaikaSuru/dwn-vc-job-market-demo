import { convertStringToCryptoKey } from "./cryptoLib"; // adjust the import path as needed

// TODO Below was written by ChatGPT and wasn't proofread. I'll come back and check it later.
describe("convertStringToCryptoKey", () => {
  beforeAll(() => {
    global.TextEncoder = require("util").TextEncoder;
    global.crypto = {
      subtle: {
        importKey: jest
          .fn()
          .mockImplementation(() => Promise.resolve("mock-key")),
      },
    } as unknown as Crypto;
  });

  it("converts a string to a CryptoKey", async () => {
    const str = "test-string";
    const key = await convertStringToCryptoKey(str);

    expect(global.crypto.subtle.importKey).toHaveBeenCalledWith(
      "raw",
      new TextEncoder().encode(str),
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
    expect(key).toBe("mock-key");
  });
});
