// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const log = require("logplease").create("TSParser", { useColors: false });
const util = require("./util.js");
const TSPrograms = require("./tsprograms.js");

const SYNC_BYTE = 0x47;
const PACKET_SIZE = 188;
const MIN_PES_HDR_SIZE = 19;
const PES_HDR_SIZE = 6;
const PES_EXT_SIZE = 3;

const PAT_ID = 0x0;
const PID_AAC = 0x0f;
const PID_ID3 = 0x15;
const PID_AVC = 0x1b;
const PID_HEVC = 0x24;
const PID_SCTE35 = 0x86;


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

    // Adaptation Field
    atflen: undefined, // [8]             Number of bytes in the adaptation field imm following this bytes
    disc: undefined,   // [1]      [0x80] Set if current TS packet is in a discontinuity state
    ra: undefined,     // [1]      [0x40] Set when the stream may be decoded without errors from this point
    prio: undefined,   // [1]      [0x20] Set when this stream should be considered "high priority"
    pcr: undefined,    // [1]      [0x10] Set when the PCR field is present
    opcr: undefined,   // [1]      [0x08] Set when the OPCR field is present

    pcrPayload: undefined,
    pcrValue: undefined,
    pcrBase: undefined,
    pcrExt: undefined,
  };
};

const PES = function constructor() {
  return {
    pts: undefined,
    dts: undefined,
    flags: undefined,
    payload: undefined,
    id: undefined,
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
  this.pmt;
  this.media = {
    avc: this._initStream("avc"),
    aac: this._initStream("aac"),
    scte35: this._initStream("scte35"),
  };
  this.bufferedData = undefined;
};

TSParser.prototype.getPrograms = function getPrograms() {
  if (this.bufferedData && this.bufferedData.length > 0) {
    // We have some unparsed data remaining
    log.debug(`We have some unparsed data that we need to take care of ${this.bufferedData.length}`)
    const nil = new Uint8Array(0);
    this.push(nil, true);
  }
  //log.debug(this.size, Object.keys(this.media).map(type => this.media[type].payload.length));
  return new TSPrograms(this.pmt, this.packets, this.media);
};

TSParser.prototype.push = function push(chunk, lastChunk) {
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
  if (!lastChunk && !this.isValidChunk(chunkToParse)) {
    throw new Error("Misaligned chunks to parse");
  }
  const remainBytes = this._parsePackets(chunkToParse);
  //log.debug(`Remaining unparsed bytes: ${remainBytes}`);

  if (remainBytes > 0) {
    // We need to buffer this data until we have a complete packet again
    this.bufferedData = chunk.slice(-remainBytes);
  }
  log.debug(this.size, this.packets.length, Object.keys(this.media).sort().map(type => this.media[type].payload.length));
}

TSParser.prototype.isValidChunk = function isValidChunk(chunk) {
  if(chunk.length >= 3 * PACKET_SIZE && chunk[0] === SYNC_BYTE && chunk[1 * PACKET_SIZE] === SYNC_BYTE && chunk[2 * PACKET_SIZE] === SYNC_BYTE) {
    return true;
  }
  log.debug(`Invalid chunk of data len:${chunk.length},${chunk[0]},${chunk[1*PACKET_SIZE]},${chunk[2*PACKET_SIZE]}`);
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
        packet.atflen = chunk[pos + 4];
        packet.disc = !!(chunk[pos + 5] & 0x80);
        packet.pcr = !!(chunk[pos + 5] & 0x10);

        if (packet.pcr) {
          // TODO: Obtain the Program clock reference (stored as 33 bits base, 6 bits reserved, 9 bits extension)
          packet.pcrPayload = new Uint8Array(6) // 48 bits
          packet.pcrPayload.set(chunk.subarray(pos + 6, pos + 6 + 6));

          packet.pcrBase = (packet.pcrPayload[0] & 0xFF) * 33554432 +// 1 << 25 (33-8)
            (packet.pcrPayload[1] & 0xFF) * 131072 +// 1 << 17 (25-8)
            (packet.pcrPayload[2] & 0xFF) * 512 +// 1 << 9 (17-8)
            (packet.pcrPayload[3] & 0xFF) * 2 +// 1 << 1 (9-8)
            (packet.pcrPayload[4] & 0x80) / 128;
          // check if greater than 2^32 -1
          if (packet.pcrBase > 4294967295) {
            // decrement 2^33
            packet.pcrBase -= 8589934592;
          }
          packet.pcrExt = (packet.pcrPayload[4] & 0x01) * 256 + // 1 << 8
            (packet.pcrPayload[5] & 0xFF);
          packet.pcrValue = packet.pcrBase * 300 + packet.pcrExt;
        }

        offset = pos + 5 + packet.atflen;
        if (offset === (pos + PACKET_SIZE)) {
          continue;
        }
      } else {
        offset = pos + 4;
      }

      //log.debug(`PID:${util.toHex(packet.pid)}`);

      if (this.pat && this.pat.pmtId && packet.pid === this.pat.pmtId) {
        if (packet.pusi) {
          offset += chunk[offset] + 1;

          // Parse PMT
          this.pmt = this._parsePMT(chunk, offset);
          log.debug(this.pmt);
        }
      } else if (this.pmt) {
        // log.debug(`PID:${packet.pid}, AAC:${this.pmt.aac}, AVC:${this.pmt.avc}`);
        let stream;
        if (packet.pid === this.pmt.avc) {
          stream = this.media.avc;
        } else if (packet.pid === this.pmt.aac) {
          stream = this.media.aac;
        } else if (packet.pid === this.pmt.scte35) {
          stream = this.media.scte35;
        }
        if (packet.pusi) {
          if (stream.size > 0) {
            const pes = this._parsePES(stream);
            if (pes) {
              /* @type {HlsTsPesHeader} */
              const peshdr = {};
              if (pes.pts) {
                peshdr.pts = pes.pts;
              }
              if (pes.dts) {
                peshdr.dts = pes.dts;
              }
              if (pes.id) {
                stream.id = pes.id;
              }
              peshdr.offset = stream.payload.length;
              stream.peshdr.push(peshdr);

              let newPayload = new Uint8Array(stream.payload.length + pes.payload.length);
              newPayload.set(stream.payload);
              newPayload.set(pes.payload, stream.payload.length);
              stream.payload = newPayload;
            }
            stream.data = [];
            stream.size = 0; 
          }
        }
        stream.data.push(chunk.subarray(offset, pos + PACKET_SIZE));
        stream.size += pos + PACKET_SIZE - offset;
      } else {
        switch(packet.pid) {
          case PAT_ID:
            if (packet.pusi) {
              offset += chunk[offset] + 1;
            }
            this.pat = this._parsePAT(chunk, offset);
            log.debug(`PMT:${util.toHex(this.pat.pmtId)}`)
            break;
        }
      }
    } else {
      throw new Error("Invalid packet");
    }
    this.packets.push(packet);  
    pos += PACKET_SIZE;
  }

  // We might have data left to parse
  Object.keys(this.media).forEach((type) => {
    const stream = this.media[type];
    if (stream.size > 0) {
      const pes = this._parsePES(stream);
      if (pes) {
        const peshdr = {};
        if (pes.pts) {
          peshdr.pts = pes.pts;
        }
        if (pes.dts) {
          peshdr.dts = pes.dts;
        }
        if (pes.id) {
          stream.id = pes.id;
        }
        peshdr.offset = stream.payload.length;
        stream.peshdr.push(peshdr);

        let newPayload = new Uint8Array(stream.payload.length + pes.payload.length);
        newPayload.set(stream.payload);
        newPayload.set(pes.payload, stream.payload.length);
        stream.payload = newPayload;
      }
      stream.data = [];
      stream.size = 0;
    }
  });

  return (len - pos);
};

