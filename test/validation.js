var hooker = require('hooker'),
    grunt = require('grunt'),
    task = require('../tasks/excision')(grunt),
    excision = require('../tasks/lib/excision')(grunt);

describe('Validation', function () {

  describe('JavaScript', function () {
    it('should return array with errors, when invalid code passed', function () {
      var errors = excision.validate('return 1\nreturn 2', 'JS');

      if (grunt.util.kindOf(errors) === 'array' &&
          grunt.util.kindOf(errors[0]) === 'error' &&
          errors.length === 2) {
        return;
      }
      else {
        throw new Error('excision.validate should return array with errors');
      }
    });

    it('should return empty array, when valid code passed', function () {
      var errors = excision.validate('foo()', 'JS');

      if (grunt.util.kindOf(errors) === 'array' &&
          errors.length === 0) {
        return;
      }
      else {
        throw new Error('excision.validate should return empty array when no errors');
      }
    });
  });

  describe('CSS', function () {
    it('should return array with errors-like objects, when invalid code passed', function () {
      var errors = excision.validate('foo}', 'CSS');

      if (grunt.util.kindOf(errors) === 'array' &&
          errors[0].message &&
          errors.length === 2) {
        return;
      }
      else {
        throw new Error('excision.validate should return array with errors-like objects');
      }
    });

    it('should return empty array, when valid code passed', function () {
      var errors = excision.validate('.foo{width:0}', 'CSS');

      if (grunt.util.kindOf(errors) === 'array' &&
          errors.length === 0) {
        return;
      }
      else {
        throw new Error('excision.validate should return empty array when no errors');
      }
    });
  });

});
