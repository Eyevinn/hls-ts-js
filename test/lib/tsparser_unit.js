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
    expect(programs.getTypes().length).toBe(3);
    expect(avcPackets.length).toBe(4931);
    expect(aacPackets.length).toBe(713);
    expect(avcData.size).toBe(879536);
    expect(aacData.size).toBe(119470);
  });

  xit("can parse a TS file with SCTE35 program data", () => {
    const asset = testAssetsModule.getAssetByName("seg2-10s");
    const parser = new TSParser();
    parser.push(asset.data);
    const programs = parser.getPrograms();
    const avcPackets = programs.getPackets("avc");
    const aacPackets = programs.getPackets("aac");
    const scte35Packets = programs.getPackets("scte35");
    const avcData = programs.getDataStream("avc");
    const aacData = programs.getDataStream("aac");
    const scte35Data = programs.getDataStream("scte35");
    expect(programs.getTypes().length).toBe(3);
    expect(avcPackets.length).toBe(4931);
    expect(aacPackets.length).toBe(713);
    expect(avcData.size).toBe(879536);
    expect(aacData.size).toBe(119470);
  });
});