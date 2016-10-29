var createElementWith = require('./lib/createElementWith.js');
function closeMe() {
  this.wrapper.parentNode.removeChild(this.wrapper);
}
function createMatrixAlert(text) {
  var textContainer = createElementWith('div', 'container', text);
  var alertContent = createElementWith('div', 'alert-content',
                           createElementWith('span', 'wrapper', textContainer));
  var button = createElementWith('div', 'alert-button', '好吧');
  var wrapper = createElementWith('div', 'matrix-alert-outer-wrapper',
    createElementWith('div', 'matrix-alert',
      createElementWith('div', 'matrix-alert-wrapper',
        createElementWith('div', 'matrix-alert-container', [ alertContent, button ])
      )
    )
  );
  button['wrapper'] = wrapper;
  wrapper.id = 'matrix-alert';
  wrapper['button'] = button;
  button['closeMe'] = closeMe;
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
    exports['createMatrixAlert'] = factory();
  else
    root['createMatrixAlert'] = factory();
})(this, function factory() {
  return createMatrixAlert;
});
