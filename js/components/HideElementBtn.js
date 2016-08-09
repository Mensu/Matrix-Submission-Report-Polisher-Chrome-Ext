var createElementWith = require('./createElementWith.js');
function toHide() {
  var btn = this;
  if (btn.elementIsHiding) {
    btn.elementToHide.classList.remove('hiding');
    btn.elementIsHiding = false, btn.value = btn.buttonText.hide;
  } else {
    btn.elementToHide.classList.add('hiding');
    btn.elementIsHiding = true, btn.value = btn.buttonText.show;
  }
}
function createHideElementBtn(elementToHide, elementIsHiding) {
  var btn = createElementWith('input', 'hide-button');
  btn.type = 'button';
  btn.buttonText = {
    "show": 'show',
    "hide": 'hide'
  };
  btn.value = btn.buttonText.hide;
  btn['elementIsHiding'] = elementIsHiding || false;
  btn['elementToHide'] = elementToHide;
  btn.addEventListener('click', toHide, false);
  return btn;
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
    exports['HideElementBtn'] = factory();
  else
    root['HideElementBtn'] = factory();
})(this, function factory() {
  return createHideElementBtn;
});
