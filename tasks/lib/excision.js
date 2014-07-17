module.exports.init = function (grunt) {
  'use strict';

  var esprima = require('esprima');

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
          results += sliceByBytes(contents, range);
          this.log('processed_bytes', { offset: range });
        }
        // Must be line numbers
        else {
          results += sliceByLines(contents, range);
          this.log('processed_lines', { range: range });
        }
      }
      else if (grunt.util.kindOf(range) === 'regexp') {
        // Regexp match
        results += sliceByRegexp(contents, range);
        this.log('processed_regexp', { regexp: range });
      }
      else if (grunt.util.kindOf(range) === 'string') {
        // Append string
        results += range;
        this.log('processed_string', { str: range });
      }

      return results;
    },

    validate: function (results, lang) {
      // Validate JS by default
      lang = (lang) ? lang.toUpperCase() : 'JS';

      var syntax,
          errors = [];

      switch (lang) {
        case 'JS':
        case 'JAVASCRIPT':
          try {
            // Esprima's tolerant option is for collecting errors array
            syntax = esprima.parse(results, { tolerant: true });

            if (syntax.errors.length === 0) {
              this.log('valid');
            }
            else {
              errors = syntax.errors;
              this.log('invalid', { errors: errors });
            }
          }
          catch (e) {
            errors.push(e);
            this.log('invalid', { errors: errors });
          }

          break;
      }

      return errors;
    },

    log: function (key, data) {
      switch (key) {
        case 'processed_lines':
          grunt.verbose.write('Extracting lines ');
          grunt.verbose.write(data.range[0] + '-' + data.range[1]);
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'processed_bytes':
          grunt.verbose.write('Extracting bytes ');
          grunt.verbose.write(data.offset[0] + '-' + data.offset[1]);
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'processed_regexp':
          grunt.verbose.write('Matching by regexp ');
          grunt.verbose.write(data.regexp);
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'processed_string':
          grunt.verbose.write('Appending string "');
          grunt.verbose.write(data.str + '"');
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'valid':
          grunt.verbose.write('Validating code');
          grunt.verbose.writeln('...' + grunt.log.wordlist(['OK'], { color:'green' }));
          break;

        case 'invalid':
          data.errors.forEach(function (e) {
            grunt.log.error(e.message);
          });
          break;

        case 'done':
          grunt.log.ok('File ' + grunt.log.wordlist([data.dest]) + ' created.');
          break;
      }
    }
  };

};
