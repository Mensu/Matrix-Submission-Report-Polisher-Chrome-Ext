/** 
 * @description make a simple http request
 * @param {string} method
 * @param {string} url
 * @param {Object} param
 * @param {function(boolean, Object):void} callback - a function that looks like this:
 *      @param {boolean} error
 *      @param {Object} [response] - present when no error occurred
 *   function(error, response) {
 * 
 *   }
 * @return {void}
 * independent
 */
function httpRequest(method, url, param, callback) {
  return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      method = method.toLowerCase();
      if (method == 'get') {
          // convert param to ?key1=value1&key2=value2
        var temp = '';
        if (param) {
          for (var key in param) {
            temp += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
          }
          if (temp.length) {
            temp = temp.replace(/^&/, '?');
            if (url[url.lastIndexOf('/') - 1] == '/') url += '/';
            url += temp;
          }
        }
        param = null;  
        
      } else if (method == 'post') {
        param = JSON.stringify(param);
      }
      xhr.open(method, url, true);
      if (method == 'post') {
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');    
      }
      xhr.onload = function() {
        if (this.status == 200 || this.status == 304) {
          return resolve(this.response);
        } else {
          return reject(true);
        }
      }
      xhr.onerror = function() {
        return reject(true);
      }
      xhr.send(param);
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
    exports['httpRequest'] = factory();
  else
    root['httpRequest'] = factory();
})(this, function factory() {
  return httpRequest;
});
