// Copyright 2017 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const request = require("request");
const Logger = require("logplease");
const hlsTs = require("../../../index.js");
const PESParser = require("../../../lib/pes/pes_parser.js");
const PESAVCParser = require("../../../lib/pes/pes_avc_parser.js");
const ExpGolomb = require("../../../lib/pes/exp_golomb.js");
const util = require("../../../lib/util.js");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

const mockNalU = "" +
"00 00 00 01 67 64 00 0A AC 72 84 44 26 84 00 00" +
"03 00 04 00 00 03 00 CA 3C 48 96 11 80 00 00 00" +
"01 68 E8 43 8F 13 21 30 00 00 01 65 88 81 00 05" +
"4E 7F 87 DF 61 A5 8B 95 EE A4 E9 38 B7 6A 30 6A" +
"71 B9 55 60 0B 76 2E B5 0E E4 80 59 27 B8 67 A9" +
"63 37 5E 82 20 55 FB E4 6A E9 37 35 72 E2 22 91" +
"9E 4D FF 60 86 CE 7E 42 B7 95 CE 2A E1 26 BE 87" +
"73 84 26 BA 16 36 F4 E6 9F 17 DA D8 64 75 54 B1" +
"F3 45 0C 0B 3C 74 B3 9D BC EB 53 73 87 C3 0E 62" +
"47 48 62 CA 59 EB 86 3F 3A FA 86 B5 BF A8 6D 06" +
"16 50 82 C4 CE 62 9E 4E E6 4C C7 30 3E DE A1 0B" +
"D8 83 0B B6 B8 28 BC A9 EB 77 43 FC 7A 17 94 85" +
"21 CA 37 6B 30 95 B5 46 77 30 60 B7 12 D6 8C C5" +
"54 85 29 D8 69 A9 6F 12 4E 71 DF E3 E2 B1 6B 6B" +
"BF 9F FB 2E 57 30 A9 69 76 C4 46 A2 DF FA 91 D9" +
"50 74 55 1D 49 04 5A 1C D6 86 68 7C B6 61 48 6C" +
"96 E6 12 4C 27 AD BA C7 51 99 8E D0 F0 ED 8E F6" +
"65 79 79 A6 12 A1 95 DB C8 AE E3 B6 35 E6 8D BC" +
"48 A3 7F AF 4A 28 8A 53 E2 7E 68 08 9F 67 77 98" +
"52 DB 50 84 D6 5E 25 E1 4A 99 58 34 C7 11 D6 43" +
"FF C4 FD 9A 44 16 D1 B2 FB 02 DB A1 89 69 34 C2" +
"32 55 98 F9 9B B2 31 3F 49 59 0C 06 8C DB A5 B2" +
"9D 7E 12 2F D0 87 94 44 E4 0A 76 EF 99 2D 91 18" +
"39 50 3B 29 3B F5 2C 97 73 48 91 83 B0 A6 F3 4B" +
"70 2F 1C 8F 3B 78 23 C6 AA 86 46 43 1D D7 2A 23" +
"5E 2C D9 48 0A F5 F5 2C D1 FB 3F F0 4B 78 37 E9" +
"45 DD 72 CF 80 35 C3 95 07 F3 D9 06 E5 4A 58 76" +
"03 6C 81 20 62 45 65 44 73 BC FE C1 9F 31 E5 DB" +
"89 5C 6B 79 D8 68 90 D7 26 A8 A1 88 86 81 DC 9A" +
"4F 40 A5 23 C7 DE BE 6F 76 AB 79 16 51 21 67 83" +
"2E F3 D6 27 1A 42 C2 94 D1 5D 6C DB 4A 7A E2 CB" +
"0B B0 68 0B BE 19 59 00 50 FC C0 BD 9D F5 F5 F8" +
"A8 17 19 D6 B3 E9 74 BA 50 E5 2C 45 7B F9 93 EA" +
"5A F9 A9 30 B1 6F 5B 36 24 1E 8D 55 57 F4 CC 67" +
"B2 65 6A A9 36 26 D0 06 B8 E2 E3 73 8B D1 C0 1C" +
"52 15 CA B5 AC 60 3E 36 42 F1 2C BD 99 77 AB A8" + 
"A9 A4 8E 9C 8B 84 DE 73 F0 91 29 97 AE DB AF D6" +
"F8 5E 9B 86 B3 B3 03 B3 AC 75 6F A6 11 69 2F 3D" +
"3A CE FA 53 86 60 95 6C BB C5 4E F3";

