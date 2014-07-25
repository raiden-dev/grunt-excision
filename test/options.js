var hooker = require('hooker'),
    grunt = require('grunt'),
    task = require('../tasks/excision')(grunt),
    excision = require('../tasks/lib/excision')(grunt);

grunt.log.muted = true;

describe('Task options', function () {

  describe('ranges', function () {
    it('should be processed, if is object', function () {
      task.call({
        options: function () {
          return {
            ranges: {}
          };
        },
        files: []
      });
    });

    it('should throw an error in other cases', function () {
      var falsey, typeofObject, func;

      try {
        task.call({
          options: function () {},
          files: []
        });
      }
      catch (e) { falsey = true; }

      try {
        task.call({
          options: function () {
            return {
              ranges: []
            };
          },
          files: []
        });
      }
      catch (e) { typeofObject = true; }

      try {
        task.call({
          options: function () {
            return {
              ranges: function () {}
            };
          },
          files: []
        });
      }
      catch (e) { func = true; }

      if (!falsey) {
        throw new Error('No error was thrown for falsey value');
      }

      if (!typeofObject) {
        throw new Error('No error was thrown for "typeof object" value');
      }

      if (!func) {
        throw new Error('No error was thrown for function value');
      }
    });

    describe('Object', function () {
      it('should be processed', function () {
        var invoked = 0;

        hooker.hook(excision, 'process', function () { invoked++; });

        excision.process('', {
          inner: {}
        });

        hooker.unhook(excision, 'process');

        if (invoked != 2) {
          throw new Error('excision.process should be invoked for object');
        }
      });
    });

    describe('Array', function () {
      it('should be processed, if length != 2', function () {
        var invoked = 0;
        hooker.hook(excision, 'process', function () { invoked++; });

        excision.process('', [{}]);

        hooker.unhook(excision, 'process');
        if (invoked != 2) {
          throw new Error('excision.process should be invoked for array with length != 2');
        }
      });

      it('should be processed as range, if length == 2', function () {
        var invoked = 0;
        hooker.hook(excision, 'processRange', function () { invoked++; });

        excision.process('', [1, 2]);

        hooker.unhook(excision, 'processRange');
        if (invoked != 1) {
          throw new Error('excision.processRange should be invoked for array with length == 2');
        }
      });
    });

    describe('Regexp', function () {
      it('should be processed as range', function () {
        var invoked = 0;
        hooker.hook(excision, 'processRange', function () { invoked++; });

        excision.process('', /regexp/);

        hooker.unhook(excision, 'processRange');
        if (invoked != 1) {
          throw new Error('excision.processRange should be invoked for regexp');
        }
      });
    });

    describe('String', function () {
      it('should be processed as range', function () {
        var invoked = 0;
        hooker.hook(excision, 'processRange', function () { invoked++; });

        excision.process('', 'string');

        hooker.unhook(excision, 'processRange');
        if (invoked != 1) {
          throw new Error('excision.processRange should be invoked for string');
        }
      });
    });

    describe('Range', function () {
      it('should call sliceByBytes, if is array of 2x strings', function () {
        var invoked = 0;
        hooker.hook(excision, 'sliceByBytes', function () { invoked++; });

        excision.process('', ['10', '20']);

        hooker.unhook(excision, 'sliceByBytes');
        if (invoked != 1) {
          throw new Error('excision.sliceByBytes should be invoked for array of 2x strings');
        }
      });

      it('should call sliceByLines, if is array of 2x numbers', function () {
        var invoked = 0;
        hooker.hook(excision, 'sliceByLines', function () { invoked++; });

        excision.process('', [10, 20]);

        hooker.unhook(excision, 'sliceByLines');
        if (invoked != 1) {
          throw new Error('excision.sliceByLines should be invoked for array of 2x numbers');
        }
      });

      it('should call sliceByRegexp, if is regexp', function () {
        var invoked = 0;
        hooker.hook(excision, 'sliceByRegexp', function () { invoked++; });

        excision.process('', /regexp/);

        hooker.unhook(excision, 'sliceByRegexp');
        if (invoked != 1) {
          throw new Error('excision.sliceByRegexp should be invoked for regexp');
        }
      });

      it('should call getRangeByName, if is string with leading "@"', function () {
        var invoked = 0;
        hooker.hook(excision, 'getRangeByName', function () { invoked++; });

        excision.process('', '@functionName');

        hooker.unhook(excision, 'getRangeByName');
        if (invoked != 1) {
          throw new Error('excision.getRangeByName should be invoked for string with leading "@"');
        }
      });

      it('should then be processed with obtained range', function () {
        var invoked = 0;
        hooker.hook(excision, 'process', function () { invoked++; });

        excision.process('', '@functionName');

        hooker.unhook(excision, 'process');
        if (invoked != 2) {
          throw new Error('excision.process should be invoked after excision.getRangeByName for string with leading "@"');
        }
      });

      it('should be processed, if is array of 2x something else', function () {
        var invoked = 0;
        hooker.hook(excision, 'process', function () { invoked++; });

        excision.processRange('', [{}, {}]);

        hooker.unhook(excision, 'process');
        if (invoked != 4) {
          throw new Error('Range should be modified with nop push and excision.process invoked for array of 2x something else');
        }
      });
    });
  });

  describe('validate', function () {
    it('should invoke result\'s validation, if truthy', function () {
      var invoked = 0;

      var env = excision;
      env.validate = function () {
        invoked++;
        return [new Error()];
      };

      var writeOrig = grunt.file.write;
      grunt.file.write = function () {};

      task.call({
        options: function () {
          return {
            validate: true,
            ranges: {}
          };
        },
        files: [
          {
            dest: '',
            src: []
          }
        ]
      }, env);

      grunt.file.write = writeOrig;
      if (invoked != 1) {
        throw new Error('excision.validate should be invoked when validate option set');
      }
    });

    describe('tolerant', function () {
      it('should write dest file, if true', function () {
        var invoked = 0;

        var env = excision;
        env.validate = function () { return [new Error()]; };

        var writeOrig = grunt.file.write;
        grunt.file.write = function () { invoked++; };

        task.call({
          options: function () {
            return {
              validate: {
                tolerant: true
              },
              ranges: {}
            };
          },
          files: [
            {
              dest: '',
              src: []
            }
          ]
        }, env);

        grunt.file.write = writeOrig;
        if (invoked != 1) {
          throw new Error('Destination file should be written when tolerant option is set');
        }
      });
    });

    describe('lang', function () {
      it('should be case insensitive', function () {
        var env = excision,
            valid = false;

        env.validate = function (contents, lang) {
          if (lang === 'JAVASCRIPT') {
            valid = true;
          }

          return [new Error()];
        };

        task.call({
          options: function () {
            return {
              validate: {
                lang: 'JavaScRipT'
              },
              ranges: {}
            };
          },
          files: [
            {
              dest: '',
              src: []
            }
          ]
        }, env);

        if (!valid) {
          throw new Error('Should be uppercased before passing to excision.validate');
        }
      });
    });
  });

});
