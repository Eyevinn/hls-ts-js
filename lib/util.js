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
  }
};

module.exports = util;