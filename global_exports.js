/**
 * @typedef {Object} HlsTsOptions
 * @property {boolean} debug Output debug informatin to logger
 */

/**
 * @typedef {Object} HlsTsProgramType
 * @property {number} id Program ID
 * @property {string} type Program type, e.g: avc, aac, id3
 * @property {number[]} pts List of all PTS values found
 * @property {number[]} dts List of all DTS values found
 */

/**
 * @typedef {Object} HlsTsPacket
 * @property {number} pid Program ID this packet belongs to
 * @property {boolean} payloadUnitStartIndicator Payload Unit Start Indicator (PUSI)
 * @property {number} adaptationFieldControl Adaptation Field Control (ATF)
 * @property {HlsTsPCR} pcr PCR value
 */

/**
 * @typedef {Object} HlsTsDataStream
 * @property {Uint8Array} data The audio and video data bytes
 * @property {number} size Amount of data bytes
 * @property {number} id Program ID
 * @property {HlsTsPesHeader[]} pes PES Headers for this data stream
 */

/**
 * @typedef {Object} HlsTsPCR
 * @property {number} base PCR base part
 * @property {number} value PCR value part
 */

/**
 * @typedef {Object} HlsTsPesHeader
 * @property {number} pts PTS value
 * @property {number} dts DTS value
 * @property {number} offset Byte offset in data stream where this PES header was found
 */

/**
 * @typedef {Object} HlsTsNalUnit
 * @property {Uint8Array} data The Nal payload
 * @property {number} type Nal Unit type
 * @property {number} offset Byte offset in data stream where this Nal Unit was found
 * @property {HlsTsPesHeader} pes PES Header for this chunk of AVC data 
 */

window.HlsTs = require("./lib/browser.js");