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
});