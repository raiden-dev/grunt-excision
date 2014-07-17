module.exports.init = function (grunt) {

  function sliceByLines(str, range) {
    range = range || [];
    var lines = str.split('\n');
    return lines.slice(range[0] - 1, range[1]).join('\n');
  }

  function sliceByBytes(str, offset) {
    offset = offset || [];

    var reHex = /[a-fx]/,
        iStart = parseInt(offset[0], reHex.test(offset[0]) ? 16 : 10),
        iEnd = parseInt(offset[1], reHex.test(offset[1]) ? 16 : 10);

    return str.slice(iStart - 1, iEnd);
  }

  function sliceByRegexp(str, regexp) {
    var matched = regexp.exec(str);
    return (matched) ? matched[0] : '';
  }

  return {
    process: function (range, contents) {
      var results = '';

      if (grunt.util.kindOf(range) === 'object') {
        // Go deeper
        grunt.util._.each(range, function (innerRange) {
          results += this.process(innerRange, contents);
        }.bind(this));
      }
      else if (grunt.util.kindOf(range) === 'array' && range.length > 2) {
        // Go much deeper
        range.forEach(function (innerRange) {
          results += this.process(innerRange, contents);
        }.bind(this));
      }
      else if (grunt.util.kindOf(range) === 'array') {
        // Must be offset
        if (grunt.util.kindOf(range[0]) === 'string') {
          this.log('processing_bytes', { offset: range });
          results += sliceByBytes(contents, range);
        }
        // Must be line numbers
        else {
          this.log('processing_lines', { range: range });
          results += sliceByLines(contents, range);
        }
      }
      else if (grunt.util.kindOf(range) === 'regexp') {
        // Regexp match
        this.log('processing_regexp', { regexp: range });
        results += sliceByRegexp(contents, range);
      }
      else if (grunt.util.kindOf(range) === 'string') {
        // Append string
        this.log('processing_string', { str: range });
        results += range;
      }

      return results;
    },

    log: function (key, data) {
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
  };

};
