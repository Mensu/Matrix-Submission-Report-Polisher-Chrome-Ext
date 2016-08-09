var CustomPre = require('./CustomPre.js');
var createHideElementBtn = require('./HideElementBtn.js');
var ViewInHexSpan = require('./ViewInHexSpan.js');
var createSwitchBtn = require('./SwitchBtn.js');
function CustomElements() {}
CustomElements.extendFrom = function(parent) {
  for (var name in parent) this.prototype[name] = parent[name];
}
CustomElements.extendFrom(CustomPre);
CustomElements.extendFrom({
  "createElementWith": require('./createElementWith'),
  "createHideElementBtn": createHideElementBtn,
  "createViewInHexSpan": ViewInHexSpan.createViewInHexSpan,
  "createHexHidingStyle": ViewInHexSpan.createHexHidingStyle,
  "createSwitchBtn": createSwitchBtn
});

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
    exports['CustomElements'] = factory();
  else
    root['CustomElements'] = factory();
})(this, function factory() {
  return new CustomElements();
});
