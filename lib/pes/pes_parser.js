// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

class PESParser {
  constructor(pes) {
    this.data = pes.data;
    this.pes = pes.pes;
    this.id = pes.id;
  }

  getId() {
    return this.id;
  }

  getData() {
    return this.data;
  }

  getHeaders() {
    return this.pes;
  }

  getHeaderForByteOffset(offset) {
    let lastPes = undefined;
    for (let i = 0; i < this.pes.length; i++) {
      const p = this.pes[i];
      if (i > 0 && p.offset > offset) {
        const lastPes = this.pes[i - 1];
        return lastPes;
      }
    }
    return null;
  }
}

module.exports = PESParser;