const address = require('../src/address');
const assert = require('chai').assert;

describe('Address', () => {
  describe('provinceOf()', () => {
    it('should return province of given address string', () => {
      assert.equal('四川省', address.provinceOf('四川省成都市'));
      assert.equal('广东省', address.provinceOf('广东省深圳市'));
      assert.equal('香港特别行政区', address.provinceOf('香港特别行政区'));
    });
    describe('cityOf()', () => {
      it('should return city of given address string', () => {
        assert.equal('成都市', address.cityOf('四川省成都市'));
        assert.equal('深圳市', address.cityOf('广东省深圳市'));
        assert.equal('', address.cityOf('四川省双流县'));
      });
    });
    describe('areaOf()', () => {
      it('should return area of given address string', () => {
        assert.equal('', address.areaOf('四川省成都市'));
        assert.equal('', address.areaOf('四川省武侯区'));
        assert.equal('龙岗区', address.areaOf('广东省深圳市龙岗区'));
      });
    });
  });
});
