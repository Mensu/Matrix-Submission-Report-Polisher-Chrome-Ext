var hljs = require('../lib/highlight.pack.js');
var createElementWith = require('../lib/createElementWith.js');

function StudentAnswerArea(formattedCodes, supportedFiles, language) {
  this.tabsUl = createElementWith('ul', 'answerfiles-ul');
  this.codeArea = createElementWith('div', 'code-area');
  this.codeBlocks = [];
  this.supportedCodeBlocks = [];
  var self = this;
  function addTabs(files, supported) {
    for (var name in files) {
      if (!files[name]) continue;
      var oneCodeBlock = createElementWith('code', 'language-' + language, files[name]);
      oneCodeBlock['codeFilename'] = name;
      if (supported) {
        self.supportedCodeBlocks.push(oneCodeBlock);
      } else {
        self.codeBlocks.push(oneCodeBlock);
      }
      var oneCodePre = createElementWith('pre', ['language-' + language, 'hidden'], oneCodeBlock);
      self.codeArea.appendChild(oneCodePre);

      var oneTab = createElementWith('li', 'answerfile-bar-li', name);
      oneTab['studentAnswerAreaObj'] = self;
      oneTab['codePre'] = oneCodePre;
      oneTab.addEventListener('click', switchFileTab, false);
      self.tabsUl.appendChild(oneTab);
    }
  }
  addTabs(formattedCodes, false);
  addTabs(supportedFiles, true);
  
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
  "highlightOneBlock": function(one) {
    var result = one.className.match(/language-[\w]{1,}/);
    if (!result) return;
    hljs.highlightBlock(one);
  },
  "init": function() {
    this.supportedCodeBlocks.forEach(this.highlightOneBlock);
    this.fix();
  },
  "fix": function() {
    this.codeBlocks.forEach(this.highlightOneBlock);
    var original = this.tabsUl.querySelector('li.files-tab-active');
    if (original) {
      original.click();
    } else {
      var firstFileTab = this.tabsUl.querySelector('li');
      if (firstFileTab) {
        firstFileTab.click();
      }
    }
  },
  "update": function(formattedCodes) {
    this.supportedCodeBlocks.forEach(function(one) {
      one.parentNode.classList.add('hidden');
    });
    this.codeBlocks.forEach(function(one) {
      one.parentNode.classList.add('hidden');
      one.textContent = formattedCodes[one.codeFilename];
    });
    this.fix();
  }
};

function switchFileTab() {
  var original = this.studentAnswerAreaObj.tabsUl.querySelector('li.files-tab-active');
  if (original) {
    original.classList.remove('files-tab-active');
    original.codePre.classList.add('hidden');
  }
  this.classList.add('files-tab-active');
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
