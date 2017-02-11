// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

class PESParser {
  constructor(pes) {
    this.data = pes.data;
    this.id = pes.id;
  }

  getId() {
    return this.id;
  }

  getData() {
    return this.data;
  }
}

module.exports = PESParser;