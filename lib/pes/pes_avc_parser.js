// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const PESParser = require("./pes_parser.js");
const log = require("logplease").create("PESAVCParser", { useColors: false });

const NALUnit = function constructor() {
  return {
    data: undefined,
    type: undefined,
  };
}

class PESAVCParser extends PESParser {
  constructor(pes) {
    super(pes);
  }

  getNalUnits() {
    const data = this.getData();
    const len = data.byteLength;
    let pos = 0;
    let state = 0;
    let units = [];
    let lastUnitStart = -1;
    let lastUnitType;

    let val;
    while (pos < len) {
      val = data[pos++];

      if (state === 0) {
        state = val ? 0 : 1;
        continue;
      }
      if (state === 1) {
        state = val ? 0 : 2;
      }

    }
    return units;
  }
}

module.exports = PESAVCParser;