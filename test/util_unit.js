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
  it("can return a value for an array of bits", () => {
    const bitArray1 = [0, 0, 0, 1];
    const bitArray2 = [1, 1, 1, 1];
    const bitArray3 = [1, 0, 0, 1];
    const val1 = util.bitsToNumber(bitArray1);
    const val2 = util.bitsToNumber(bitArray2);
    const val3 = util.bitsToNumber(bitArray3);
    expect(val1).toBe(1);
    expect(val2).toBe(15);
    expect(val3).toBe(1 + 8);
  });
});