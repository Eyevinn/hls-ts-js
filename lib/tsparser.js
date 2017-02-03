// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

/**
 * @param {Uint8Array} data
 * @constructor
 */
const TSParser = function constructor(data) {
  this.data = data;
};

TSParser.prototype.isValid = function isValid() {
  if(this.data.length >= 3 * 188 && this.data[0] === 0x47 && this.data[188] === 0x47 && this.data[2 * 188] === 0x47) {
    return true;
  }
  return false;
};

module.exports = TSParser;