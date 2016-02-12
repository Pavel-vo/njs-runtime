var nclass = require('njs-class');

// Method Type: context.method(arg1, arg2, ..., argN, success_callback(response))
// Usage example: var response = njs.async.Task.yld([context, ] context.method, arg1, arg2, ... , argN)
// This method will never raise an exception
module.exports.Task = {% compileNjs %}function () {
    var context = null;
    var func = arguments[0];
    var shift = 1;
    if (typeof func != 'function') {
        context = arguments[0];
        func = arguments[1];
        shift = 2;
    }
    if (typeof func != 'function')
        throw new Error('First or second argument must be a function');
    var args = Array.prototype.slice.call(arguments, shift, arguments.length);
    var promise = new njs.ResultNotifier();
    args.push(function (data) {
        promise.fulfill.yld(data);
    });
    func.apply(context, args);
    var result = promise.value.yld();
    return result;
}{% endcompileNjs %};

// Method Type: context.method(arg1, arg2, ..., argN, callback(err, response))
// Usage example: var response = njs.async.NodeTask.yld([context, ] context.method, arg1, arg2, ... , argN)
module.exports.NodeTask = {% compileNjs %}function () {
    var context = null;
    var func = arguments[0];
    var shift = 1;
    if (typeof func != 'function') {
        context = arguments[0];
        func = arguments[1];
        shift = 2;
    }
    if (typeof func != 'function')
        throw new Error('First or second argument must be a function');
    var args = Array.prototype.slice.call(arguments, shift, arguments.length);
    var promise = new njs.ResultNotifier();
    args.push(function (err, response) {
        promise.fulfill.yld({
            err: err,
            response: response
        });
    });
    func.apply(context, args);
    var result = promise.value.yld();
    if (result.err) {
        throw result.err;
    }
    return result.response;
}{% endcompileNjs %};

// Method Type: context.method(arg1, arg2, ..., argN, success_callback(response), error_callback(errorResponse))
// Usage example: var response = njs.async.ApiTask.yld([context, ] context.method, arg1, arg2, ... , argN)
// Also useful for wrapping promises, for example njs.async.ApiTask.yld(someThing.doSomething(1,2,3).then)
module.exports.ApiTask = {% compileNjs %}function () {
    var context = null;
    var func = arguments[0];
    var shift = 1;
    if (typeof func != 'function') {
        context = arguments[0];
        func = arguments[1];
        shift = 2;
    }
    if (typeof func != 'function')
        throw new Error('First or second argument must be a function');
    var args = Array.prototype.slice.call(arguments, shift, arguments.length);
    var promise = new njs.ResultNotifier();
    var success = function (data) {
        promise.fulfill.yld({
            response: data
        });
    };
    var error = function (data) {
        promise.fulfill.yld({
            err: data
        });
    };
    var callbacks = [success, error];
    args.push.apply(args, callbacks);
    func.apply(context, args);
    var e = promise.value.yld();
    if (e.err) {
        throw e.err;
    }
    return e.response;
}{% endcompileNjs %};

module.exports.WebApiTask = exports.ApiTask; // alias

// Method Type:
// obj.onresponsefield = success_callback(response)
// obj.onerrorfield = error_callback(errorResponse)
// obj.method(arg1, arg2, ..., argN)
// Usage example: var response = njs.async.RequestTask.yld('onresponsefield', 'onerrorfield', obj, obj.method, arg1, arg2, ... , argN)
// If error occure exception will rise errorResponse
module.exports.RequestTask = {% compileNjs %}function () {
    var onresponsefield = arguments[0];
    var onerrorfield = arguments[1];
    var context = arguments[2];
    var func = arguments[3];
    var args = Array.prototype.slice.call(arguments, 4, arguments.length);
    if (!(func instanceof Function))
        throw 'Fourth argument must be a function';
    var promise = new njs.ResultNotifier();
    context[onresponsefield] = function (data) {
        promise.fulfill.yld({
            response: data
        });
    };
    context[onerrorfield] = function (data) {
        promise.fulfill.yld({
            err: data
        });
    };
    func.apply(context, args);
    var e = promise.value.yld();
    context[onresponsefield] = null;
    context[onerrorfield] = null;
    if (e.err) {
        throw Error(JSON.stringify(e.err));
    }
    return e.response;


}{% endcompileNjs %};

module.exports.JoinFutures = {% compileNjs %}function (features) {
    // this method does not support handling of exceptions
    var results = [];
    var queue = new njs.QueueNotifier();
    for (var i = 0; i < features.length; i++) {
        queue.push(features[i]);
    }
    for (var j = 0; j < features.length; j++) {
        var result = queue.shift.yld();
        results.push(result)
    }
    return results;
}{% endcompileNjs %};

module.exports.NoException = {% compileNjs %}function (njsFunc) {
    try {
        var result = njsFunc.yld();
        return [false, result];
    }
    catch (e) {
        return [true, e];
    }
}{% endcompileNjs %};


module.exports.Block = {% compileNjs %}function () {
    var notifier = new njs.EventNotifier();
    notifier.wait.yld();
}{% endcompileNjs %};
