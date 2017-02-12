const hlsTs = require("./index.js");
const fs = require("fs");
const PESAVCParser = require("./lib/pes/pes_avc_parser.js");

fs.createReadStream("./test/support/testassets/seg-10s.ts")
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
  avcParser = new PESAVCParser(dataStream);
  avcNalUnits = avcParser.getNalUnits();
  console.log(avcNalUnits.length + " AVC NAL units (showing IDR frames)");
  avcNalUnits.filter(nu => nu.type === 5).forEach((nu) => {
    console.log(" - " + avcParser.nalUnitType(nu.type) + ":" + nu.offset + ", pes=" + nu.pes.pts);
  })

});
