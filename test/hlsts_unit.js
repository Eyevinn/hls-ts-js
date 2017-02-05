const request = require("request");
const hlsTs = require("../index.js");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe("Hls TS", () => {
  it("can parse data through a pipe", (done) => {
    const stream = request.get("http://localhost:9876/base/test/support/testassets/seg-10s.ts");
    stream.pipe(hlsTs.parse({ debug: true })).on("finish", () => {
      expect(hlsTs.programs.length).toBe(3);
      done(); 
    });
  });
});