var transform = require('../src/transform');
var assert = require('chai').assert;

describe('Transform', function () {
  describe('to parent session', function () {
    it('should accept sessions', function () {
      var parents = transform.mapToParents([
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

    it('should consider media type', function () {
      var parents = transform.mapToParents([
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
    describe('to parents', function () {
      it('should convert from relationship', function () {
        var parents = transform.parents([
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
      it('should remove duplicates', function () {
        var parentInfo = {
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
        var sameParentWithDifferentChild = {
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
        var parents = transform.parents([
          parentInfo, sameParentWithDifferentChild
        ]);
        assert.equal(1, parents.length);
        assert.equal('phone', parents[0].mobile);
      });
    });
    describe('to children', function () {
      it('should convert from relationship', function () {
        var children = transform.children([
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
      it('should remove duplicates', function () {
        var fatherInfo = {
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
        var motherInfo = {
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
        var children = transform.children([
          fatherInfo, motherInfo
        ]);
        assert.equal(1, children.length);
        assert.equal('child_id', children[0].source_child_id);
      });
    });

  });
  describe('to employees', function () {
    it('should convert', function () {
      var employees = transform.employees([
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
  })
});