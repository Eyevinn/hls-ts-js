// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const util = require("../util.js");

const NAL_UNIT_TYPE = {
  0: "Unspecified",
  1: "Coded slice of a non-IDR picture",
  2: "Coded slice data partition A",
  3: "Coded slice data partition B",
  4: "Coded slice data partition C",
  5: "Coded slice of an IDR picture",
  6: "Supplemental enhancement information (SEI)",
  7: "Sequence parameter set",
  8: "Picture parameter set",
  9: "Access unit delimiter",
  10: "End of sequence",
  11: "End of stream",
  12: "Filler data",
  13: "Sequence parameter set extension",
  14: "Prefix NAL unit",
  15: "Subset sequence parameter set",
  16: "Depth parameter set",
  17: "Reserved",
  18: "Reserved",
  19: "Coded slice of an auxiliary coded picture without partitioning",
  20: "Coded slice extension",
  21: "Coded slice extension for depth view components",
  22: "Reserved",
  23: "Reserved",
  24: "Unspecified",
  28: "Unspecified",
  29: "Unspecified",
};

const NAL_UNIT_CATEGORY = {
  0: "non-VCL",
  1: "VCL",
  2: "VCL",
  3: "VCL",
  4: "VCL",
  5: "VCL",
  6: "non-VCL",
  7: "non-VCL",
  8: "non-VCL",
  9: "non-VCL",
  10: "non-VCL",
  11: "non-VCL",
  12: "non-VCL",
  13: "non-VCL",
  14: "non-VCL",
  15: "non-VCL",
  16: "non-VCL",
  17: "non-VCL",
  18: "non-VCL",
  19: "non-VCL",
  20: "non-VCL",
  21: "non-VCL",
  22: "non-VCL",
  23: "non-VCL",
  24: "non-VCL",
  25: "non-VCL",
  26: "non-VCL",
  27: "non-VCL",
  28: "non-VCL",
  29: "non-VCL",
};

const NalUnitSPS = function constructor() {
  return {

  };
};

class NalUParser {
  /**
   * @constructor
   * @param {HlsTsNalUnit} nalUnit NAL Unit to parse
   */
  constructor(nalUnit) {
    this.nalUnit = nalUnit;
  }

  /**
   * Get the NALU data as RBSP
   * 
   * @return {Uint8Array} 
   */
  rbsp() {
    const len = this.nalUnit.data.byteLength;
    let pos = 0;
    let epbs = [];

    while (pos < (len - 2)) {
      if (this.nalUnit.data[pos] == 0 && this.nalUnit.data[pos+1] == 0 && this.nalUnit.data[pos+2] == 0x03) {
        epbs.push(pos + 2);
        pos += 2;
      } else {
        pos++;
      }
    }
    let rbsp = new Uint8Array(len - epbs.length);

    // Remove the EPBs
    pos = 0;
    for (let i = 0; i < rbsp.length; i++) {
      if (pos === epbs[0]) {
        pos++;
        epbs.shift();
      }
      rbsp[i] = this.nalUnit.data[pos];
      pos++;
    }
    return rbsp;
  }

  /**
   * Get SPS data in NALU (if available)
   * 
   * @return {HlsTsNalUnitSPS}
   */
  sps() {
    if (this.nalUnit.type != 7) {
      return null;
    }
    const rbspData = this.rbsp();
    const len = rbspData.byteLength;
    let pos = 0;

    pos += 1; // first byte is nalu type
    const profileIdc = rbspData[pos++];

    const profileConstraintsFlags = util.readFlags(rbspData[pos], 5);
    // Skip reserved bits
    pos++;
    const levelIdc = rbspData[pos++];

    let nalUnitSPS = new NalUnitSPS();

    return nalUnitSPS;
  }

  static nalUnitTypeToString(nalUnitType) {
    return NAL_UNIT_TYPE[nalUnitType];
  }

  static nalUnitTypeToCategory(nalUnitType) {
    return NAL_UNIT_CATEGORY[nalUnitType];    
  }
}

module.exports = NalUParser;