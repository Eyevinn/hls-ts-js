const Logger = require("logplease");
const ParseStream = require("./lib/parse_stream.js");

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
  get packets() {
    if (!this.streamParser) {
      throw new Error("Nothing parsed yet");
    }
    return this.streamParser.getPackets();    
  }
};

module.exports = HlsTS;