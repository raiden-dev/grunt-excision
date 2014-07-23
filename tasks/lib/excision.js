var _ = require('lodash'),
    esprima = require('esprima'),
    csslint = require('csslint').CSSLint,
    isolate = require('./isolate');

module.exports.init = function (grunt) {
  'use strict';

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

  function getRangeByName(str, name) {
    return isolate(str, name);
  }

  function colorize(words, color) {
    return grunt.log.wordlist(words, { color: color });
  }

  return {
    process: function (contents, range) {
      var results = '';

      if (grunt.util.kindOf(range) === 'object') {
        // Go deeper
        grunt.util._.each(range, function (innerRange) {
          results += this.process(contents, innerRange);
        }.bind(this));
      }
      else if (grunt.util.kindOf(range) === 'array' && range.length !== 2) {
        // Go much deeper
        range.forEach(function (innerRange) {
          results += this.process(contents, innerRange);
        }.bind(this));
      }
      else if (grunt.util.kindOf(range) === 'array' && range.length == 2) {
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
        // AST name
        if (/^@/.test(range)) {
          range = range.replace(/^@/, '');
          this.log('processed_ast', { name: range });
          results += this.process(contents, getRangeByName(contents, range));
        }
        // Append string
        else {
          results += range;
          this.log('processed_string', { str: range });
        }
      }

      return results;
    },

    validate: function (contents, lang) {
      // Validate JS by default
      lang = (lang) ? lang.toUpperCase() : 'JS';

      var syntax,
          errors = [];

      switch (lang) {
        case 'JS':
        case 'JAVASCRIPT':
          try {
            // Esprima's tolerant option is for collecting errors array
            syntax = esprima.parse(contents, { tolerant: true });

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

        case 'CSS':
          syntax = csslint.verify(contents);
          errors = _.where(syntax.messages, { type: 'error' });

          if (errors.length === 0) {
            this.log('valid');
          }
          else {
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
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processed_bytes':
          grunt.verbose.write('Extracting bytes ');
          grunt.verbose.write(data.offset[0] + '-' + data.offset[1]);
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processed_regexp':
          grunt.verbose.write('Matching by regexp ');
          grunt.verbose.write(data.regexp);
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processed_ast':
          grunt.verbose.write('Looking AST for ');
          grunt.verbose.write(data.name);
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processed_string':
          grunt.verbose.write('Appending string "');
          grunt.verbose.write(data.str + '"');
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'valid':
          grunt.verbose.write('Syntax validation');
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'invalid':
          data.errors.forEach(function (e) {
            grunt.log.error(e.message);
          });
          break;

        case 'done':
          grunt.log.ok('File ' + colorize([data.dest]) + ' created.');
          break;
      }
    }
  };

};
