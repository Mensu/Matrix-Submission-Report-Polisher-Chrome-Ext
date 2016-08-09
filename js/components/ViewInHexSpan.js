var createElementWith = require('./createElementWith.js');
function createHexHidingStyle(diffId) {
  return createElementWith('style', 'hexHidingStyle',
    '#' + diffId + ' .line-numbers-rows .line-numbers-one-row-binary {display: none;}'
      + '#' + diffId + ' .one-diff-content .one-diff-content-one-row-binary {display: none;}');
}
function toViewInHex() {
  var checkbox = this;
  var parent = checkbox.parentNode.parentNode, diffId = parent.id;
  var hexHidingStyle = parent.querySelector('.hexHidingStyle');
  if (hexHidingStyle) parent.removeChild(hexHidingStyle);
  else parent.insertBefore(createHexHidingStyle(diffId), parent.childNodes[0]);
}
function createViewInHexSpan(checkboxId) {
  var checkbox = createElementWith('input', 'view-in-hex-checkbox');
  checkbox.type = 'checkbox';
  var label = createElementWith('label', 'view-in-hex-label', 'view in hex');
  var wrapper = createElementWith('span', 'view-in-hex-wrapper', [checkbox, label]);
  label.htmlFor = checkbox.id = 'view-in-hex-' + checkboxId;
  checkbox.addEventListener('change', toViewInHex, false);
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
    exports['ViewInHexSpan'] = factory();
  else
    root['ViewInHexSpan'] = factory();
})(this, function factory() {
  return {
    "createViewInHexSpan": createViewInHexSpan,
    "createHexHidingStyle": createHexHidingStyle
  }
});
