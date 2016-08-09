function httpRequest(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) return callback(false, this.response);
  }
  xhr.onerror = function() { return callback(true); }
  xhr.send();
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
    exports['httpRequest'] = factory();
  else
    root['httpRequest'] = factory();
})(this, function factory() {
  return httpRequest;
});
