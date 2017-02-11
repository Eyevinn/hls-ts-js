// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const request = require("request");
const hlsTs = require("../../../index.js");
const PESParser = require("../../../lib/pes/pes_parser.js");
const PESAVCParser = require("../../../lib/pes/pes_avc_parser.js");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe("PES Parser", () => {
  it("can parse PES AVC payload", (done) => {
    const stream = request.get("http://localhost:9876/base/test/support/testassets/seg-10s.ts");
    stream.pipe(hlsTs.parse({ debug: true })).on("finish", () => {
      const avcData = hlsTs.getDataStreamByProgramType("avc");
      const pesAvcParser = new PESAVCParser(avcData);
      expect(pesAvcParser.getId()).toBe(224);
      expect(pesAvcParser.getNalUnits().length).toBe(0);
      done(); 
    });
  });
});