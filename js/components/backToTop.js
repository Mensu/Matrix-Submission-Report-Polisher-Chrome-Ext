var createElementWith = require('./createElementWith.js');
var backToTop = createElementWith('div', 'backToTop-wrapper',
  createElementWith('div', 'backToTop-btn', [
      createElementWith('div', 'arrow-upward'),
      createElementWith('div', 'vertical-stick')
    ]
  )
);
backToTop.id = 'backToTop';
backToTop.addEventListener('click', function () {
  var distanceFromTop = document.body.scrollTop;
  var pace = distanceFromTop / 33.3;
  window.requestAnimationFrame((function () {
    var calculatedScrollTop = parseInt(document.body.scrollTop) - pace;
    document.body.scrollTop = ((calculatedScrollTop < 0) ? 0 : calculatedScrollTop);
    if (parseInt(document.body.scrollTop) > 0) window.requestAnimationFrame(arguments.callee);
  }));
}, false);
backToTop.toShow = function() {
  this.classList.remove('hiding');
};
backToTop.toHide = function() {
  this.classList.add('hiding');
};
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
    exports['backToTop'] = factory();
  else
    root['backToTop'] = factory();
})(this, function factory() {
  return backToTop;
});
