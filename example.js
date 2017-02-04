const hlsTs = require("./index.js");
const fs = require("fs");

fs.createReadStream("./test/support/testassets/seg-10s.ts")
.pipe(hlsTs.parse({ debug: true }))
.on("finish", function() {
  console.log(hlsTs.packets.length + " packets");
});