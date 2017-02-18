// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const PESParser = require("./pes_parser.js");
const log = require("logplease").create("PESAVCParser", { useColors: false });
const util = require("../util.js");

const NAL_START_PREFIX = 0x01;
const BYTE_STATE = {
  "0-7": 0,
  "8-15": 1,
  "16-23": 2,
  "24-31": 3,
};

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

const NALUnit = function constructor() {
  return {
    data: undefined,
    type: undefined,
    offset: -1,
    pes: undefined,
  };
}

/**
 * @class
 * @extends PESParser
 */
class PESAVCParser extends PESParser {
  /**
   * @constructor
   * @param {HlsTsDataStream} pes Data stream to parse
   */
  constructor(pes) {
    super(pes);
  }

  /**
   * Translates a Nal Unit type value to a readable string
   * 
   * @param {number} type Nal Unit Type
   * @return {string}
   */
  nalUnitType(type) {
    return NAL_UNIT_TYPE[type];  
  }

  /**
   * Translates a Nal Unit type value to a Nal Unit category
   * 
   * @param {number} type Nal Unit Type
   * @return {string} 
   */
  nalUnitCategory(type) {
    return NAL_UNIT_CATEGORY[type];
  }

  /**
   * Get the RBSP (Raw Byte Sequence Payload) from a Nal Unit
   * 
   * @param {HlsTsNalUnit} nalUnit
   * @return {Uint8Array}
   */
  rbspFromNalUnit(nalUnit) {
    let len = nalUnit.data.byteLength;
    let pos = 0;
    let epbs = [];

    while (pos < (len - 2)) {
      if (nalUnit.data[pos] == 0 && nalUnit.data[pos+1] == 0 && nalUnit.data[pos+2] == 0x03) {
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
      rbsp[i] = nalUnit.data[pos];
      pos++;
    }
    return rbsp;
  }

  /**
   * Get all Nal Units in this data stream
   * 
   * @return {HlsTsNalUnit[]}
   */
  getNalUnits() {
    const data = this.getData();
    const len = data.byteLength;
    let state = BYTE_STATE["0-7"];
    let pos = 0;
    let units = [];
    let unitType;
    let unitStartPos = -1;

    //log.debug(util.hexDump(data));

    let byte;
    while (pos < len) {
      byte = data[pos++];
      //log.debug(`pos=${pos}, byte:`, util.toHex(byte));
      if (state === BYTE_STATE["0-7"]) {
        state = byte ? BYTE_STATE["0-7"] : BYTE_STATE["8-15"];
        continue;
      }
      if (state === BYTE_STATE["8-15"]) {
        state = byte ? BYTE_STATE["0-7"] : BYTE_STATE["16-23"];
        continue;
      }
      if (state === BYTE_STATE["16-23"] || state === BYTE_STATE["24-31"]) {
        if (byte === 0) {
          state = BYTE_STATE["24-31"];
        } else if (byte === NAL_START_PREFIX) {
          //log.debug(`Start Prefix at ${pos} unitStartPos=${unitStartPos}`);
          if (unitStartPos >= 0) {
            const unit = new NALUnit();
            unit.data = data.subarray(unitStartPos, pos - state - 1);
            unit.type = unitType;
            unit.offset = unitStartPos - state - 1;
            unit.pes = this.getHeaderForByteOffset(unit.offset);
            units.push(unit);
            log.debug(`NAL Type:${NAL_UNIT_TYPE[unitType]} (${unitStartPos})`);
          }
          unitType = data[pos] & 0x1f;
          unitStartPos = pos;
        } else {
          state = BYTE_STATE["0-7"];
        }
      }
    }
    if (unitStartPos >= 0) {
      const unit = new NALUnit();
      unit.data = data.subarray(unitStartPos, pos - state - 1);
      unit.type = unitType;
      unit.offset = unitStartPos - state - 1;
      unit.pes = this.getHeaderForByteOffset(unit.offset);
      units.push(unit);
    }
    return units;
  }
}

module.exports = PESAVCParser;