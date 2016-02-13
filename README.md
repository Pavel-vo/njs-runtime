# NJS Runtime
Get rid of callback hell.

*****

NJS is JavaScript library based on Neil Mix’s narrative.js
Narrative.js is a compiler tool that relies on a small extension to the language (a special yielding operator) to convert synchronous-looking code into its callback-based equivalent.
It enables blocking capabilities and allows you to write code without "callback hell".

*****

For getting started with NJS, we recommend you begin with the following article:
* [The long road to Async/Await in JavaScript](https://thomashunter.name/blog/the-long-road-to-asyncawait-in-javascript/)

# getting started

## install

```bash
npm install njs-runtime
```

## simple example

* Create file A 

```js
require('njs-runtime/node-extension');
global.njs = require('njs-runtime');
require('./B');
```

Module `njs-runtime/node-extension` extends nodejs's module loader with NJS capabilities. So all new `require`'d modules will be processed with NJS parser, and transformed to regular JavaScript.
Global variable `njs` contains blocking control primitives.

* Create file B

```js
var startTime = Date.now();
var sleep = njs.sleep;

var print = function (message) {
    console.log(message, '>', Date.now() - startTime, 'ms');
};
```

Every time we call `print`, we get message and elapsed time in milliseconds.
Function `sleep` is NJS primitive based on **setTimeout**.

* Continue file B:

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

`testRuntime` function wrapped with special Swig tags `{% compileNjs %}...{% endcompileNjs %}`
Content inside tags must be a function, and it will be transformed to a new callback-based function.
Points of splitting tagged as `.yld` operator. Yes, it's not a field, it's a special yielding operator which looks-like field.
The reason we use such notation is compatibility with JavaScript text editors.

* Output:

```
one > 9 ms
two > 11 ms
three > 13 ms
four > 1016 ms
five > 2020 ms
```

`one` `two` `three` have occurred almost in one time, `four` a second later and `five` 2 seconds later.

### TODO:
* Webpack plugin (production)
* Editor with support swig tags
* Use if for while try
* Handling Exceptions
* How to call NJS-compiled functions from NJS-compiled functions
* How to call regular callback-based functions from NJS-compiled functions
* Limitations

