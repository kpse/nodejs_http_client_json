var classesFunction = require('../src/classesFunctions');
var assert = require('chai').assert;

describe('Class functions', function () {
  describe('display classes', function () {
    it('should filter non-existing subordinate', function () {
      assert.deepEqual([2, 3], classesFunction([1, 2, 3], [2, 3]));
    });
  });
});