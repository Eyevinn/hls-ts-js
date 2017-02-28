// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const util = require("../util.js");

class ExpGolomb {
  constructor(rbspData) {
    this.rbspData = rbspData;
    this.currentBitPos = 0;
    this.currentBytePos = 0;
    this.posInByte = 0;
    this.lastPulledByte = null;
  }

  _pullByte() {
    return this.rbspData[this.currentBytePos];
  }

  _pullWord() {
    const bytes = new Uint8Array(4);
    bytes[0] = this._pullByte();   
    bytes[1] = this._pullByte();   
    bytes[2] = this._pullByte();   
    bytes[3] = this._pullByte();
    return new DataView(bytes).getUint32(0);  
  }

  _increment(numBits) {
    if (numBits > 32) {
      throw new Error("Can only increment with max 32 bits at a time");
    }
    this.currentBitPos += numBits;
    this.currentBytePos = Math.floor(this.currentBitPos / 8);
  }

  readByte() {
    const byte = this._pullByte();
    this._increment(8);
    return byte;
  }

  readBits(numBits) {
    let remainingBits = numBits;
    let bits = [];

    while (remainingBits > 0) {
      let consumedBits = 0;
      const byte = this._pullByte();
      const bitsArray = util.readBits(byte, Math.min(8, remainingBits));
      bits = bits.concat(bitsArray.slice(this.posInByte));
      consumedBits = Math.min(numBits, 8 - this.posInByte);
      if (remainingBits < 8) {
        this.posInByte = 8 - remainingBits;
      } else {
        this.posInByte = 0;
      }
      remainingBits -= consumedBits;
      this._increment(consumedBits);
    }
    return bits;
  }

  readFlags(numBits) {
    const byte = this._pullByte();
    this._increment(numBits);
    return util.readFlags(byte, numBits);
  }

  skipByte() {
    this._increment(8);
  }

  skipBits(numBits) {
    this._increment(numBits);
  }
}

module.exports = ExpGolomb;