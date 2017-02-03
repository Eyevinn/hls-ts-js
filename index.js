const ParseStream = require("./lib/parse_stream.js");

const HlsTS = {
  parse: function(opts) {
    return new ParseStream(opts);
  }
};

module.exports = HlsTS;