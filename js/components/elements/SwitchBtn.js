var createElementWith = require('../lib/createElementWith.js');
function toSwitch() {
  var button = this;
  if (button.elementIsHidden) {
    button.elementToShowByDefault.classList.remove('hidden');
    button.elementToHideByDefault.classList.add('hidden');
    button.elementIsHidden = false, button.value = button.buttonText.hide;
  } else {
    button.elementToShowByDefault.classList.add('hidden');
    button.elementToHideByDefault.classList.remove('hidden');
    button.elementIsHidden = true, button.value = button.buttonText.show;
  }
}
/** 
 * create a button that can hide one element and show the other element when clicked
 * @param {Node} elementToShow - element to show by default
 * @param {Node} elementToHide - element to hide by default
 * @param {object} buttonText - text on button, with the following format
 * {
 *   "show": text to guide user to show the element that is shown by default
 *   "hide": text to guide user to show the element that is hidden by default
 * }
 * @return {Node} the created button
 * dependent of 
 *   {function} createElementWith
 *   {function} toSwitch
 */
function createSwitchBtn(elementToShow, elementToHide, buttonText) {
  var switchBtn = createElementWith('input', 'switch-btn');
  switchBtn.type = 'button';
  switchBtn.buttonText = buttonText;
  switchBtn.value = buttonText.hide;
  switchBtn.elementIsHidden = false;
  switchBtn.elementToHideByDefault = elementToHide;
  switchBtn.elementToShowByDefault = elementToShow;
  switchBtn.addEventListener('click', toSwitch, false);
  elementToHide.classList.add('hidden');
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
