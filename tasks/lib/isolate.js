var _ = require('lodash'),
    esprima = require('esprima'),
    Runner = require('./runner');

function isolate(contents, name) {
  var ast = esprima.parse(contents, { range: true }),
      root = new Runner(ast),
      node = null,
      ranges = [];

  node = root.find({ type: 'FunctionDeclaration' })
    .tree().filter(function (node) {
      return node.id.name === name;
    })[0];

  if (!node) {
    node = root.find({ type: 'VariableDeclarator' })
      .tree().filter(function (node) {
        return node.id.name === name;
      })[0];
  }

  if (node) {
    ranges.push(node.range.map(function (val) {
      return val.toString();
    }));
  }

  return ranges;
}

module.exports = isolate;
