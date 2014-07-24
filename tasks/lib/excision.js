var _ = require('lodash'),
    esprima = require('esprima'),
    csslint = require('csslint').CSSLint,
    isolate = require('./isolate');

module.exports = function (grunt) {

  function colorize(words, color) {
    return grunt.log.wordlist(words, { color: color });
  }

  return {
    process: function (contents, obj) {
      var results = '';

      if (grunt.util.kindOf(obj) === 'object') {
        grunt.util._.each(obj, function (innerRange) {
          results += this.process(contents, innerRange);
        }.bind(this));
      }
      else if (grunt.util.kindOf(obj) === 'array' && obj.length !== 2) {
        obj.forEach(function (innerRange) {
          results += this.process(contents, innerRange);
        }.bind(this));
      }
      else {
        results += this.processRange(contents, obj);
      }

      return results;
    },

    processRange: function (contents, range) {
      if (grunt.util.kindOf(range) === 'array' && range.length == 2) {
        // Bytes offset
        if (grunt.util.kindOf(range[0]) === 'string' &&
            grunt.util.kindOf(range[1]) === 'string') {
          this.log('processing_bytes', { offset: range });
          return this.sliceByBytes(contents, range);
        }
        // Lines
        else if (grunt.util.kindOf(range[0]) === 'number' &&
                 grunt.util.kindOf(range[1]) === 'number') {
          this.log('processing_lines', { range: range });
          return this.sliceByLines(contents, range);
        }
        else {
          range.push(null);
          return this.process(contents, range);
        }
      }
      // Regexp
      else if (grunt.util.kindOf(range) === 'regexp') {
        this.log('processing_regexp', { regexp: range });
        return this.sliceByRegexp(contents, range);
      }
      else if (grunt.util.kindOf(range) === 'string') {
        // AST name
        if (/^@/.test(range)) {
          this.log('processing_ast', { name: range });
          range = range.replace(/^@/, '');
          return this.process(contents, this.getRangeByName(contents, range));
        }
        // String append
        else {
          this.log('processing_string', { str: range });
          return range;
        }
      }
      else {
        return '';
      }
    },

    sliceByLines: function (str, range) {
      range = range || [];
      var lines = str.split('\n');
      return lines.slice(range[0] - 1, range[1]).join('\n');
    },

    sliceByBytes: function (str, range) {
      range = range || [];

      var reHex = /[a-fx]/,
          iStart = parseInt(range[0], reHex.test(range[0]) ? 16 : 10),
          iEnd = parseInt(range[1], reHex.test(range[1]) ? 16 : 10);

      return str.slice(iStart - 1, iEnd);
    },

    sliceByRegexp: function (str, regexp) {
      var matched = regexp.exec(str);
      return (matched) ? matched[0] : '';
    },

    getRangeByName: function (str, name) {
      return isolate(str, name);
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
        case 'processing_lines':
          grunt.verbose.write('Extracting lines ');
          grunt.verbose.write(data.range[0] + '-' + data.range[1]);
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processing_bytes':
          grunt.verbose.write('Extracting bytes ');
          grunt.verbose.write(data.offset[0] + '-' + data.offset[1]);
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processing_regexp':
          grunt.verbose.write('Matching by regexp ');
          grunt.verbose.write(data.regexp);
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processing_ast':
          grunt.verbose.write('Looking AST for ');
          grunt.verbose.write(data.name);
          grunt.verbose.writeln('...' + colorize(['OK'], 'green'));
          break;

        case 'processing_string':
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
