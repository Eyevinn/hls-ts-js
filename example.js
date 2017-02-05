const hlsTs = require("./index.js");
const fs = require("fs");

fs.createReadStream("./test/support/testassets/seg2-10s.ts")
.pipe(hlsTs.parse({ debug: true }))
.on("finish", function() {
  const programs = hlsTs.programs;
  const avcProgram = programs.find(p => p.type === "avc");
  console.log("avc:pts:", avcProgram.pts.slice(0, 10).join(":"));

  const packets = hlsTs.getPacketsByProgramType(programs[0].type);
  const pcrs = packets.filter(p => p.pcr.base);
  console.log("avc:pcr(base):", pcrs.map(p => p.pcr.base).slice(0, 10).join(":"));
  console.log("avc:pcr(value):", pcrs.map(p => p.pcr.value).slice(0, 10).join(":"));

  console.log(programs[0].type + ":" + packets.length + " packets");
  console.log(programs[0].type + ":" + packets.filter(p => p.payloadUnitStartIndicator).length + " packets with payload");
  const dataStream = hlsTs.getDataStreamByProgramType(programs[0].type);
  console.log(programs[0].type + ":" + dataStream.data.length + " bytes");
});
