var createElementWith = require('../lib/createElementWith.js');
function stdOnClick() {
  var radio = this;
  var parent = radio.parentNode.parentNode.parent;
  if (radio.checked) {
    parent.classList.remove('hideAdded');
    parent.classList.add('hideRemoved');
  }
}
function yourOnClick() {
  var radio = this;
  var parent = radio.parentNode.parentNode.parent;
  if (radio.checked) {
    parent.classList.remove('hideRemoved');
    parent.classList.add('hideAdded');
  }
}
function diffOnClick() {
  var radio = this;
  var parent = radio.parentNode.parentNode.parent;
  if (radio.checked) {
    parent.classList.remove('hideRemoved');
    parent.classList.remove('hideAdded');
  }
}
function createOneRadio(radioId, config) {
  var radio = createElementWith('input', 'std-your-diff-radio-group-radio');
  radio.type = 'radio';
  var label = createElementWith('label', 'std-your-diff-radio-group-label', config.label);
  var wrapper = createElementWith('span', 'std-your-diff-radio-group-wrapper', [radio, label]);
  radio.name = 'std-your-diff-radio-group-' + radioId;
  label.htmlFor = radio.id = radio.name + '-' + config.label.toLowerCase().replace(' ', '-');
  radio.addEventListener('click', config.onclick, false);
  return wrapper;
}
var config = [{
  "label": 'Difference',
  "onclick": diffOnClick
}, {
  "label": 'Standard Output',
  "onclick": stdOnClick
}, {
  "label": 'Your Output',
  "onclick": yourOnClick
}];
function createStdYourDiffRadioGroup(radioId, parent) {
  var group = createElementWith('span', 'std-your-diff-radio-group');
  group.parent = parent;
  config.forEach(function(oneConfig) {
    group.appendChild(createOneRadio(radioId, oneConfig));
  });
  return group;
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
    exports['createStdYourDiffRadioGroup'] = factory();
  else
    root['createStdYourDiffRadioGroup'] = factory();
})(this, function factory() {
  return createStdYourDiffRadioGroup;
});
