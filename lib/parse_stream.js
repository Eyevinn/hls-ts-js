// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const Transform = require("readable-stream/transform");
const PullStream = require("pullstream");
const inherits = require("util").inherits;
const TSParser = require("./tsparser.js");

inherits(ParseStream, Transform);

function ParseStream(opts) {
  Transform.call(this, { lowWaterMark: 0 });
  this.hasListeners = false;

  this.pullStream = new PullStream();
  this.pullStream.pull(function(err, data) {
    console.log(data.length);
  });
};

ParseStream.prototype._transform = function (chunk, encoding, callback) {
  if (this.pullStream.write(chunk)) {
    return callback();
  }

  this.pullStream.once('drain', callback);
};

ParseStream.prototype.on = function(type, listener) {
  if (type === "parsed") {
    this.hasListeners = true;
  }
  return Transform.prototype.addListener.call(this, type, listener);
};

module.exports = ParseStream;