TSParser.prototype._initStream = function _initStream(type) {
  return {
    type: type,
    data: [],
    payload: new Uint8Array(0),
    size: 0,
    peshdr: [],
  };
};

TSParser.prototype._parsePES = function _parsePES(stream) {
  if (stream.size === 0) {
    throw new Error("Can't parse PES as stream size is 0");
  }

  if (stream.data[0].length < MIN_PES_HDR_SIZE) {
    if (stream.data.length > 1) {

    } else {  
      throw new Error(`${stream.type}:Insufficient data to parse PES header ${stream.data[0].length} (${stream.data.length})`);
    }
  }
  const pes = new PES();

  //log.debug(`${stream.type}: ${stream.size} bytes PES to parse`);
  let fragment = stream.data[0];
  const prefix = (fragment[0] << 16) + (fragment[1] << 8) + fragment[2];
  let payloadStart = 0, hdrlen = 0;
  
  if (prefix === 1) {
    pes.id = fragment[3];
    pes.pkglen = (fragment[4] << 8) + fragment[5];
    if (pes.pkglen && pes.pkglen > stream.size - 6) {
      const remain = pes.pkglen - stream.size;
      //log.debug(`${stream.type}: Incomplete PES package we need to wait for more data (${pes.pkglen}): ${remain} bytes`)
      return null;
    }
    if (pes.pkglen === 0) {
      // If PES package length is 0 the PES packet can be of any length
    }
    pes.flags = fragment[7]; // Seond byte in optional PES header

    if (pes.flags & 0xC0) {
      // PTS/DTS Indicator

      // All cred to HLS.js developers for this "magic
      // As PTS / DTS is 33 bit we cannot use bitwise operator in JS
      // as it treat their operands as a sequence of 32 bits
      pes.pts = (fragment[9] & 0x0E) * 536870912 +// 1 << 29
        (fragment[10] & 0xFF) * 4194304 +// 1 << 22
        (fragment[11] & 0xFE) * 16384 +// 1 << 14
        (fragment[12] & 0xFF) * 128 +// 1 << 7
        (fragment[13] & 0xFE) / 2;
      // check if greater than 2^32 -1
      if (pes.pts > 4294967295) {
        // decrement 2^33
        pes.pts -= 8589934592;
      }
      if (pes.flags & 0x40) {
        pes.dts = (fragment[14] & 0x0E ) * 536870912 +// 1 << 29
          (fragment[15] & 0xFF ) * 4194304 +// 1 << 22
          (fragment[16] & 0xFE ) * 16384 +// 1 << 14
          (fragment[17] & 0xFF ) * 128 +// 1 << 7
          (fragment[18] & 0xFE ) / 2;
        // check if greater than 2^32 -1
        if (pts.dts > 4294967295) {
          // decrement 2^33
          pes.dts -= 8589934592;
        }
      } else {
        pes.dts = pes.pts;
      }
    }
    hdrlen = fragment[8];
    payloadStart = hdrlen + PES_HDR_SIZE + PES_EXT_SIZE;
  }

  pes.payload = new Uint8Array(stream.size - payloadStart);
  let i = 0;

  for (let j = 0; j < stream.data.length; j++) {
    fragment = stream.data[j];
    let len = fragment.byteLength;
    if (payloadStart) {
      if (payloadStart > len) {
        payloadStart -= len;
        continue;
      } else {
        fragment = fragment.subarray(payloadStart);
        len -= payloadStart;
        payloadStart = 0;
      }
    }
    pes.payload.set(fragment, i);
    i +=  len;      
  }
  if (pes.pkglen) {
    pes.pkglen -= hdrlen + PES_EXT_SIZE;
  }
  return pes;
};

TSParser.prototype._parsePAT = function _parsePAT(chunk, offset) {
  const pat = {};

  pat.pmtId = (chunk[offset + 10] & 0x1F) << 8 | chunk[offset + 11];

  return pat;
}

TSParser.prototype._parsePMT = function _parsePMT(chunk, offset) {
  const pmt = {
    avc: -1,
    hevc: -1,
    aac: -1,
    id3: -1,
    scte35: -1,
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
        if (pmt.aac === -1) {
          pmt.aac = pid;
        }
        break;
      case PID_AVC:
        if (pmt.avc === -1) {
          pmt.avc = pid;
        }
        break;
      case PID_HEVC:
        if (pmt.hevc === -1) {
          pmt.hevc = pid;
        }
        break;
      case PID_ID3:
        if (pmt.id3 === -1) {
          pmt.id3 = pid;
        }
        break;
      case PID_SCTE35:
        if (pmt.scte35 === -1) {
          pmt.scte35 = pid;
        }
        break;
      default:
        log.debug(`Unknown stream type ${type}`);
        break;
    }
    offset += ((chunk[offset + 3] & 0x0F) << 8 | chunk[offset + 4]) + 5;
  }

  return pmt;
}

module.exports = TSParser;