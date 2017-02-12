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
  0: "unspecified",
  1: "slice_layer_without_partitioning_rbsp()",
  2: "slice_data_partition_a_layer_rbsp()",
  3: "slice_data_partition_b_layer_rbsp()",
  4: "slice_data_partition_c_layer_rbsp()",
  5: "slice_layer_without_partitioning_rbsp()",
  6: "sei_rbsp()",
  7: "seq_parameter_set_rbsp()",
  8: "pic_parameter_set_rbsp()",
  9: "access_unit_delimiter_rbsp()",
  10: "end_of_seq_rbsp( )",
  11: "end_of_stream_rbsp( )",
  12: "filler_data_rbsp()",
  13: "seq_parameter_set_extension_rbsp()",
  14: "prefix_nal_unit_rbsp()",
  15: "subset_seq_parameter_set_rbsp()",
  16: "reserved",
  17: "reserved",
  18: "reserved",
  19: "slice_layer_without_partitioning_rbsp()",
  20: "slice_layer_extension_rbsp()",
  21: "slice_layer_extension_rbsp() annex I",
  22: "reserved",
  23: "reserved",
  24: "unspecified",
  28: "unspecified",
  29: "unspecified",
}

const NALUnit = function constructor() {
  return {
    data: undefined,
    type: undefined,
    offset: -1,
    pes: undefined,
  };
}

class PESAVCParser extends PESParser {
  constructor(pes) {
    super(pes);
  }

  nalUnitType(type) {
    return NAL_UNIT_TYPE[type];  
  }

  getNalUnits() {
    const data = this.getData();
    const len = data.byteLength;
    let state = BYTE_STATE["0-7"];
    let pos = 0;
    let units = [];
    let unitType;
    let unitStartPos = -1;

    //console.log(util.hexDump(data.slice(0, 100)));

    let byte;
    while (pos < len) {
      byte = data[pos++];
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
          if (unitStartPos >= 0) {
            const unit = new NALUnit();
            unit.data = data.subarray(unitStartPos, pos - state - 1);
            unit.type = unitType;
            unit.offset = unitStartPos - state - 1;
            unit.pes = this.getHeaderForByteOffset(unit.offset);
            units.push(unit);
            unitStartPos = -1;
          } else {
            unitType = data[pos] & 0x1f;
            unitStartPos = pos;
            //log.debug(`NAL Type:${NAL_UNIT_TYPE[unitType]} (${unitStartPos})`);
          }
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