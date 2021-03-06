'use strict';

const transform = require('../src/transform');
const assert = require('chai').assert;

describe('Transform', () => {
  describe('to parent session', () => {
    it('should accept sessions', () => {
      const parents = transform.mapToParents([
        {
          sender: 'parent_id',
          session_id: 'h_child_id',
          content: 'content',
          update_at: 0,
          media_type: 'video',
        }
      ]);
      assert.equal(1, parents.length);
      assert.equal('parent_id', parents[0].source_parent_id);
      assert.equal('child_id', parents[0].source_child_id);
    });

    it('should consider media type', () => {
      const parents = transform.mapToParents([
        {
          sender: 'parent_id',
          session_id: 'h_child_id',
          content: 'content',
          update_at: 0,
          media_type: 'video',
          media_url: 'http://abc.com',
        }
      ]);
      assert.equal(1, parents.length);
      assert.equal('http://abc.com', parents[0].video_path);
    });
    describe('to parents', () => {
      it('should convert from relationship', () => {
        const parents = transform.parents([
          {
            parent: {
              parent_id: 'parent_id',
              phone: 'phone',
              name: 'name',
            },
            child: {
              name: 'child_name',
              child_id: 'child_id'
            },
            relationship: '爸爸',
            password: 'password',
          }
        ]);
        assert.equal(1, parents.length);
        assert.equal('phone', parents[0].mobile);
      });
      it('should remove duplicates', () => {
        const parentInfo = {
          parent: {
            parent_id: 'parent_id',
            phone: 'phone',
            name: 'name',
          },
          child: {
            name: 'child_name',
            child_id: 'child_id'
          },
          relationship: '爸爸',
          password: 'password',
        };
        const sameParentWithDifferentChild = {
          parent: {
            parent_id: 'parent_id',
            phone: 'phone',
            name: 'name',
          },
          child: {
            name: 'child_name2',
            child_id: 'child_id2'
          },
          relationship: '爸爸',
          password: 'password',
        };
        const parents = transform.parents([
          parentInfo, sameParentWithDifferentChild
        ]);
        assert.equal(1, parents.length);
        assert.equal('phone', parents[0].mobile);
      });
    });
    describe('to children', () => {
      it('should convert from relationship', () => {
        const children = transform.children([
          {
            parent: {
              parent_id: 'parent_id',
              phone: 'phone',
              name: 'name',
            },
            child: {
              name: 'child_name',
              child_id: 'child_id',
              class_id: 'class_id'
            },
            relationship: '爸爸',
            password: 'password',
          }
        ]);
        assert.equal(1, children.length);
        assert.equal('child_id', children[0].source_child_id);
      });
      it('should remove duplicates', () => {
        const fatherInfo = {
          parent: {
            parent_id: 'parent_id',
            phone: 'phone',
            name: 'name',
          },
          child: {
            name: 'child_name',
            child_id: 'child_id',
            class_id: 'class_id'
          },
          relationship: '爸爸',
          password: 'password',
        };
        const motherInfo = {
          parent: {
            parent_id: 'parent_id2',
            phone: 'phone2',
            name: 'name2',
          },
          child: {
            name: 'child_name',
            child_id: 'child_id',
            class_id: 'class_id'
          },
          relationship: '爸爸',
          password: 'password',
        };
        const children = transform.children([
          fatherInfo, motherInfo
        ]);
        assert.equal(1, children.length);
        assert.equal('child_id', children[0].source_child_id);
      });
    });

  });
  describe('to employees', () => {
    it('should accept single', () => {
      const employees = transform.employees([
        {
          id: 'employee_id',
          phone: 'phone',
          name: 'name',
          birthday: '2010-11-11',
          gender: 0,
          subordinate: '',
          password: 'password',
        }
      ]);
      assert.equal(1, employees.length);
      assert.equal('phone', employees[0].mobile);
    });

    it('should accept multiple', () => {
      const employees = transform.employees([
        {
          id: 'employee_id',
          phone: 'phone',
          name: 'name',
          birthday: '2010-11-11',
          gender: 0,
          subordinate: '',
          password: 'password',
        },
        {
          id: 'employee_id2',
          phone: 'phone2',
          name: 'name2',
          birthday: '2010-11-11',
          gender: 0,
          subordinate: '',
          password: 'password',
        }
      ]);
      assert.equal(2, employees.length);
      assert.equal('phone', employees[0].mobile);
      assert.equal('phone2', employees[1].mobile);
    });
  });
  describe('to class info', () => {
    it('should handle empty input', () => {
      assert.deepEqual([], transform.classes([]));
    });
    it('should transform class information', () => {
      assert.deepEqual([{
        "source_class_id": '123',
        "class_name": 'name',
        "is_graduation": "0"
      }], transform.classes([{class_id: 123, name: 'name'}]));
    });

    it('should transform multiple classes', () => {
      assert.deepEqual([{
        "source_class_id": '123',
        "class_name": 'name',
        "is_graduation": "0"
      }, {
        "source_class_id": '456',
        "class_name": 'name2',
        "is_graduation": "0"
      }], transform.classes([{class_id: 123, name: 'name'}, {class_id: 456, name: 'name2'}]));
    });
  });
});
