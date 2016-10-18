var hljs = require('./highlight.pack.js');
var createElementWith = require('../lib/createElementWith.js');

function StudentAnswerArea(formattedCodes, language) {
  this.tabsUl = createElementWith('ul', 'answerfiles-ul');
  this.codeArea = createElementWith('div', 'code-area');
  this.codeBlocks = [];
  for (var name in formattedCodes) {
    var oneCodeBlock = createElementWith('code', 'language-' + language, formattedCodes[name]);
    oneCodeBlock['codeFilename'] = name;
    this.codeBlocks.push(oneCodeBlock);
    var oneCodePre = createElementWith('pre', ['language-' + language, 'hidden'], oneCodeBlock);
    this.codeArea.appendChild(oneCodePre);

    var oneTab = createElementWith('a', 'answerfile-bar', name);
    oneTab['studentAnswerAreaObj'] = this;
    oneTab['codePre'] = oneCodePre;
    oneTab.addEventListener('click', switchFileTab, false);
    var oneTabWrapper = createElementWith('li', 'answerfile-bar-li', oneTab);
    this.tabsUl.appendChild(oneTabWrapper);
  }
  this.filesTabsContainer = createElementWith('div', 'answerfile-bar-container', this.tabsUl);

  this.codeArea.id = 'code-area';
  this.oneStudentArea = createElementWith('div', 'one-student-area', [this.filesTabsContainer, this.codeArea]);
  this.container = createElementWith('div', 'answer-container', [
                        createElementWith('div', 'title', 'Clang-formatted Answer'),
                        this.oneStudentArea]);
  this.wrapper = createElementWith('div', ['answer-wrapper', 'clang-formatted'], this.container);
  this.wrapper['studentAnswerAreaObj'] = this;
  this.init();
}

StudentAnswerArea.prototype = {
  "getNode": function() {
    return this.wrapper;
  },
  "init": function() {
    this.codeBlocks.forEach(function(one) {
      var result = one.className.match(/language-[\w]{1,}/);
      if (!result) return;
      hljs.highlightBlock(one);
    });
    var firstFileTab = this.tabsUl.querySelector('a');
    if (firstFileTab) firstFileTab.click();
  },
  "update": function(formattedCodes) {
    this.codeBlocks.forEach(function(one) {
      one.parentNode.classList.add('hidden');
      one.textContent = formattedCodes[one.codeFilename];
    });
    this.init();
  }
};

function switchFileTab() {
  var original = this.studentAnswerAreaObj.tabsUl.querySelector('a.answerfile-bar-active');
  if (original) {
    if (original.isSameNode(this)) return;
    original.classList.remove('answerfile-bar-active');
    original.codePre.classList.add('hidden');
  }
  this.classList.add('answerfile-bar-active');
  this.codePre.classList.remove('hidden');
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
    exports['StudentAnswerArea'] = factory();
  else
    root['StudentAnswerArea'] = factory();
})(this, function factory() {
  return StudentAnswerArea;
});
