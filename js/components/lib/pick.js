function pick(obj, ...props) {
  return Object.assign({}, ...props.map(oneProp => ({ [oneProp]: obj[oneProp] })));
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
    exports['pick'] = factory();
  else
    root['pick'] = factory();
})(this, function factory() {
  return pick;
});
