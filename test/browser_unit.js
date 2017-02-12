// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

require("../global_exports.js");

describe("Hls TS browser library", function() {
  it("can parse data from XHR response", function(done) {
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:9876/base/test/support/testassets/seg-10s.ts";
    var parser = new window.HlsTs({ debug: false });
    xhr.responseType = "arraybuffer";
    xhr.onloadend = function() {
      var buffer = xhr.response;
      var data = new Uint8Array(buffer);
      parser.parse(data).then(function() {
        var programs = parser.getPrograms();
        var avcProgram = programs.find(p => p.type === "avc");
        var avcPackets = parser.getPacketsByProgramType("avc");
        var avcData = parser.getDataStreamByProgramType("avc");
        var avcParser = parser.createAvcParser(avcData);
        expect(programs.length).toBe(3);
        expect(avcPackets.length).toBe(avcProgram.packets);
        expect(avcData.data.length).toBe(879536);
        expect(avcData.size).toBe(avcData.data.length);
        expect(avcParser.getNalUnits().length).toBe(508);
        done();
      }).catch(function(err) { console.error(err.message); fail(); }).then(done);
    };
    xhr.open("GET", url);
    xhr.send();
  });
});