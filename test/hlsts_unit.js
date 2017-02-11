// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const request = require("request");
const hlsTs = require("../index.js");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe("Hls TS", () => {
  it("can parse data through a pipe", (done) => {
    const stream = request.get("http://localhost:9876/base/test/support/testassets/seg-10s.ts");
    stream.pipe(hlsTs.parse({ debug: false })).on("finish", () => {
      const programs = hlsTs.programs;
      const avcProgram = programs.find(p => p.type === "avc");
      const avcPackets = hlsTs.getPacketsByProgramType("avc");
      const avcData = hlsTs.getDataStreamByProgramType("avc");
      expect(programs.length).toBe(3);
      expect(avcPackets.length).toBe(avcProgram.packets);
      expect(avcData.data.length).toBe(879536);
      expect(avcData.size).toBe(avcData.data.length);
      done(); 
    });
  });
});