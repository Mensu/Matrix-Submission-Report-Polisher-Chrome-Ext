var showCRCheckBox = document.getElementById('showCR');
var autoPolishCheckBox = document.getElementById('autoPolish');
var maxStdCaseNumInput = document.getElementById('maxStdCaseNum');
var maxRanCaseNumInput = document.getElementById('maxRanCaseNum');
var maxMemCaseNumInput = document.getElementById('maxMemCaseNum');
// var noValidationLoginCheckBox = document.getElementById('noValidationLogin');
var saveButton = document.getElementById('save');
var savedSuccessfully = document.getElementById('savedSuccessfully');
var maxCaseNums = [
  {
    "id": 'maxStdCaseNum',
    "input": maxStdCaseNumInput,
    "description": '标准测试最大样例数',
    "default": 5
  },
  {
    "id": 'maxRanCaseNum',
    "input": maxRanCaseNumInput,
    "description": '随机测试最大样例数',
    "default": 5
  },
  {
    "id": 'maxMemCaseNum',
    "input": maxMemCaseNumInput,
    "description": '内存测试最大样例数',
    "default": 2
  }
];
function init() {
  showCRCheckBox.checked = localStorage.showCR;
  autoPolishCheckBox.checked = localStorage.autoPolish;
  // noValidationLoginCheckBox.checked = localStorage.noValidationLogin;
  for (var i in maxCaseNums)
    maxCaseNums[i].input.value = localStorage[maxCaseNums[i].id] || maxCaseNums[i]['default'];
}
init();
saveButton.addEventListener('click', function() {
  var saveCheckBox = function(checkBox, name) {
    if (checkBox.checked) localStorage[name] = true;
    else localStorage.removeItem(name);
  };
  saveCheckBox(showCRCheckBox, 'showCR'), saveCheckBox(autoPolishCheckBox, 'autoPolish');//, saveCheckBox(noValidationLoginCheckBox, 'noValidationLogin');
  
  function saveCaseNumber(Input, name, description) {
    if ((Input.value.match(/^(\d){1,2}$/)
        && 0 < parseInt(Input.value) && parseInt(Input.value) < 100)
      || (Input.value.match(/^(\d){3}$/) && parseInt(Input.value) == 100)) {
        localStorage[name] = Input.value
        return false;
    } else {
      savedSuccessfully.innerHTML = description + '应该是一个1到100的整数';
      return true;
    }
  };
  var errOccurred = false;
  for (var i in maxCaseNums) {
    if (!errOccurred) errOccurred |= saveCaseNumber(maxCaseNums[i].input, maxCaseNums[i].id, maxCaseNums[i].description);
  }
  if (errOccurred) return false;
  else return savedSuccessfully.innerHTML = "    保存成功", init();
}, false);
