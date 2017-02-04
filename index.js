const Logger = require("logplease");
const ParseStream = require("./lib/parse_stream.js");

if (process.env.DEBUG) {
  Logger.setLogLevel("DEBUG");
} else {
  Logger.setLogLevel("INFO");
}

const HlsTS = {
  parse: function(opts) {
    return new ParseStream(opts);
  }
};

module.exports = HlsTS;