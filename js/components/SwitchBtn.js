var createElementWith = require('./createElementWith.js');
function toSwitch() {
  var button = this;
  if (button.elementIsHiding) {
    button.elementToShowByDefault.classList.remove('hiding');
    button.elementToHideByDefault.classList.add('hiding');
    button.elementIsHiding = false, button.value = button.buttonText.hide;
  } else {
    button.elementToShowByDefault.classList.add('hiding');
    button.elementToHideByDefault.classList.remove('hiding');
    button.elementIsHiding = true, button.value = button.buttonText.show;
  }
}
function createSwitchBtn(elementToShow, elementToHide, buttonText) {
  var switchBtn = createElementWith('input', 'switch-btn');
  switchBtn.type = 'button';
  switchBtn.buttonText = buttonText;
  switchBtn.value = buttonText.hide;
  switchBtn.elementIsHiding = false;
  switchBtn.elementToHideByDefault = elementToHide;
  switchBtn.elementToShowByDefault = elementToShow;
  switchBtn.addEventListener('click', toSwitch, false);
  elementToHide.classList.add('hiding');
  return switchBtn;
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
    exports['createSwitchBtn'] = factory();
  else
    root['createSwitchBtn'] = factory();
})(this, function factory() {
  return createSwitchBtn;
});
