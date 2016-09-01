var createElementWith = require('../lib/createElementWith.js');
function toggleViewInHex() {
  var checkbox = this;
  var parent = checkbox.parentNode.parentNode;
  if (checkbox.checked) parent.classList.remove('hideHex');
  else parent.classList.add('hideHex');
}
/** 
 * create a span that can toggle to view the text in hex
 * @param {string} checkboxId
 * @return {Node} the created span
 * dependent of 
 *   {function} createElementWith
 *   {function} toggleViewInHex
 */
function createViewInHexSpan(checkboxId) {
  var checkbox = createElementWith('input', 'view-in-hex-checkbox');
  checkbox.type = 'checkbox';
  var label = createElementWith('label', 'view-in-hex-label', 'view in hex');
  var wrapper = createElementWith('span', 'view-in-hex-wrapper', [checkbox, label]);
  label.htmlFor = checkbox.id = 'view-in-hex-' + checkboxId;
  checkbox.addEventListener('click', toggleViewInHex, false);
  return wrapper;
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
    exports['createViewInHexSpan'] = factory();
  else
    root['createViewInHexSpan'] = factory();
})(this, function factory() {
  return createViewInHexSpan;
});
