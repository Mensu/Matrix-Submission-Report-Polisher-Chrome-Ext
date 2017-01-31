/** 
 * @description drive a simple generator
 * 
 * @param {Generator} gen
 * @param {...any} args
 * @return {Promise}
 * 
 * independent
 */
function genDriver(gen, ...args) {
  const it = gen(...args);
  let ret = null, err = null;
  return new Promise((resolve, reject) => {
    iterate();

    function iterate(val) {
      try {
        if (err) err = null, ret = it.throw(val);
        else ret = it.next(val);
      } catch (e) {
        return reject(e);
      }
      const promise = new Promise(localResolve => localResolve(ret.value));
      if (ret.done) promise.then(resolve, reject);
      else promise.catch(e => (err = true, e)).then(iterate);
    }

  });
}

(function exportModuleUniversally(root, factory) {
  if (typeof(exports) === 'object' && typeof(module) === 'object')
    module.exports = factory();
  else if (typeof(define) === 'function' && define.amd)
    define(factory);
  /* amd  // module name: diff
    define([other dependent modules, ...], function(other dependent modules, ...)) {
      return exported object;
    });
    usage: require([required modules, ...], function(required modules, ...) {
      // codes using required modules
    });
  */
  else if (typeof(exports) === 'object')
    exports['genDriver'] = factory();
  else
    root['genDriver'] = factory();
})(this, function factory() {
  return genDriver;
});
