var address = require('../src/address');
var assert = require('chai').assert;

describe('Address', function() {
  describe('provinceOf()', function() {
    it('should return province of given address string', function() {
      assert.equal('四川省', address.provinceOf('四川省成都市'));
      assert.equal('广东省', address.provinceOf('广东省深圳市'));
    });
  });
});