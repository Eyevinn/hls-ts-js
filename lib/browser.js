// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const Logger = require("logplease");
const TSParser = require("./tsparser.js");

const HlsTsBrowser = function constructor(opts) {
  if (opts && opts.debug) {
    Logger.setLogLevel("DEBUG");            
  } else {
    Logger.setLogLevel("INFO");
  }
  this.parser = new TSParser();
};

HlsTsBrowser.prototype.parse = function parse(data) {
  return new Promise((resolve, reject) => {
    if (this.parser.isValidChunk(data)) {
      this.parser.push(data, false);
      resolve();
    } else {
      reject("Not a valid TS chunk");
    }
  });
};

HlsTsBrowser.prototype.getPrograms = function() {
  return this.parser.getPrograms().getTypes();
};

HlsTsBrowser.prototype.getPacketsByProgramType = function(type) {
  return this.parser.getPrograms().getPackets(type);    
};

HlsTsBrowser.prototype.getDataStreamByProgramType = function(type) {
  return this.parser.getPrograms().getDataStream(type);    
};

module.exports = HlsTsBrowser;