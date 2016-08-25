/** 
 * Create an element of tagName type, optionally add classes and append Nodes to the newly created element
 * @param {string} tagName
 * @param {(string | string[] )} [classList] - a class or an array of classes
 * @param {(string | Node[] | string[] )} [children] - a string or an array of string or an array of Nodes
 * @return {Node} the created element
 * independent
 */
function createElementWith(tagName, classList, children) {
  var newElement = document.createElement(tagName);
  if (classList === undefined) return newElement;

    // wrap to an array
  if (typeof(classList) === 'string') {
    classList = new Array(classList);
  }
  classList.forEach(function(oneClass) {
    newElement.classList.add(oneClass);
  });
  if (children === undefined) return newElement;

    // wrap to an array
  if ( ({}).toString.apply(children) != '[object Array]' || typeof(children) === 'string' ) {
    children = new Array(children);
  }
  children.forEach(function(oneChild) {
    if (typeof(oneChild) === 'string') oneChild = document.createTextNode(oneChild);
    newElement.appendChild(oneChild);
  });
  return newElement;
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
    exports['createElementWith'] = factory();
  else
    root['createElementWith'] = factory();
})(this, function factory() {
  return createElementWith;
});
