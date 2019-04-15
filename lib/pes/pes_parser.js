// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

/**
 * @class
 */
class PESParser {
  /**
   * @constructor
   * @param {HlsTsDataStream} pes Data stream to parse
   */
  constructor(pes) {
    this.data = pes.data;
    this.pes = pes.pes;
    this.id = pes.id;
  }

  /**
   * Get program ID
   * 
   * @return {number} Program ID
   */
  getId() {
    return this.id;
  }

  /**
   * Get data stream as Uint8 byte array
   * 
   * @return {Uint8Array} Data stream
   */
  getData() {
    return this.data;
  }

  /**
   * Get PES headers in this data stream
   * 
   * @return {HlsTsPesHeader[]}
   */
  getHeaders() {
    return this.pes;
  }

  /**
   * Get a PES header at a specific position in the data stream
   * 
   * @param {number} offset Position in the data stream
   * @return {HlsTsPesHeader}
   */
  getHeaderForByteOffset(offset) {
    let lastPes = undefined;
    for (let i = 0; i < this.pes.length; i++) {
      const p = this.pes[i];
      if (i > 0 && p.offset > offset) {
        const lastPes = this.pes[i - 1];
        return lastPes;
      }
    }
    if (this.pes.length > 0) {
        return this.pes[this.pes.length - 1];
    }
    return null;
  }
}

module.exports = PESParser;
