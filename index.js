const Logger = require("logplease");
const ParseStream = require("./lib/parse_stream.js");
const AVCParser = require("./lib/pes/pes_avc_parser.js");

/**
 * @typedef {Object} HlsTsOptions
 * @property {boolean} debug Output debug informatin to logger
 */

/**
 * @typedef {Object} HlsTsPacket
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
  get programs() {
    if (!this.streamParser) {
      throw new Error("Nothing parsed yet");
    }
    return this.streamParser.getPrograms().getTypes();    
  },
  /**
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
  createAvcParser(dataStream) {
    return new AVCParser(dataStream);
  },
};

module.exports = HlsTS;