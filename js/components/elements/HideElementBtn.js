var createElementWith = require('../lib/createElementWith.js');
function toggleHidden() {
  var btn = this;
  if (btn.elementIsHidden) {
    btn.elementToHide.classList.remove('hidden');
    btn.elementIsHidden = false, btn.value = btn.buttonText.hide;
  } else {
    btn.elementToHide.classList.add('hidden');
    btn.elementIsHidden = true, btn.value = btn.buttonText.show;
  }
}
/** 
 * create a button that can toggle to hide or show element
 * @param {Node} elementToHide
 * @param {Node} [elementIsHidden] - whether the element is hidden by default
 * @param {object} [buttonText] - text on button, with the following format
 * {
 *   "show": text to guide user to show element
 *   "hide": text to guide user to hide element
 * }
 * @return {Node} the created button
 * dependent of 
 *   {function} createElementWith
 *   {function} toggleHidden
 */
function createHideElementBtn(elementToHide, elementIsHidden, buttonText) {
  var btn = createElementWith('input', 'hide-button');
  btn.type = 'button';
  btn.buttonText = buttonText || {
    "show": 'show',
    "hide": 'hide'
  };
  btn.value = btn.buttonText.hide;
  btn['elementIsHidden'] = elementIsHidden || false;
  btn['elementToHide'] = elementToHide;
  btn.addEventListener('click', toggleHidden, false);
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
