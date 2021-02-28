'use strict';

console.log('========================');
console.log('Shopee popup.js');
console.log('========================');

var analyzeButton = document.getElementById('js-analyze');
var resultElement = document.getElementById('js-result');
var loading = document.getElementById('js-loading');

function start() {

}

function starts() {
    loading.classList.remove('d-none');
    analyzeButton.setAttribute('disabled', '');

    chrome.runtime.sendMessage({ greeting: 'hello' }, function (response) {
        console.log(response);

        loading.classList.add('d-none');
        analyzeButton.removeAttribute('disabled');
        resultElement.replaceWith(JSON.stringify(response, null, 2));
    });
}

analyzeButton.addEventListener('click', starts);