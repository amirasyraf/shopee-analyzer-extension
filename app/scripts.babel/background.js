'use strict';

const shopeeUrl = new URL('https://shopee.com.my');
const appUrl = new URL('https://shopee.amirasyraf.dev');

var respond;
var currentUrl;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        respond = sendResponse;

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
            let url = tabs[0].url;
            let hostname = new URL(url);

            if (hostname === shopeeUrl.hostname) {
                currentUrl = url;
                checkLoggedIn();
            }
            else {
                chrome.tabs.update({ url: shopeeUrl.href });
            }
        });

        return true;
    }
);

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (chrome.extension.getViews({ type: 'popup' }).length) {
        if (info.status === 'complete') {
            let url = new URL(tab.url);
            
            if (url.hostname === appUrl.hostname)
                return;

            currentUrl = tab.url;
            checkLoggedIn();
        }
    }
});

function checkLoggedIn() {
    fetch('https://shopee.com.my/api/v4/notification/get_activities?limit=5', {
        'headers': {
            'accept': '*/*',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,id;q=0.7,my;q=0.6',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-api-source': 'pc',
            'x-requested-with': 'XMLHttpRequest',
            'x-shopee-language': 'en'
        },
        'referrer': 'https://shopee.com.my/',
        'referrerPolicy': 'strict-origin-when-cross-origin',
        'body': null,
        'method': 'GET',
        'mode': 'cors',
        'credentials': 'include'
    })
        .then(result => result.json())
        .then(data => {
            if (parseInt(data.error) === 19) {
                if (currentUrl !== 'https://shopee.com.my/buyer/login') {
                    chrome.tabs.update({ url: 'https://shopee.com.my/buyer/login' });
                }

                respond({
                    status: 'fail',
                    message: 'Invalid Authentication Data - Please login to your Shopee account. If you have already logged in, please logout and login again.',
                    data: data
                });
            }
            else {
                sendToHost();
            }
        });
}

function sendToHost() {
    chrome.cookies.get({ name: 'SPC_SI', url: shopeeUrl.href }, function (cookie) {
        chrome.tabs.update({ url: `${appUrl.href}?authKey=${cookie.value}` });

        respond({
            status: 'success',
            message: 'Process Successful',
        });
    });
}