var createElementWith = require('./lib/createElementWith.js');
var toSubmitAt = require('./lib/toSubmitAt.js');
var createSwitchBtn = require('./elements/SwitchBtn.js');
var polisher = require('./polisher.js');

function toArray(arrayLike) {
  return Array.prototype.slice.call(arrayLike, 0);
}

function hideFilesCmp() {
  if (this.hideElement) {
    this.hideElement.classList.add('hidden');
  }
  var tabName = /"([a-z]{1,})"(, \$index)?\)$/.exec(this.attributes['ng-click'].value);
  if (tabName) tabName = tabName[1];
  else return;
  var shouldAppear = this.hideElement.parentNode.querySelector('div[class*="-content"].ng-hide[ng-show*="' + tabName + '"]');
  if (shouldAppear) {
    shouldAppear.classList.remove('ng-hide');
  }
}

function addListenersForTabs() {
    // add listener for other tabs
    // to hide our FilesCmp tab content when other tabs are clicked
  var curLi = this;
  var liList = curLi.parentNode.querySelectorAll('li');
  liList.forEach(function(oneLi) {
    oneLi['hideElement'] = curLi.hideElement;
    oneLi['parentUl'] = curLi.parentNode;
    
    if (curLi.isSameNode(oneLi)) return;

    oneLi.removeEventListener('click', hideFilesCmp, false);
    oneLi.addEventListener('click', hideFilesCmp, false);
  });

}

function SwitchSelectedTab() {
    // change tab's selected state
  var activeSelector = (this.asTA ? 'choice-tab-active' : 'programming-nav-active');
  var originalSelectedTab = this.parentNode.querySelector('.' + activeSelector);
  originalSelectedTab.classList.remove(activeSelector);
  this.classList.add(activeSelector);
  if (!this.hideElement) return;
  
    // show our FilesCmp tab content now because it is currently selected
  this.hideElement.classList.remove('hidden');
    // hide other tabs content 
  var originalContent = null;
  if (this.asTA) {
    originalContent = this.hideElement.parentNode.querySelector('div.allsubmissions-content:not(.ng-hide)') || this.hideElement.parentNode.querySelector('div.onesubmission-content:not(.ng-hide)');
  } else {
    originalContent = this.hideElement.parentNode.querySelector('div.course-assignment-programming-content:not(.ng-hide):not(.files-cmp)');
  }
  if (originalContent) originalContent.classList.add('ng-hide');
  this.fix();
}

var invisibleRow = createElementWith('tr', ['invisible-row'], [createElementWith('td', 'th-checkbox', createElementWith('span', 'invisible', createCheckbox())),
                                                  createElementWith('td', 'th-sub-id', createElementWith('span', 'invisible', '000000')),
                                                  createElementWith('td', 'th-sub-time', createElementWith('span', 'invisible', '0000-00-00 00:00:00')),
                                                  createElementWith('td', 'th-grade', createElementWith('span', 'invisible', '100'))]);

function checkBoxInsideMe() {
  var checkbox = this.querySelector('input');
  checkbox.click();
}

function onChecked(event) {
  event.stopPropagation();

  var tr = this.parentNode.parentNode;
  var tbody = tr.parentNode;
  var anotherTable = tbody.parentNode.anotherTable;
    // clicked on selected part => click on related checkbox on choices part
  if ( -1 == anotherTable.className.indexOf('selected') ) return tr.relatedCheckbox.click();
    // clicked on choices part
  if (this.checked) {
      if ( tbody.querySelectorAll('input:checked').length == 2 ) {
        toArray(tbody.querySelectorAll('input:not(:checked)')).forEach(function(one) {
          one.disabled = true;
        });
        tbody.filesCmpTab.switchBtn.disabled = false;
      }
      var oneInvisibleRow = anotherTable.querySelector('.invisible-row');
      var selectedRow = tr.cloneNode(true);
      selectedRow.addEventListener('click', checkBoxInsideMe, false);
      selectedRow.querySelector('input').addEventListener('click', onChecked, false);
      
      this['relatedRow'] = selectedRow;
      selectedRow['relatedCheckbox'] = this;
      oneInvisibleRow.parentNode.replaceChild(selectedRow, oneInvisibleRow);
      var first = !selectedRow.previousSibling;
      selectedRow.insertBefore(createElementWith('td', 'th-role', createElementWith('span', 'th-span-role', (first ? 'old' : 'new'))), selectedRow.firstChild);
  } else {
      if ( tbody.querySelectorAll('input:checked').length == 1 ) {
        toArray(tbody.querySelectorAll('input:not(:checked)')).forEach(function(one) {
          one.disabled = false;
        });
        tbody.filesCmpTab.switchBtn.disabled = true;
      }
      var clonedInvisibleRow = invisibleRow.cloneNode(true);
      var first = !this.relatedRow.previousSibling;
      clonedInvisibleRow.insertBefore( createElementWith('td', 'th-role', createElementWith('span', 'th-span-role', (first ? 'old' : 'new'))), clonedInvisibleRow.firstChild );
      this.relatedRow.parentNode.replaceChild(clonedInvisibleRow, this.relatedRow);
  }
}

