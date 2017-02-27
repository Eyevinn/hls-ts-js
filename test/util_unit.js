// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const util = require("../lib/util.js");

describe("Utility functions", () => {
  it("can get 5 first bits from a byte as an array", () => {
    const mockByte = 178; // 10110010
    const fiveBits = util.readBits(mockByte, 5);
    expect(fiveBits.length).toBe(5);
    expect(fiveBits).toEqual([1, 0, 1, 1, 0]);
  });
  it("can get 5 first bits from a byte as an array of booleans (flags)", () => {
    const mockByte = 178; // 10110010
    const fiveBits = util.readFlags(mockByte, 5);
    expect(fiveBits.length).toBe(5);
    expect(fiveBits).toEqual([true, false, true, true, false]);
  });
});