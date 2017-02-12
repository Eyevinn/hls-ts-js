// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const Logger = require("logplease");
const TSParser = require("./tsparser.js");
const AVCParser = require("./pes/pes_avc_parser.js");

/**
 * Create an HLS TS parser
 * 
 * @example
 * var parser = new window.HlsTs({ debug: false });
 * parser.parse(data).then(function() {
 *   var avcPayload = parser.getDataStreamByProgramType("avc");
 * });
 * @constructor
 * @alias window.HlsTs
 * @param {?HlsTsOptions} opts
 */
const HlsTsBrowser = function constructor(opts) {
  if (opts && opts.debug) {
    Logger.setLogLevel("DEBUG");            
  } else {
    Logger.setLogLevel("INFO");
  }
  this.parser = new TSParser();
};

/**
 * Parse HLS TS data
 * 
 * @param {Uint8Array} data The data to parse
 * @return {Promise} Resolves when data is parsed
 */
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

/**
 * Get the parsed program types
 * 
 * @return {HlsTsProgramType[]}
 */
HlsTsBrowser.prototype.getPrograms = function() {
  return this.parser.getPrograms().getTypes();
};

/**
 * Get all packets for a specific program type
 * 
 * @param {string} type Program type e.g: "avc" or "aac"
 * @return {HlsTsPacket[]}
 */
HlsTsBrowser.prototype.getPacketsByProgramType = function(type) {
  return this.parser.getPrograms().getPackets(type);    
};

/**
 * Get the data stream for a program type
 * 
 * @param {string} type Program type e.g: "avc" or "aac"
 * @return {HlsTsDataStream}
 */
HlsTsBrowser.prototype.getDataStreamByProgramType = function(type) {
  return this.parser.getPrograms().getDataStream(type);    
};

/**
 * Create an AVC Parser that can parse an AVC data stream
 * 
 * @example
 * var parser = new window.HlsTs();
 * parser.parse(data).then(function() {
 *   var avcParser = parser.createAvcParser(parser.getDataStreamByProgramType("avc"));
 *   var nalUnits = avcParser.getNalUnits();
 * });
 * @param {HlsTsDataStream} dataStream
 * @return {AVCParser}
 */
HlsTsBrowser.prototype.createAvcParser = function(dataStream) {
  return new AVCParser(dataStream);
}

module.exports = HlsTsBrowser;