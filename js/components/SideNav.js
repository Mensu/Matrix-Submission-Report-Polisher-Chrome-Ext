var $ = require('./jquery.js');
require('./jquery.nav.js')(this, $);
var createElementWith = require('./createElementWith.js');
function SideNav() {
  this.wrapper = createElementWith('div', 'side-nav');
  this.toggle = createElementWith('h5', 'nav-toggle-wrapper', createElementWith('div', 'nav-toggle', 'Navigation'));
  this.body = createElementWith('ul', 'nav-body', '');
  this.wrapper.appendChild(this.toggle);
  this.wrapper.appendChild(this.body);
}
SideNav.prototype = {
  "add": function(title, id, type, classList) {
    var newItem = createElementWith('a');
    if (typeof(classList) == 'string') classList = new Array(classList);
    else classList = [];
    this.body.appendChild(createElementWith('li', ['h' + type + '_nav'].concat(classList), newItem));
    newItem.outerHTML = '<a href="#' + id + '" rel="nofollow">' + title + '</a>';
    return newItem;
  },
  "getNode": function() {
    return this.wrapper;
  },
  "getInitialized": function(endSelector, unbindSelector) {
    var self = this;
    $(this.toggle).click(function(e){
        e.preventDefault();
        $(self.wrapper).toggleClass('fold');
    });
    this.onePageNav = $(this.body).onePageNav({
        currentClass: "active",
        changeHash: !1,
        easing: "swing",
        filter: "",
        scrollSpeed: 700,
        scrollOffset: 200,
        scrollThreshold: 0,
        begin: null,
        end: null,
        scrollChange: null,
        endSelector: endSelector,
        unbindSelector: unbindSelector
    });
  },
  "remove": function() {
    this.onePageNav.unbindInterval();
    $(this.wrapper).remove();
  }
};
SideNav.prototype.constructor = SideNav;
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
    exports['SideNav'] = factory();
  else
    root['SideNav'] = factory();
})(this, function factory() {
  return SideNav;
});
