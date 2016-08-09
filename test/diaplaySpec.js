var display = require('../src/display');
var assert = require('chai').assert;

describe('Display', function () {
  describe('gender()', function () {
    it('should return 1 for 0', function () {
      assert.equal('2', display.gender('0'));
    });
    it('should return 1 for other', function () {
      assert.equal('1', display.gender('1'));
      assert.equal('1', display.gender('3'));
      assert.equal('1', display.gender('-1'));
    });
  });
  describe('time()', function () {
    it('should return GMT+8 time', function () {
      assert.equal('2016-08-07 17:57:20', display.time('1470563840000'));
    });
  })

  describe('digit Time', function () {
    it('should return GMT+8 time', function () {
      assert.equal('2016-08-07 17:57:20', display.digitalTime(1470563840000));
    });
  });
});