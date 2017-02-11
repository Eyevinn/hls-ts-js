// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const Writable = require("stream").Writable;
const TSParser = require("./tsparser.js");

class ParseStream extends Writable {
  constructor(opts) {
    super(opts);
    this.parser = new TSParser();
    this.firstChunk = true;
  }
}

ParseStream.prototype.getPrograms = function getPrograms() {
  return this.parser.getPrograms();
}

ParseStream.prototype._write = function(chunk, encoding, next) {
  // Parse data
  //console.log("_write:" + chunk.length);
  let err;
  this.firstChunk = false;
  if (this.firstChunk) {
    if (!this.parser.isValidChunk(chunk)) {
      err = new Error("Invalid TS chunk");
    }
  }
  this.parser.push(chunk, false);
  next(err);
};

module.exports = ParseStream;