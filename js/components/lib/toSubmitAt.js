/** 
 * switch string's format between "2015-11-11 11:11:11" (Normal) and "2015-11-11T03:11:11.000Z"(000Z)
 * @param {string} str - a string in format "Normal" or "000Z"
 * @param {boolean} [toReadable] - true: to Normal;
 *                                 false: to 000Z;
 *                                 omitted: toggle between Normal and 000Z
 * @return {string} resulted string representing time
 * independent
 */
function toSubmitAt(str, toReadable) {
  var date = new Date();
  function prefixZero(str) {
    return (String(str).length - 1) ? String(str) : '0' + str;
  }
  function to000Z() {
    date.setFullYear(str.substring(0, 4)), date.setMonth(parseInt(str.substring(5, 7)) - 1), date.setDate(str.substring(8, 10)), date.setHours(str.substring(11, 13)), date.setMinutes(str.substring(14, 16)), date.setSeconds(str.substring(17, 19));
    return date.getUTCFullYear() + '-' + prefixZero(parseInt(date.getUTCMonth()) + 1) + '-' + prefixZero(date.getUTCDate()) + 'T' + prefixZero(date.getUTCHours()) + ':' + prefixZero(date.getUTCMinutes()) + ':' + prefixZero(date.getUTCSeconds()) + '.000Z';
  }
  function toNormal() {
    date.setUTCFullYear(str.substring(0, 4)), date.setUTCMonth(parseInt(str.substring(5, 7)) - 1), date.setUTCDate(str.substring(8, 10)), date.setUTCHours(str.substring(11, 13)), date.setUTCMinutes(str.substring(14, 16)), date.setUTCSeconds(str.substring(17, 19));
    return date.getFullYear() + '-' + prefixZero(parseInt(date.getMonth()) + 1) + '-' + prefixZero(date.getDate()) + ' ' + prefixZero(date.getHours()) + ':' + prefixZero(date.getMinutes()) + ':' + prefixZero(date.getSeconds());
  }
  if (~str.indexOf('.000Z')) {
      if (toReadable || toReadable === undefined) return toNormal();
      else return str;
  } else {
      if (toReadable) return str;
      else return to000Z();
  }
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
    exports['toSubmitAt'] = factory();
  else
    root['toSubmitAt'] = factory();
})(this, function factory() {
  return toSubmitAt;
});
