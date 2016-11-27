function registerSelectAll(listener, callback) {
  listener.removeEventListener('click', changeSelectionTarget);
  listener.addEventListener('click', changeSelectionTarget);
  listener.changeSelectionTarget = callback;
  document.body.removeEventListener('click', clearSelectionTarget);
  document.body.addEventListener('click', clearSelectionTarget);
  document.body.removeEventListener('keydown', selectAll);
  document.body.addEventListener('keydown', selectAll);
}
function changeSelectionTarget(event) {
  this.selectionTarget = this.changeSelectionTarget(event);
  document.body.selectionTargetWrapper = this;
}
function clearSelectionTarget(event) {
  var body = this;
  var targetIsInPath = event.path.some(function(one) {
    return one == body.selectionTargetWrapper;
  });
  if (targetIsInPath) return;
  body.selectionTargetWrapper = null;
}
function selectAll(event) {
  var ctrlPressed = ((navigator.platform == 'MacIntel' && event.metaKey) || event.ctrlKey);
  if (!document.body.selectionTargetWrapper || !(ctrlPressed && (event.key || event.keyIdentifier) == 'a')) return;
  var range = document.createRange();
  var selection = window.getSelection();
  range.selectNodeContents(document.body.selectionTargetWrapper.selectionTarget);
  selection.removeAllRanges();
  selection.addRange(range);
  event.preventDefault();
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
    exports['registerSelectAll'] = factory();
  else
    root['registerSelectAll'] = factory();
})(this, function factory() {
  return registerSelectAll;
});
