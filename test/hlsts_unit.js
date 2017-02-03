const request = require("request");
const hlsTs = require("../index.js");

xdescribe("Hls TS", () => {
  it("can parse data through a pipe", (done) => {
    request
    .get("http://localhost:9876/base/test/support/testassets/seg-10s.ts")
    .on("response", (response) => {
      console.log(response.statusCode);
    })
    .pipe(hlsTs.parse())
    .on("parsed", (ts) => {
      console.log(ts);
      done();
    });
  });
});