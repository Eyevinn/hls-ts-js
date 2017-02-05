const hlsTs = require("./index.js");
const fs = require("fs");

fs.createReadStream("./test/support/testassets/seg2-10s.ts")
.pipe(hlsTs.parse({ debug: true }))
.on("finish", function() {
  const programs = hlsTs.programs;
  console.log(programs);
  const packets = hlsTs.getPacketsByProgramType(programs[0].type);
  console.log(programs[0].type + ":" + packets.length + " packets");
  console.log(programs[0].type + ":" + packets.filter(p => p.payloadUnitStartIndicator).length + " packets with payload");
});