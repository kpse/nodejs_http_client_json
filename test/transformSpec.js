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
    });

  });
});