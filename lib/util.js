// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const hexy = require("hexy");

const util = {
  toHex: function(d) {
    return "0x" + d.toString(16);
  },
  hexDump: function(array) {
    let buf = new Buffer(array.byteLength);
    let view = new Uint8Array(array);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = view[i];
    }
    return hexy.hexy(buf);
  },
  readBits: function(byte, numBits) {
    let array = [];
    const bitMask = [
      0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01,
    ];
    const shift = [
      0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01,
    ];
    for(let i = 0; i< numBits; i++) {
      array.push((byte & bitMask[i]) / shift[i]);
    }
    return array;
  },
  readFlags: function(byte, numFlags) {
    const array = this.readBits(byte, numFlags);
    return array.map(f => f === 1);
  },
  bitsToNumber: function(bits) {
    let val = 0;
    for (let i = 0; i < bits.length; i++) {
      const shift = bits.length - i - 1;
      val += bits[i] << shift;
    }
    return val;
  }
};

module.exports = util;