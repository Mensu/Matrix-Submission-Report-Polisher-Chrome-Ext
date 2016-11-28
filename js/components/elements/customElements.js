var customPre = require('./customPre.js');
var createHideElementBtn = require('./HideElementBtn.js');
var createViewInHexSpan = require('./ViewInHexSpan.js');
var createStdYourDiffRadioGroup = require('./StdYourDiffRadioGroup.js');
var createSwitchBtn = require('./SwitchBtn.js');
var createStudentAnswerArea = require('./StudentAnswerArea.js');
var customElements = {
  "extendFrom": function(parent) {
    for (var name in parent) this[name] = parent[name];
  }
};
customElements.extendFrom(customPre);
customElements.extendFrom({
  "createElementWith": require('../lib/createElementWith'),
  "createHideElementBtn": createHideElementBtn,
  "createViewInHexSpan": createViewInHexSpan,
  "createSwitchBtn": createSwitchBtn,
  "createStdYourDiffRadioGroup": createStdYourDiffRadioGroup
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
    exports['customElements'] = factory();
  else
    root['customElements'] = factory();
})(this, function factory() {
  return customElements;
});
