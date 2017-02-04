// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const log = require("logplease").create("TSParser", { useColors: false });
const util = require("./util.js");

const SYNC_BYTE = 0x47;
const PACKET_SIZE = 188;
const PAT_ID = 0x0;
const PID_AAC = 0x0f;
const PID_ID3 = 0x15;
const PID_AVC = 0x1b;


const Packet = function constructor() {
  return {
    sync: undefined, // [8]  [0xff000000] Sync byte
    tei: undefined,  // [1]    [0x800000] Transport Error Indicator
    pusi: undefined, // [1]    [0x400000] Payload Unit Start Indicator
    tp: undefined,   // [1]    [0x200000] Transport Priority 
    pid: undefined,  // [13]   [0x1fff00] Packet Identifier, describing the payload data
    tsc: undefined,  // [2]        [0xc0] Transport Scrambling Control
    atf: undefined,  // [2]        [0x30] Adaptation Field Control
    co: undefined,   // [4]         [0xf] Continuity Order
    payload: undefined
  };
};

/**
 * @param {Uint8Array} data
 * @constructor
 */
const TSParser = function constructor() {
  this.size = 0;
  this.packets = [];
  this.pat;
  this.bufferedData = undefined;
};

TSParser.prototype.getPackets = function getPackets() {
  return this.packets;
};

TSParser.prototype.push = function push(chunk) {
  this.size += chunk.length;
  let chunkToParse = chunk;
  if (this.bufferedData && this.bufferedData.length > 0) {
    // Append this chunk to the remainder from the last chunk
    //log.debug("Appending chunk to remainder from last chunk");
    chunkToParse = new Uint8Array(this.bufferedData.length + chunk.length);
    chunkToParse.set(this.bufferedData);
    chunkToParse.set(chunk, this.bufferedData.length);
    this.bufferedData = undefined;
  }
  if (!this.isValidChunk(chunkToParse)) {
    throw new Error("Misaligned chunks to parse");
  }
  const remainBytes = this._parsePackets(chunkToParse);
  //log.debug(`Remaining unparsed bytes: ${remainBytes}`);

  if (remainBytes > 0) {
    // We need to buffer this data until we have a complete packet again
    this.bufferedData = chunk.slice(-remainBytes);
  }
}

TSParser.prototype.isValidChunk = function isValidChunk(chunk) {
  if(chunk.length >= 3 * PACKET_SIZE && chunk[0] === SYNC_BYTE && chunk[1 * PACKET_SIZE] === SYNC_BYTE && chunk[2 * PACKET_SIZE] === SYNC_BYTE) {
    return true;
  }
  return false;
};

TSParser.prototype._parsePackets = function _parsePackets(chunk) {
  let len = chunk.length;
  let offset;
  let pos = 0;

  while (pos < (len - PACKET_SIZE)) {
    let packet = new Packet();
    if (chunk[pos] === SYNC_BYTE) {
      // Yes we have a valid packet
      packet.sync = chunk[pos];

      packet.pusi = !!(chunk[pos + 1] & 0x40);

      // Get the packet identifier
      packet.pid = ((chunk[pos + 1] & 0x1f) << 8) + chunk[pos + 2];

      packet.atf = (chunk[pos + 3] & 0x30) >> 4;
      if (packet.atf > 1) {
        // Not parsing the Adaptation Field now
        offset = pos + 5 + chunk[pos + 4];
        if (offset === (pos + PACKET_SIZE)) {
          continue;
        }
      } else {
        offset = pos + 4;
      }

      //log.debug(`PID:${util.toHex(packet.pid)}`);

      switch(packet.pid) {
        case PAT_ID:
          if (packet.pusi) {
            offset += chunk[offset] + 1;
          }
          this.pat = this._parsePAT(chunk, offset);
          log.debug(`PMT:${util.toHex(this.pat.pmtId)}`)
          break;
      }

      if (this.pat.pmtId && packet.pid === this.pat.pmtId) {
        if (packet.pusi) {
          offset += chunk[offset] + 1;

          // Parse PMT
          this.pmt = this._parsePMT(chunk, offset);
          log.info(this.pmt);
        }
      }
    }
    this.packets.push(packet);  
    pos += PACKET_SIZE;
  }
  return (len - pos);
};

TSParser.prototype._parsePAT = function _parsePAT(chunk, offset) {
  const pat = {};

  pat.pmtId = (chunk[offset + 10] & 0x1F) << 8 | chunk[offset + 11];

  return pat;
}

TSParser.prototype._parsePMT = function _parsePMT(chunk, offset) {
  const pmt = {
    avc: -1,
    audio: -1,
  };

  const sectionLength = (chunk[offset + 1] & 0x0f) << 8 | chunk[offset + 2];
  const tableEnd = offset + 3 + sectionLength - 4;
  const programInfoLength = (chunk[offset + 10] & 0x0f) << 8 | chunk[offset + 11];
  offset += 12 + programInfoLength;

  while (offset < tableEnd) {
    const pid = (chunk[offset + 1] & 0x1F) << 8 | chunk[offset + 2];
    const type = chunk[offset];
    switch (type) {
      case PID_AAC:
        if (pmt.audio === -1) {
          pmt.audio = pid;
        }
        break;
      case PID_AVC:
        if (pmt.avc === -1) {
          pmt.avc = pid;
        }
        break;
    }
    offset += ((chunk[offset + 3] & 0x0F) << 8 | chunk[offset + 4]) + 5;
  }

  return pmt;
}

module.exports = TSParser;