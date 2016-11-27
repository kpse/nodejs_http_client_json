const display = require('../src/display');
const assert = require('chai').assert;

describe('Display', () => {
  describe('gender()', () => {
    it('should return 1 for 0', () => {
      assert.equal('2', display.gender('0'));
    });
    it('should return 1 for other', () => {
      assert.equal('1', display.gender('1'));
      assert.equal('1', display.gender('3'));
      assert.equal('1', display.gender('-1'));
    });
  });
  describe('time()', () => {
    it('should return GMT+8 time', () => {
      assert.equal('2016-08-07 17:57:20', display.time('1470563840000'));
    });
  })

  describe('digit Time', () => {
    it('should return GMT+8 time', () => {
      assert.equal('2016-08-07 17:57:20', display.digitalTime(1470563840000));
    });
  });
});
