const Logger = require("logplease");
const ParseStream = require("./lib/parse_stream.js");
const AVCParser = require("./lib/pes/pes_avc_parser.js");

const HlsTS = {
  streamParser: undefined,
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
  getPacketsByProgramType(type) {
    if (!this.streamParser) {
      throw new Error("Nothing parsed yet");
    }
    return this.streamParser.getPrograms().getPackets(type);    
  },
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