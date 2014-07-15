module.exports = function (grunt) {
  'use strict';

  grunt.registerMultiTask('excision', 'Extract parts from one file into another.', function () {
    var options = this.options();

    if (!options.lines) {
      options.lines = {};
    }

    function sliceByLines(str, range) {
      range = range || [];
      var lines = str.split('\n');

      log('processing_lines', { range: range });
      return lines.slice(range[0] - 1, range[1]).join('\n');
    }

    function sliceByBytes(str, offset) {
      offset = offset || [];

      var reHex = /[a-fx]/,
          iStart = parseInt(offset[0], reHex.test(offset[0]) ? 16 : 10),
          iEnd = parseInt(offset[1], reHex.test(offset[1]) ? 16 : 10);

      log('processing_bytes', { offset: offset });
      return str.slice(iStart - 1, iEnd);
    }

    function sliceByRegexp(str, regexp) {
      var matched = regexp.exec(str);
      log('processing_regexp', { regexp: regexp });
      return (matched) ? matched[0] : '';
    }

    function processRange(range, contents) {
      var results = '';

      if (grunt.util.kindOf(range) === 'object') {
        // Go deeper
        grunt.util._.each(range, function (innerRange) {
          results += processRange(innerRange, contents);
        });
      }
      else if (grunt.util.kindOf(range) === 'array' && range.length > 2) {
        // Go much deeper
        range.forEach(function (innerRange) {
          results += processRange(innerRange, contents);
        });
      }
      else if (grunt.util.kindOf(range) === 'array') {
        // Must be offset
        if (grunt.util.kindOf(range[0]) === 'string') {
          results += sliceByBytes(contents, range);
        }
        // Must be line numbers
        else {
          results += sliceByLines(contents, range);
        }
      }
      else if (grunt.util.kindOf(range) === 'regexp') {
        // Regexp match
        results += sliceByRegexp(contents, range);
      }
      else if (grunt.util.kindOf(range) === 'string') {
        // Append string
        results += range;
        log('processing_string', { str: range });
      }

      return results;
    }

    function log(key, data) {
      switch (key) {
        case 'processing_lines':
          grunt.verbose.write('Extracting lines ');
          grunt.verbose.write(data.range[0] + '-' + data.range[1]);
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'processing_bytes':
          grunt.verbose.write('Extracting bytes ');
          grunt.verbose.write(data.offset[0] + '-' + data.offset[1]);
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'processing_regexp':
          grunt.verbose.write('Matching by regexp ');
          grunt.verbose.write(data.regexp);
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'processing_string':
          grunt.verbose.write('Appending string "');
          grunt.verbose.write(data.str + '"');
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'done':
          grunt.log.write('File ');
          grunt.log.write(grunt.log.wordlist([data.dest]));
          grunt.log.writeln(' created.');
          break;
      }
    }

    this.files.forEach(function (filePair) {
      var dest = filePair.dest,
          results = '';

      filePair.src.forEach(function (src) {
        var contents = grunt.file.read(src),
            range = options.ranges[src];

        results += processRange(range, contents);
      });

      grunt.file.write(dest, results);
      log('done', { dest: dest });
    });
  });

};
