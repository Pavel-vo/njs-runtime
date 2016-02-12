// Based on https://github.com/Khan/react-components/blob/master/test/compiler.js
var compiler = require('njs-compiler').create();
var swig = require('swig');
var fs = require('fs');
var path = require('path');
var appsDir = path.dirname(path.dirname(__dirname));
var options = {tagName: 'compileNjs'};

swig.setExtension(options.tagName, function (val) {
    return compiler.compile(val);
});

swig.setTag(
    options.tagName,
    function () {
        return true;
    }, function (compiler, args, content, parents, opts, blockName) {
        var val = '(function () {\n' +
            '  var _output = "";\n' +
            compiler(content, parents, opts, blockName) +
            '  return _output;\n' +
            '})()';
        var res = '_output += _ext.' + options.tagName + '(' + val + ');\n';
        return res;
    },
    true,
    true
);

// Install the compiler.
require.extensions['.js'] = function (module, filename) {
    if (filename.indexOf(appsDir) == 0) {
        return module._compile(swig.renderFile(filename), filename);
    } else {
        return module._compile(fs.readFileSync(filename, 'utf-8'), filename);
    }
};
