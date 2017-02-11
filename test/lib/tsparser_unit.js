// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const TSParser = require("../../lib/tsparser.js");
const TestAssetsModule = require("../support/testassets.js");

describe("TS Parser", () => {
  let testAssetsModule;

  beforeEach((done) => {
    testAssetsModule = new TestAssetsModule();
    testAssetsModule.init().then(done);
  });

  it("can verify that a correct TS file is correct", () => {
    const asset = testAssetsModule.getAssetByName("seg-10s");
    const parser = new TSParser();
    const isValid = parser.isValidChunk(asset.data);
    expect(isValid).toBe(true);
  });

  it("can verify that a correct TS file is incorrect", () => {
    const asset = testAssetsModule.getAssetByName("seg-10s");
    asset.data[0] = 0x48;
    const parser = new TSParser();
    const isValid = parser.isValidChunk(asset.data);
    expect(isValid).toBe(false);
  });

  it("can parse a TS file", () => {
    const asset = testAssetsModule.getAssetByName("seg-10s");
    const parser = new TSParser();
    parser.push(asset.data);
    const programs = parser.getPrograms();
    const avcPackets = programs.getPackets("avc");
    const aacPackets = programs.getPackets("aac");
    const avcData = programs.getDataStream("avc");
    const aacData = programs.getDataStream("aac");
    
    // We should have avc, aac and scte35
    expect(programs.getTypes().length).toBe(3);

    // 10s and 25fps should be 250 frames
    expect(programs.getTypes().find(p => p.type === "avc").pts.length).toBe(250);

    // We shoule have 250 frames with PCR data
    expect(avcPackets.filter(p => p.pcr.base).length).toBe(250);

    expect(avcPackets.length).toBe(4931);
    expect(aacPackets.length).toBe(713);
    expect(avcData.size).toBe(879536);
    expect(aacData.size).toBe(119470);
    expect(avcData.id).toBe(224);
  });

  it("can parse PCR", () => {
    const asset = testAssetsModule.getAssetByName("seg2-10s");
    const parser = new TSParser();
    parser.push(asset.data);
    const programs = parser.getPrograms();
    const avcPackets = programs.getPackets("avc");
    const avcProgram = programs.getTypes().find(prog => prog.type === "avc");

    expect(avcPackets.filter(p => p.pcr.base).length).toBe(250);
    expect(avcPackets.filter(p => p.pcr.base).map(p => p.pcr.base)[0]).toBe(2683887710);
    expect(avcProgram.pts[0]).toBe(2683984615);
  });
});