function createCheckbox() {
  var checkbox = createElementWith('input', 'files-cmp-checkbox');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('click', onChecked, false);
  return checkbox;
}

function showDifference() {
    // when back to selectChoicePart
  if (!this.elementIsHidden) return;

  var filesCmpTab = this.filesCmpTab;
  var filesDiffPart = filesCmpTab.filesDiffPart;
  var tbody = filesCmpTab.selectedTable.querySelector('tbody');

    // get submissionId
  var oldId = Number(tbody.childNodes[0].querySelector('.th-sub-id').textContent);
  var newId = Number(tbody.childNodes[1].querySelector('.th-sub-id').textContent);
  if (filesDiffPart.cmpIds && filesDiffPart.cmpIds.oldId == oldId && filesDiffPart.cmpIds.newId == newId) return;
  
    // get courseId and problemId
  var ids = /courses{0,1}\/([0-9]{1,})\/assignments{0,1}\/(?:submission-)?programming(?:\/|\?problemId=)([0-9]{1,})/.exec(document.URL);
  const [, courseId, assignmentId] = ids;
    // remove old ones
  var oldFilesCmpDiv = filesDiffPart.querySelector('.polished-report-success');
  if (oldFilesCmpDiv) {
    if (oldFilesCmpDiv.sideNav) oldFilesCmpDiv.sideNav.remove();
    oldFilesCmpDiv.parentNode.removeChild(oldFilesCmpDiv);
  }
  
  const message = { signal: 'filesDiff', courseId, assignmentId, oldId, newId };
  chrome.runtime.sendMessage(message, function(response) {
    if (response.status != 'OK') {
      filesDiffPart.appendChild(createElementWith('div', 'polished-report-success', 'Failed to get files to compare'));
    } else {
      var filesCmpDiv = require('./polisher.js').getFilesCmpDiv(response.filesDiff, {
        "stdHeading": String(oldId),
        "yourHeading": String(newId)
      });
        
      filesDiffPart['cmpIds'] = {
        "oldId": oldId,
        "newId": newId
      };
      var tableWrapper = filesCmpTab.selectedPart.querySelector('#course-statistics').cloneNode(true);
        // remove checkboxed
      toArray(tableWrapper.querySelectorAll('.td-checkbox')).forEach(function(one) {
        one.parentNode.removeChild(one);
      });
      filesCmpDiv.insertBefore(tableWrapper, filesCmpDiv.firstChild);
      filesDiffPart.appendChild(filesCmpDiv);

        // fix sideNav problem
      var sideNav = filesCmpDiv.sideNav;
      if (sideNav) {
        sideNav.init(filesCmpDiv.endSelector, 'ui-view.ng-scope');
        var filesCmpNavTab = document.querySelector('ul li.files-cmp-li');
        filesCmpNavTab['sideNav'] = sideNav;
        if (!filesCmpNavTab.sideNavFixListenerAdded) {
          filesCmpNavTab.addEventListener('click', function() {
            this.sideNav.fix();
          }, false);
          filesCmpNavTab['sideNavFixListenerAdded'] = true;
        }
      }
      
    }
  });
}

