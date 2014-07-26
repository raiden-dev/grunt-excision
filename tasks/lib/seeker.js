function Seeker(tree) {
  var __tree__ = tree;

  this.tree = function () {
    return __tree__;
  };
}

Seeker.prototype = {
  find: function (query) {
    var found = find(this.tree(), query);
    return new Seeker(found);
  }
};

function find(tree, query, found) {
  found = found || [];
  var key, value, node;

  once: for (key in query) {
    value = query[key];
    break once;
  }

  for (node in tree) {
    if (node === key) {
      if (tree[node] === value) {
        found.push(tree);
      }
    }
    else if (tree[node] instanceof Object) {
      find(tree[node], query, found);
    }
  }

  return found;
}

module.exports = Seeker;
