// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const PESParser = require("./pes_parser.js");
const NalUParser = require("./nalu_parser.js");
const log = require("logplease").create("PESAVCParser", { useColors: false });
const util = require("../util.js");

const NAL_START_PREFIX = 0x01;
const BYTE_STATE = {
  "0-7": 0,
  "8-15": 1,
  "16-23": 2,
  "24-31": 3,
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
    return NalUParser.nalUnitTypeToString(type);
  }

  /**
   * Translates a Nal Unit type value to a Nal Unit category
   * 
   * @param {number} type Nal Unit Type
   * @return {string} 
   */
  nalUnitCategory(type) {
    return NalUParser.nalUnitTypeToCategory(type);
  }

  /**
   * Get the RBSP (Raw Byte Sequence Payload) from a Nal Unit
   * 
   * @param {HlsTsNalUnit} nalUnit
   * @return {Uint8Array}
   */
  rbspFromNalUnit(nalUnit) {
    return new NalUParser(nalUnit).rbsp();
  }

  /**
   * Get the SPS (Sequence Paramater Set) from a Nal Unit. Returns null
   * if Nal Unit type is not SPS in
   *  
   * @param {HlsTsNalUnit} nalUnit
   * @return {HlsTsNalUnitSPS}
   */
  spsFromNalUnit(nalUnit) {
    return new NalUParser(nalUnit).sps();
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
            log.debug(`NAL Type:${this.nalUnitType(unitType)} (${unitStartPos})`);
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
      unit.data = data.subarray(unitStartPos, pos - state);
      unit.type = unitType;
      unit.offset = unitStartPos - state;
      unit.pes = this.getHeaderForByteOffset(unit.offset);
      units.push(unit);
    }
    return units;
  }
}

module.exports = PESAVCParser;
