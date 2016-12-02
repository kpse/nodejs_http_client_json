const classesFunction = require('../src/classesFunctions');
const assert = require('chai').assert;

describe('Class functions', () => {
  describe('display classes', () => {
    it('should filter non-existing subordinate', () => {
      assert.deepEqual([2, 3], classesFunction([1, 2, 3], [2, 3]));
    });

    it('should give out empty if no classes in the school', () => {
      assert.deepEqual([], classesFunction([], [2, 3]));
    });

    it('should handle all empty case', () => {
      assert.deepEqual([], classesFunction([], []));
    });

    it('should report empty class if the employee manages nothing', () => {
      assert.deepEqual([], classesFunction([1], []));
    });
  });
});
