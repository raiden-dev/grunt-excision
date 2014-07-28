# grunt-excision v1.3.0 [![Build Status](https://travis-ci.org/raiden-dev/grunt-excision.png?branch=master)](https://travis-ci.org/raiden-dev/grunt-excision) [![Coverage Status](https://coveralls.io/repos/raiden-dev/grunt-excision/badge.png?branch=master)](https://coveralls.io/r/raiden-dev/grunt-excision?branch=master)

> Extract parts from one file into another.


## Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-copy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-copy');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended that [you upgrade](http://gruntjs.com/upgrading-from-0.3-to-0.4), but in case you can't please use [v0.3.2](https://github.com/gruntjs/grunt-contrib-copy/tree/grunt-0.3-stable).*


## Excision task

_Run this task with the `grunt excision` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.


### Options

#### validate

Type: `Object`

##### lang

Type: `String`  
Values: `[js] | css`

Language for validating. JavaScript by default.

##### tolerant

Type: `Boolean`

If true, writes destination file despite the validation errors. Useful for debug.

#### ranges

Type: `Object`

This is the hash of source file names and ranges. _Range_ is the instruction how to match and cut the source file. There are several types:

Type | Example |  Match
-----|---------|-------
String | `'Some text'` | No match. Just string append
Array of Strings | `['14551', '14585']` | Match by decimal offset from start of the file
Array of Strings | `['0x3e28', '0x3e86']` | Match by hexademical offset from start of the file
Array of Numbers | `[396, 400]` | Match by line numbers
RegExp | `/function slice\([\s\S]*?return[\s\S]*?\}/` | Match by regular expression
String | `@functionName` | Match by AST name

Everything else is nothing more than a syntax sugar. You can construct as much insane as you want: objects inside arrays that contains arrays of objects that contains ranges, etc.


### Usage Examples

Below is several semi-reallife examples.

First one is the task for building `utils` AMD module which includes jquery's `trim` and lodash's `defer` functions. Task includes almost every excision's feature just in demonstration purposes, please use it responsibly.

```js
excision: {
  utils: {
    options: {
      validate: {
        lang: 'js',     // Language for validating (js|css, default: js)
        tolerant: true  // Write dest file despite the errors? (default: false)
      },
      ranges: {
        'bower_components/jquery/dist/jquery.js': {    // Src file path
          trim: { // nop
            '2.1.1': [ // nop
              'define(function () { var utils = {};',  // Append string
              'var ', ['14551', '14585'], ';',         // Decimal offset
              'var ', ['0x3e28', '0x3e86'], ';',       // Hexademical offset
              'var tmp = {', [396, 400], '};',         // Line numbers range
              'utils.trim = tmp.trim;'
            ]
          }
        },
        'bower_components/lodash/dist/lodash.js': {
          defer: [
            // Regexp match
            /function isFunction\([\s\S]*?return[\s\S]*?\}/,
            /function slice\([\s\S]*?return[\s\S]*?\}/,
            'utils.defer = ', /function defer\([\s\S]*?return.*[\r\n]+.*\}/, ';',
            'return utils; });'
          ]
        }
      }
    },
    files: {
      'out/utils.js': [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/lodash/dist/lodash.js'
      ]
    }
  }
}
```

Second task builds custom css framework based on bootstrap. Imagine that we don't want whole bootsrap lib on production because it's too complex and large, we need only grid system and tables.

```js
excision: {
  bootstrap: {
    options: {
      validate: {
        lang: 'css'  // Validate CSS syntax
      },
      ranges: {
        'bower_components/bootstrap/dist/css/bootstrap.css': {  // Src file path
          grid: [1420, 2059],                                   // Line numbers range
          table: [2060, 2293]                                   // Line numbers range
        }
      }
    },
    files: {
      'out/bootstrap.css': 'bower_components/bootstrap/dist/css/bootstrap.css'
    }
  }
}
```

Next one demonstrates the experimental feature, extracting things from JS file by their AST names. Here is the example of extracting `isArray` function from lodash. Unfortunately now we don't support automatic scope collecting and this needs to be done manually.

```js
excision: {
  experimental: {
    options: {
      validate: true,
      ranges: {
        'bower_components/lodash/dist/lodash.js': [
          '@isNative',                    // AST name
          'var ', '@objectProto',   ';',  // (internal dependency)
          'var ', '@toString',      ';',  // (internal dependency)
          'var ', '@arrayClass',    ';',  // (internal dependency)
          'var ', '@reNative',      ';',  // (internal dependency)
          'var ', '@nativeIsArray', ';',  // (internal dependency)
          'var ', '@isArray',       ';'   // Yeah, finally got it
        ]
      }
    },
    files: {
      'out/experimental.js': 'bower_components/lodash/dist/lodash.js'
    }
  }
}
```

Feel free to contact me through email or issues for any questions.


## Release History

 * 2014-07-23   v1.3.0   Experimental feature: extract things from JS by AST names
 * 2014-07-18   v1.2.0   Add [CSSLint](https://github.com/CSSLint/csslint) for validating CSS
 * 2014-07-17   v1.1.0   Add `validate` option; Add [Esprima](http://esprima.org/) for validating JS
 * 2014-07-17   v1.0.2   Refactoring: divide the task and the lib
 * 2014-07-15   v1.0.0   More flexible API; Hex/dec offsets; String appending; Regexp match; Refactoring
 * 2014-07-15   v0.2.0   Add extract bytes option
 * 2014-07-14   v0.1.0   Initial release
