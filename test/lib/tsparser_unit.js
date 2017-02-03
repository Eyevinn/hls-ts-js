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
    const parser = new TSParser(asset.data);
    const isValid = parser.isValid();
    expect(isValid).toBe(true);
  });

  it("can verify that a correct TS file is incorrect", () => {
    const asset = testAssetsModule.getAssetByName("seg-10s");
    asset.data[0] = 0x48;
    const parser = new TSParser(asset.data);
    const isValid = parser.isValid();
    expect(isValid).toBe(false);
  });
});