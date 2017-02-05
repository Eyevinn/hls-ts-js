// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const log = require("logplease").create("TSPrograms", { useColors: false });

const TSPrograms = function constructor(pmt, packets, streams) {
  this.pmt = pmt;
  this.packets = packets;
  this.streams = streams;
};

TSPrograms.prototype.getPrograms = function getPrograms() {
  let programs = [];

  Object.keys(this.pmt).filter(programType => this.pmt[programType] !== -1).forEach((programType) => {
    const pid = this.pmt[programType];
    const program = {
      id: pid,
      type: programType,
      packets: 0,
      pts: [],
    };
    this.packets.forEach((p) => {
      if (p.pid === program.id) {
        //program.packets.push(p);
        program.packets++;
        if (p.pts && program.pts.indexOf(p.pts) === -1) {
          program.pts.push(p.pts);
        }
      }
    });
    programs.push(program);
  });

  return programs;
};

TSPrograms.prototype.getPackets = function getPackets(type) {
  if (!this.pmt[type]) {
    log.error(`Unsupported type ${type}`);
    return null;
  }
  if (this.pmt[type] === -1) {
    log.error(`No program found for ${type}`);
    return null;
  }

  const pid = this.pmt[type];
  let packets = [];
  this.packets.filter(p => p.pid === pid).forEach((p) => {
    const packet = {
      pts: p.pts,
      dts: p.dts,
      pid: p.pid,
      payloadUnitStartIndicator: p.pusi,
      adaptationFieldControl: p.atf,
    };
    packets.push(packet);
  });
  return packets;
};

module.exports = TSPrograms;