const Logger = require("logplease");
const ParseStream = require("./lib/parse_stream.js");
const AVCParser = require("./lib/pes/pes_avc_parser.js");

/**
 * @typedef {Object} HlsTsOptions
 * @property {boolean} debug Output debug informatin to logger
 */

/**
 * @typedef {Object} HlsTsProgramType
 * @property {number} id Program ID
 * @property {string} type Program type, e.g: avc, aac, id3
 * @property {number[]} pts List of all PTS values found
 * @property {number[]} dts List of all DTS values found
 */

/**
 * @typedef HlsTsPCR
 * @property {number} base PCR base part
 * @property {number} value PCR value part
 */

/**
 * @typedef {Object} HlsTsPacket
 * @property {number} pid Program ID this packet belongs to
 * @property {boolean} payloadUnitStartIndicator Payload Unit Start Indicator (PUSI)
 * @property {number} adaptationFieldControl Adaptation Field Control (ATF)
 * @property {HlsTsPCR} pcr PCR value
 */

/**
 * @typedef {Object} HlsTsDataStream
 */

/** 
 * @module HlsTs
 */

const HlsTS = {
  streamParser: undefined,
  /**
   * Parse HLS TS when reading from a Stream
   *
   * @function parse
   * @example
   * fs.createReadStream("./seg-10s.ts")
   * .pipe(hlsTs.parse({ debug: true }))
   * .on("finish", function() {
   *   const avcPayload = hlsTs.getDataStreamByProgramType("avc");
   * });   
   * @param {?HlsTsOptions} opts
   * @return {ParseStream}
   */
  parse: function(opts) {
    if (opts && opts.debug) {
      Logger.setLogLevel("DEBUG");            
    } else {
      Logger.setLogLevel("INFO");
    }
    this.streamParser = new ParseStream(opts);
    return this.streamParser;
  },
  /**
   * Get the parsed program types
   * 
   * @member {HlsTsProgramType[]} programs
   */
  get programs() {
    if (!this.streamParser) {
      throw new Error("Nothing parsed yet");
    }
    return this.streamParser.getPrograms().getTypes();    
  },
  /**
   * Get all packets for a specific program type
   * 
   * @function getPacketsByProgramType
   * @param {string} type
   * @return {HlsTsPacket[]}
   */
  getPacketsByProgramType(type) {
    if (!this.streamParser) {
      throw new Error("Nothing parsed yet");
    }
    return this.streamParser.getPrograms().getPackets(type);    
  },
  /**
   * Get the data stream for a program type
   * 
   * @function getDataStreamByProgramType
   * @param {string} type
   * @return {HlsTsDataStream}
   */
  getDataStreamByProgramType(type) {
    if (!this.streamParser) {
      throw new Error("Nothing parsed yet");
    }
    return this.streamParser.getPrograms().getDataStream(type);    
  },
  /**
   * Create an AVC Parser that can parse an AVC data stream
   * 
   * @function createAvcParser
   * @param {HlsDataStream} dataStream
   * @return {AVCParser}
   */
  createAvcParser(dataStream) {
    return new AVCParser(dataStream);
  },
};

module.exports = HlsTS;