describe("PES Parser", () => {
  describe("AVC", () => {
    it("can correctly translate NALU types", () => {
      const pesAvcParser = new PESAVCParser({});
      expect(pesAvcParser.nalUnitType(5)).toBe("Coded slice of an IDR picture");
      expect(pesAvcParser.nalUnitCategory(5)).toBe("VCL");
      expect(pesAvcParser.nalUnitCategory(6)).toBe("non-VCL");
    });
    it("can parse NAL units", () => {
      const mockPayload = hexToBytes(mockNalU);
      const pesAvcParser = new PESAVCParser({ data: mockPayload, pes: [] });
      const nalUnits = pesAvcParser.getNalUnits();
      expect(nalUnits.length).toBe(3);
      expect(nalUnits[0].type).toBe(7);
      expect(nalUnits[1].type).toBe(8);
      expect(nalUnits[2].type).toBe(5);
    });
    it("can get the rbsp from a NAL unit", () => {
      const mockPayload = hexToBytes(mockNalU);
      const pesAvcParser = new PESAVCParser({ data: mockPayload, pes: [] });
      const nalUnits = pesAvcParser.getNalUnits();
      const rbsp = pesAvcParser.rbspFromNalUnit(nalUnits[0]);
      expect(rbsp[12]).toBe(0);
      expect(rbsp[13]).toBe(4);
    });
    it("can parse SPS in a NAL unit", () => {
      const mockPayload = hexToBytes(mockNalU);
      const pesAvcParser = new PESAVCParser({ data: mockPayload, pes: [] });
      const nalUnits = pesAvcParser.getNalUnits();
      const sps = pesAvcParser.spsFromNalUnit(nalUnits[0]);
      expect(sps).toBeDefined();
    });    
    it("can parse payload", (done) => {
      const stream = request.get("http://localhost:9876/base/test/support/testassets/seg-10s.ts");
      stream.pipe(hlsTs.parse({ debug: false })).on("finish", () => {
        const avcData = hlsTs.getDataStreamByProgramType("avc");
        const pesAvcParser = new PESAVCParser(avcData);
        expect(pesAvcParser.getId()).toBe(224);
        expect(pesAvcParser.getNalUnits().length).toBe(1015);
        done(); 
      });
    });
  });
  describe("Exp-Golomb decoder", () => {
    it("can read 6 bits from a two bytes array", () => {
      const mockData = new Uint8Array(2);
      mockData[0] = 0x88; // 1000 1000
      mockData[1] = 0x44; // 0100 0100

      // Expect to have 1,0,0,0,1,0
      const egData = new ExpGolomb(mockData);
      const bits = egData.readBits(6);
      expect(bits).toEqual([1,0,0,0,1,0]);
    });
    it("can read 4 bits from a two bytes array and then read 8 more", () => {
      const mockData = new Uint8Array(2);
      mockData[0] = 0x88; // 1000 1000
      mockData[1] = 0x44; // 0100 0100
      const egData = new ExpGolomb(mockData);
      const firstBits = egData.readBits(4);
      const secondBits = egData.readBits(8);
      expect(firstBits).toEqual([1,0,0,0]);
      expect(secondBits).toEqual([1,0,0,0,0,1,0,0]);
    });
    it("can read 3 bits from a two bytes array and then read 7 more", () => {
      const mockData = new Uint8Array(2);
      mockData[0] = 0x88; // 1000 1000
      mockData[1] = 0x44; // 0100 0100
      const egData = new ExpGolomb(mockData);
      const firstBits = egData.readBits(3);
      const secondBits = egData.readBits(7);
      expect(firstBits).toEqual([1,0,0]);
      expect(secondBits).toEqual([0,1,0,0,0,0,1]);
    });
    it("can skip leading zero bits and return the number of zeroes", () => {
      const mockData = new Uint8Array(2);
      mockData[0] = 0x00; // 0000 0000
      mockData[1] = 0x40; // 0100 0000
      const egData = new ExpGolomb(mockData);
      const numZeros = egData.skipLeadingZeros();
      expect(numZeros).toBe(9);
    });
    it("can return codenum value", () => {
      const mockData = new Uint8Array(1);
      mockData[0] = 0x14; // 0001 0100
      const egData = new ExpGolomb(mockData);    
      const codeNum = egData.readCodeNum();
      expect(codeNum).toBe(9);
    });
  });
});

function hexToBytes(hex) {
  const hexString = hex.replace(/\s+/g, "");
  let array = [];
  let i = 0;
  for (let c = 0; c < hexString.length; c += 2) {
    const b = parseInt(hexString.substr(c, 2), 16);
    array[i++] = b;
  }
  let bytes = new Uint8Array(array);
  return bytes;
}

function bytesToHex(bytes) {
  let hex = [];
  for (i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join("");
}