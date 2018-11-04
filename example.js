const hlsTs = require("./index.js");
const fs = require("fs");

fs.createReadStream("./test/support/testassets/2000-00002.ts")
.pipe(hlsTs.parse({ debug: false }))
.on("error", function(err) {
  console.error(err);
})
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
  avcParser = hlsTs.createAvcParser(dataStream);
  avcNalUnits = avcParser.getNalUnits();
  console.log(avcNalUnits.length + " AVC NAL units (showing IDR frames)");
  avcNalUnits.filter(nu => nu.type === 5).forEach((nu) => {
    console.log(" - " + avcParser.nalUnitType(nu.type) + ":" + nu.offset + ", pes=" + nu.pes.pts);
  })

  const aacProgram = programs.find(p => p.type === "aac");
  const aacPackets = hlsTs.getPacketsByProgramType("aac");
  const aacDataStream = hlsTs.getDataStreamByProgramType("aac");
  console.log(aacProgram.type + ":" + aacPackets.length + " packets");
  console.log(aacProgram.type + ":" + aacDataStream.data.length + " bytes");
  aacParser = hlsTs.createAacParser(aacDataStream);
  const aacAdtsFrames = aacParser.getAdtsFrames();
  let frame = aacAdtsFrames[0];
  console.log(" - MPEG" + frame.mpegVersion + " " + aacParser.audioType(frame.audioObjectType) + " " + frame.channels + "ch (" + frame.samplingRate + "): " + aacAdtsFrames.length + " audio frames, pes=" + frame.pes.pts);
});
