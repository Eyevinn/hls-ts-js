// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const log = require("logplease").create("TSPrograms", { useColors: false });

const TSPrograms = function constructor(pmt, packets, streams) {
  this.pmt = pmt;
  this.packets = packets;
  this.streams = streams;

  Object.keys(this.streams).forEach((type) => {
    const stream = this.streams[type];
    if (stream.size > 0) {
      throw new Error(`Stream of type ${type} has ${stream.size} bytes of unparsed data`);
    }
  });
};

TSPrograms.prototype.getTypes = function getTypes() {
  let programs = [];

  Object.keys(this.pmt).filter(programType => this.pmt[programType] !== -1).forEach((programType) => {
    const pid = this.pmt[programType];
    const program = {
      id: pid,
      type: programType,
      packets: 0,
      pts: [],
      dts: [],
    };
    program.pts = this.streams[program.type].pts;
    program.dts = this.streams[program.type].dts;
    this.packets.forEach((p) => {
      if (p.pid === program.id) {
        program.packets++;
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
      pid: p.pid,
      payloadUnitStartIndicator: p.pusi,
      adaptationFieldControl: p.atf,
      pcr: { 
        base: p.pcrBase,
        value: p.pcrValue,
      }
    };
    packets.push(packet);
  });
  return packets;
};

TSPrograms.prototype.getDataStream = function getDataStream(type) {
  if (!this.streams[type]) {
    log.error(`No stream available for type ${type}`);
    return null;
  }
  
  const buffer = new ArrayBuffer(this.streams[type].payload.length);
  const dataStream = {
    data: new Uint8Array(buffer),
    size: this.streams[type].payload.length,
  };
  dataStream.data.set(this.streams[type].payload);

  return dataStream;
};

module.exports = TSPrograms;