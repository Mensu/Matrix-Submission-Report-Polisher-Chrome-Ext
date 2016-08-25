var createElementWith = require('../lib/createElementWith.js');

  // create backToTop button
var backToTop = createElementWith('div', 'backToTop-wrapper',
  createElementWith('div', 'backToTop-btn', [
      createElementWith('div', 'arrow-upward'),
      createElementWith('div', 'vertical-stick')
    ]
  )
);
backToTop.id = 'backToTop';

  // scroll event
backToTop.addEventListener('click', function () {
  var distanceFromTop = document.body.scrollTop;
  var pace = distanceFromTop / 33.3;
  window.requestAnimationFrame((function () {
    var resultedScrollTop = document.body.scrollTop - pace;
    document.body.scrollTop = ((resultedScrollTop < 0) ? 0 : resultedScrollTop);
    if (document.body.scrollTop > 0) window.requestAnimationFrame(arguments.callee);
  }));
}, false);

backToTop.toShow = function() {
  this.classList.remove('hidden');
};
backToTop.toHide = function() {
  this.classList.add('hidden');
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
