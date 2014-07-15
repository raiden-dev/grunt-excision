module.exports = function (grunt) {
  'use strict';

  grunt.registerMultiTask('excision', 'Extract parts from one file into another.', function () {
    var options = this.options();

    if (!options.lines) {
      options.lines = {};
    }

    this.files.forEach(function (filePair) {
      var dest = filePair.dest,
          results = '';

      filePair.src.forEach(function (src) {
        var contents = grunt.file.read(src),
            lines = contents.split('\n'),
            linesRange = options.lines[src],
            bytesRange = options.bytes[src];

        if (grunt.util.kindOf(linesRange) === 'array') {
          results += lines.slice(linesRange[0] - 1, linesRange[1])
            .join('\n');

          grunt.log.write('Extracting lines ');
          grunt.log.write(linesRange[0] + '-' + linesRange[1]);
          grunt.log.writeln(' from file ' + src);
        }

        if (grunt.util.kindOf(bytesRange) === 'array') {
          results += contents.slice(bytesRange[0] - 1, bytesRange[1]);

          grunt.log.write('Extracting bytes ');
          grunt.log.write(bytesRange[0] + '-' + bytesRange[1]);
          grunt.log.writeln(' from file ' + src);
        }
      });

      grunt.file.write(dest, results);

      grunt.log.write('File ');
      grunt.log.write(grunt.log.wordlist([dest]));
      grunt.log.writeln(' created.');
    });
  });

};
