var path = require('path');
var srcDir = path.join(__dirname, 'tasks');

require('blanket')({ pattern: srcDir });
