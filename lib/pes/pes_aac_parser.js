// Copyright 2018 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const PESParser = require("./pes_parser.js");
const log = require("logplease").create("PESAACParser", { useColors: false });
const util = require("../util.js");

const SAMPLING_RATES = {
  0: 96000,  // `0000` - 96000 Hz
  1: 88200,  // `0001` - 88200 Hz
  2: 64000,  // `0010` - 64000 Hz
  3: 48000,  // `0011` - 48000 Hz
  4: 44100,  // `0100` - 44100 Hz
  5: 32000,  // `0101` - 32000 Hz
  6: 24000,  // `0110` - 24000 Hz
  7: 22050,  // `0111` - 22050 Hz
  8: 16000,  // `1000` - 16000 Hz
  9: 12000,  // `1001` - 12000 Hz
 10: 11025,  // `1010` - 11025 Hz
 11:  8000,  // `1011` - 8000 Hz
 12:  7350,  // `1100` - 7350 Hz
 13:     0,  // `1101` - Reserved
 14:     0,  // `1110` - Reserved
 15:     0,  // `1111` - other
};

const CHANNELS = {
  0: 0.0,
  1: 1.0,    //   1 ch - (Front:       center)
  2: 2.0,    //   2 ch - (Front: left,         right)
  3: 3.0,    //   3 ch - (Front: left, center, right)
  4: 4.0,    //   4 ch - (Front: left, center, right)                   (Rear:       center)
  5: 5.0,    //   5 ch - (Front: left, center, right)                   (Rear: left,        right)
  6: 5.1,    // 5.1 ch - (Front: left, center, right)                   (Rear: left,        right, subwoofer)
  7: 7.1,    // 7.1 ch - (Front: left, center, right)(Side: left, right)(Rear: left,        right, subwoofer)
};

class PESAACParser extends PESParser {
  constructor(pes) {
    super(pes);
  }
  
  getAdtsFrames() {
    const data = this.getData();
    const len = data.byteLength;
    let pos = 0;
    let adtsFrames = [];

    //log.debug(util.hexDump(data));

    let byte0, byte1, byte2, byte3, byte4, byte5, byte6, byte7, byte8;
    while (pos < len) {
      byte0 = data[pos];
      byte1 = data[pos + 1];      
      byte2 = data[pos + 2];      
      byte3 = data[pos + 3];      
      byte4 = data[pos + 4];      
      byte5 = data[pos + 5];      
      byte6 = data[pos + 6];      
      byte7 = data[pos + 7];      
      byte8 = data[pos + 8];      
      //log.debug(`pos=${pos}, byte:`, util.toHex(byte));

      let syncword = (byte0 === 0xFF) && ((byte1 & 0xF0) === 0xF0);   // 1111 1111 1111
      let mpegVersion = (byte1 & 0x08) === 1 ? 2 : 4;                 // 0 == MPEG4, 1 == MPEG2
      let layer = (byte1 & 0x06) === 0 ? true : false;
      let crcProtection = (byte1 & 0x01) === 0 ? true : false;        // 0 == HAS CRC, 1 == NO CRC
      let audioObjectType = ((byte2 & 0xC0) >> 6) + 1;                // 2 == AAC-LC, 5 == HE-AAC, 29 == HE-AAC v2
      let samplingRate = SAMPLING_RATES[(byte2 & 0x3C) >> 2];         // 0100 == 44100
      let channels = CHANNELS[((byte2 & 0x01) << 2 | byte3 & 0xC0) >> 6];  // 2 == LEFT+RIGHT

      let adtsFrameLength = (byte3 & 0x03) << 11 | byte4 << 3 | (byte5 & 0xE0) >> 5; // adtsHeaderLength + crcLength + (rawDataBlockEnd - rawDataBlockStart)
      let bufferFullness  = (byte5 & 0x1f) << 6  | byte6 >> 2;
      let rdbsInFrame = (byte6 & 0x03);
      let adtsHeaderLength = 7;
      let crcLength  = crcProtection ? 2 : 0;
      let rawDataBlockStart = pos + adtsHeaderLength;
      let rawDataBlockEnd = pos + adtsFrameLength;
      let crc1 = crcProtection ? (((byte7 << 8) | byte8) >>> 0) : 0;
      let crc2 = crc1;
      let error = false;

      if (!syncword || !layer || audioObjectType !== 2) {
        error = true;
      }
      //log.debug(`${pos}: syncword=${syncword}, layer=${layer}, audioObjectType=${audioObjectType}, error=${error}`);

      if (error) {
        pos++; // skip unknown byte
      } else {
        let pes = this.getHeaderForByteOffset(pos);
        pos += adtsFrameLength;

        adtsFrames.push({
          pes: pes,
          frameStart: pos,
          frameEnd: rawDataBlockEnd,
          mpegVersion: mpegVersion,
          crcProtection: crcProtection,
          audioObjectType: audioObjectType,
          samplingRate: samplingRate,
          channels: channels,
          adtsFrameLength: adtsFrameLength,
          adtsHeaderLength: adtsHeaderLength,
          crcLength: crcLength,
          rawDataBlockStart: rawDataBlockStart,
          rawDataBlockEnd: rawDataBlockEnd,
          bufferFullness: bufferFullness,
          rdbsInFrame: rdbsInFrame,
          error: error,
        });
      }

    }
    return adtsFrames;
  }

  audioType(type) {
    const mapping = {
      2: 'AAC-LC',
      5: 'HE-AAC',
      29: 'HE-AACv2'
    };
    return mapping[type];
  }
}

module.exports = PESAACParser;