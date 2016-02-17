# NJS - Narrative JavaScript

*****

NJS is JavaScript library based on Neil Mix’s narrative.js  
Narrative.js is a compiler tool that relies on a small extension to the language (a special yielding operator) to convert synchronous-looking code into its callback-based equivalent.  
It enables blocking capabilities and allows you to write code without "callback hell".

*****

For getting started with NJS, we recommend you begin with the following article:  
[The long road to Async/Await in JavaScript](https://thomashunter.name/blog/the-long-road-to-asyncawait-in-javascript/)

# Getting started

## Install

```bash
npm install njs-runtime
```

## Simple example

##### Create file A.js:

```js
require('njs-runtime/node-extension');
global.njs = require('njs-runtime');
require('./B');
```

Module `njs-runtime/node-extension` extends nodejs's module loader with NJS capabilities. So all new `require`'d modules will be processed by NJS parser, and transformed to regular JavaScript.
> :exclamation: We recommed `njs-runtime/node-extension` only for development. Please use [NJS Webpack Plugin](https://github.com/Pavel-vo/njs-webpack-plugin) for production.

Module `njs-runtime` contains blocking primitives you need to write NJS code. By default NJS - compiled code require NJS-Runtime saved to global variable `njs`.

##### Create file B.js

```js
var startTime = Date.now();
var sleep = njs.sleep;

var print = function (message) {
    console.log(message, '>', Date.now() - startTime, 'ms');
};
```
Every time we call `print`, we get message and elapsed time in milliseconds.  
Function `sleep` is NJS primitive based on **setTimeout**.

##### Append to file B.js:

```js
var testRuntime = {% compileNjs %}function () {
    print('two');
    sleep.yld(1000);
    print('four');
    sleep.yld(1000);
    print('five');
}{% endcompileNjs %};

print('one');
testRuntime(); // new thread
print('three');
```

The `testRuntime` function wrapped with special Swig tags `{% compileNjs %}...{% endcompileNjs %}`  
Content inside tags must be a function, and it will be transformed to a new callback-based function.  
Points of splitting tagged as `.yld` operator. Yes, it's not a field, it's a special yielding operator which looks-like a field.  
The reason why we use such notation is the compatibility with JavaScript text editors.

##### Run A.js:

```
one > 9 ms
two > 11 ms
three > 13 ms
four > 1016 ms
five > 2020 ms
```

`one` `two` `three` have occurred almost in one time, `four` a second later and `five` 2 seconds later.

### TODO:
- [ ] Example with recursion
- [ ] Create own primitives
- [ ] Using of: `if` `for` `while` `try`
- [ ] Handling Exceptions
- [ ] Calling NJS-compiled function from NJS-compiled function
- [ ] Calling regular callback-based function from NJS-compiled function
- [ ] Async wrappers for regular functions
- [ ] Webpack plugin (production)
- [ ] Editor with support of Swig tags
- [ ] Limitations

# See also
* [NJS Webpack Plugin](https://github.com/Pavel-vo/njs-webpack-plugin)