function FilesCmpTab(submissionsList, asTA) {
  this['asTA'] = asTA;
  this['selectedPart'] = createElementWith('div', 'selected-part', this.createSelectedPartContent());
  this['choicesPart'] = createElementWith('div', 'choices-part', this.createChoicesPartContent(submissionsList));
  this['filesDiffPart'] = createElementWith('div', 'files-diff-part');

  this['selectedTable'] = this.selectedPart.querySelector('table');
  this['choicesTable'] = this.choicesPart.querySelector('table');
  this.updateAnotherTable();
  this['selectChoicePart'] = createElementWith('div', 'select-choice-part', [this.selectedPart, this.choicesPart]);

  this['switchBtn'] = createSwitchBtn(this.selectChoicePart, this.filesDiffPart, {
    "show": 'select files',
    "hide": 'show difference'
  });
  this.switchBtn.classList.add('files-cmp-switch-btn');
  this.switchBtn.addEventListener('click', showDifference, false);
  this.switchBtn['filesCmpTab'] = this;
  this.switchBtn.disabled = true;

  this.selectedPart.querySelector('tbody')['switchBtn'] = this.switchBtn;
  this.choicesPart.querySelector('tbody')['switchBtn'] = this.switchBtn;

  this['tab'] = createElementWith('div', ['course-assignment-programming-content', 'files-cmp', 'hidden'], [this.selectChoicePart, this.filesDiffPart]);
  this.tab.insertBefore(this.switchBtn, this.selectChoicePart);
  this.tab['filesCmpTab'] = this;
}
FilesCmpTab.prototype = {
  "constructor": FilesCmpTab,
  "createSelectedPartContent": function() {
    var thead = createElementWith('thead', 'files-cmp-thead',
        createElementWith('tr', 'files-cmp-trow', [createElementWith('th', 'files-cmp-th', ' '),
                                                    createElementWith('th', ['files-cmp-th', 'td-checkbox'], 'Selected'),
                                                    createElementWith('th', 'th-sub-id', 'Id'),
                                                    createElementWith('th', 'th-sub-time', 'Submission Time'),
                                                    createElementWith('th', 'th-grade', 'Grade')]));

    var tbody = createElementWith('tbody', 'files-cmp-tbody');
    tbody['filesCmpTab'] = this;
    for (var i = 0; i != 2; ++i) {
      var clonedInvisibleRow = invisibleRow.cloneNode(true);
      var role = createElementWith( 'td', 'th-role', createElementWith('span', 'th-span-role', (0 == i ? 'old' : 'new') ));
      clonedInvisibleRow.insertBefore( role, clonedInvisibleRow.firstChild );
      tbody.appendChild(clonedInvisibleRow);
    }
    
    var table = createElementWith('table', ['assignment-info', 'selected-table'], [thead, tbody]);
    var wrapper = createElementWith('div', 'files-cmp-selected-part-wrapper', 
                                      createElementWith('div', 'statistics-wrapper',
                                                  createElementWith('div', 'statistics-container', table)));
    wrapper.id = 'course-statistics';
    return wrapper;
  },
  "createChoicesPartContent": function(submissionsList) {
    var wrapper = createElementWith('div', 'files-cmp-choices-part-wrapper',
                                    createElementWith('div', 'statistics-wrapper',
                                                  createElementWith('div', 'statistics-container', this.createChoicesTable(submissionsList))));
    wrapper.id = 'course-statistics';
    return wrapper;
  },
  "createChoicesTable": function(submissionsList) {
    var thead = createElementWith('thead', 'files-cmp-thead',
      createElementWith('tr', 'files-cmp-trow', [createElementWith('th', 'files-cmp-th', 'Selected'),
                                                    createElementWith('th', 'th-sub-id', 'Id'),
                                                  createElementWith('th', 'th-sub-time', 'Submission Time'),
                                                  createElementWith('th', 'th-grade', 'Grade')]));

    var tbody = createElementWith('tbody', 'files-cmp-tbody');
    tbody['filesCmpTab'] = this;

    submissionsList.forEach(function(one) {
      var row = createElementWith('tr', 'files-cmp-tr', [createElementWith('td', ['files-cmp-td', 'td-checkbox'], createCheckbox()),
                                                  createElementWith('th', 'th-sub-id', String(one.sub_ca_id)),
                                                  createElementWith('td', 'th-sub-time', toSubmitAt(one.submit_at), true),
                                                  createElementWith('td', 'th-grade', String(one.grade))]);
      row.addEventListener('click', checkBoxInsideMe, false);
      tbody.appendChild(row);
    });

    var table = createElementWith('table', ['assignment-info', 'choices-table'], [thead, tbody]);
    table['submissionsList'] = submissionsList;
    return table;
  },
  "updateAnotherTable": function() {
    this.selectedTable['anotherTable'] = this.choicesTable;
    this.choicesTable['anotherTable'] = this.selectedTable;
  },
  "updateChoicesTable": function(submissionsList) {
    var oldTable = this.choicesTable;

    var switchBtn = this.switchBtn;
    if (switchBtn.elementIsHidden) {
      switchBtn.click();
    }
    toArray(oldTable.querySelectorAll('input:checked')).forEach(function(one) {
      one.click();
    });
    
    var newTable = this.choicesTable = this.createChoicesTable(submissionsList);
    oldTable.parentNode.replaceChild(newTable, oldTable);

    this.updateAnotherTable();
  }
};

var FilesCmpElements = {
  "createSecondBarLi": function(text, hideElement, asTA) {
    var li = createElementWith('li', ['navli', 'files-cmp-li'], createElementWith('a', 'programming-nav', text));
    li['hideElement'] = hideElement;
    li['asTA'] = asTA;
    li.addEventListener('click', SwitchSelectedTab, false);
    li['fix'] = addListenersForTabs;
    return li;
  },
  "FilesCmpTab": FilesCmpTab
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
    exports['FilesCmpElements'] = factory();
  else
    root['FilesCmpElements'] = factory();
})(this, function factory() {
  return FilesCmpElements;
});
