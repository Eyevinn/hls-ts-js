// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const TestAssetsModule = require("./support/testassets.js");

describe("Test Helpers", () => {
  it("can load a test asset and store in a byte array", (done) => {
    const testAssetsModule = new TestAssetsModule();
    testAssetsModule.init().then(() => {
      const asset = testAssetsModule.getAssetByName("seg-10s");
      const data = asset.data;
      expect(data.length).toBeGreaterThan(3 * 188);
      expect(data[0]).toBe(0x47);
      done();
    }).catch(fail).then(done);
  });
});