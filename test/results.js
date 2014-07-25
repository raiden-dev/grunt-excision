var hooker = require('hooker'),
    grunt = require('grunt'),
    task = require('../tasks/excision')(grunt),
    excision = require('../tasks/lib/excision')(grunt);

describe('Results', function () {
  it('should slice by bytes and append to results, if bytes range passed', function () {
    var src = 'one\ntwo\nthree\nfour\nfive',
        expected = 'two',
        ok = false;

    var readOrig = grunt.file.read;
    grunt.file.read = function () {
      return src;
    };

    var writeOrig = grunt.file.write;
    grunt.file.write = function (dest, contents) {
      if (contents === expected) {
        ok = true;
      }
    };

    task.call({
      options: function () {
        return {
          ranges: {
            'test': ['5', '7']
          }
        };
      },
      files: [
        {
          dest: '',
          src: ['test']
        }
      ]
    }, excision);

    grunt.file.read = readOrig;
    grunt.file.write = writeOrig;
    if (!ok) {
      throw new Error('excision.sliceByBytes returned unexpected results');
    }
  });

  it('should slice by lines and append to results, if lines range passed', function () {
    var src = 'one\ntwo\nthree\nfour\nfive',
        expected = 'three\nfour',
        ok = false;

    var readOrig = grunt.file.read;
    grunt.file.read = function () {
      return src;
    };

    var writeOrig = grunt.file.write;
    grunt.file.write = function (dest, contents) {
      if (contents === expected) {
        ok = true;
      }
    };

    task.call({
      options: function () {
        return {
          ranges: {
            'test': [3, 4]
          }
        };
      },
      files: [
        {
          dest: '',
          src: ['test']
        }
      ]
    }, excision);

    grunt.file.read = readOrig;
    grunt.file.write = writeOrig;
    if (!ok) {
      throw new Error('excision.sliceByLines returned unexpected results');
    }
  });

  it('should slice by regexp and append to results, if regexp passed', function () {
    var src = 'one\ntwo\nthree\nfour\nfive',
        expected = 'one',
        ok = false;

    var readOrig = grunt.file.read;
    grunt.file.read = function () {
      return src;
    };

    var writeOrig = grunt.file.write;
    grunt.file.write = function (dest, contents) {
      if (contents === expected) {
        ok = true;
      }
    };

    task.call({
      options: function () {
        return {
          ranges: {
            'test': /^one/
          }
        };
      },
      files: [
        {
          dest: '',
          src: ['test']
        }
      ]
    }, excision);

    grunt.file.read = readOrig;
    grunt.file.write = writeOrig;
    if (!ok) {
      throw new Error('excision.sliceByRegexp returned unexpected results');
    }
  });

  it('should append to results, if string passed', function () {
    var src = 'one\ntwo\nthree\nfour\nfive',
        expected = 'string',
        ok = false;

    var readOrig = grunt.file.read;
    grunt.file.read = function () {
      return src;
    };

    var writeOrig = grunt.file.write;
    grunt.file.write = function (dest, contents) {
      if (contents === expected) {
        ok = true;
      }
    };

    task.call({
      options: function () {
        return {
          ranges: {
            'test': 'string'
          }
        };
      },
      files: [
        {
          dest: '',
          src: ['test']
        }
      ]
    }, excision);

    grunt.file.read = readOrig;
    grunt.file.write = writeOrig;
    if (!ok) {
      throw new Error('Passed string was not appended results');
    }
  });
});
