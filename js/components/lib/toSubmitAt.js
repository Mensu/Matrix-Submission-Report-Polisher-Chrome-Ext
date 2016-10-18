/** 
 * switch string's format between "2015-11-11 11:11:11" (Normal) and "2015-11-11T03:11:11.000Z"(ISO)
 * @param {string} str - a string in format "Normal" or "ISO"
 * @param {boolean} [toReadable] - true: to Normal;
 *                                 false: to ISO;
 *                                 omitted: toggle between Normal and ISO
 * @return {string} resulted string representing time
 * independent
 */
function toSubmitAt(str, toReadable) {
  var date = new Date();
  function prefixZero(str, digitNum) {
    digitNum = digitNum || 1;
    return (String(str).length - digitNum) ? String(str) : '0' + str;
  }
  function toISO() {
    date = new Date(str);
    return date.toISOString();
  }
  function toNormal() {
    date = new Date(str);
    return date.getFullYear() + '-' + prefixZero(parseInt(date.getMonth()) + 1) + '-'
      + prefixZero(date.getDate()) + ' ' + prefixZero(date.getHours()) + ':'
      + prefixZero(date.getMinutes()) + ':' + prefixZero(date.getSeconds()) + '.'
      + prefixZero(prefixZero(date.getMilliseconds()), 2);
  }
  if (str.endsWith('Z')) {
      if (toReadable || toReadable === undefined) return toNormal();
      else return str;
  } else {
      if (toReadable) return str;
      else return toISO();
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
