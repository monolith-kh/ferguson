'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Data = require('dataclass').Data

class PositionInfo extends Data {
  static BYTES_LENGTH = 22;

  seq;
  positionX;
  positionY;
  positionZ;
  pqf;
  rotationX;
  rotationY;
  rotationZ;

  static fromBytes = function(buffer) {
    let result = this.create({
       seq: buffer.slice(0, 2).readInt16BE(),
       positionX: buffer.slice(2, 6).readInt32BE(),
       positionY: buffer.slice(6, 10).readInt32BE(),
       positionZ: buffer.slice(10, 14).readInt32BE(),
       pqf: buffer.slice(14, 16).readInt16BE(),
       rotationX: buffer.slice(16, 18).readInt16BE(),
       rotationY: buffer.slice(18, 20).readInt16BE(),
       rotationZ: buffer.slice(20, 22).readInt16BE()
    });

    return result;
  }
}

exports.PositionInfo = PositionInfo
