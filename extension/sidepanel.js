// 설정
const CHAT_SITE_URL = 'https://sidecar-nine.store';
const IFRAME_LOAD_TIMEOUT = 10000; // 10초

// DOM 요소들
let elements = {};

// 상태 관리
let currentUrl = CHAT_SITE_URL;
let loadTimeout = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    loadChatSite();
    
    // 백그라운드 스크립트에 준비 완료 알림
    chrome.runtime.sendMessage({ type: 'PANEL_READY' }, (response) => {
        console.log('백그라운드 스크립트 응답:', response);
    });
});

// DOM 요소 초기화
function initializeElements() {
    elements = {
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        errorMessage: document.getElementById('error-message'),
        iframe: document.getElementById('chat-iframe'),
        retryBtn: document.getElementById('retry-btn'),
        directLinkBtn: document.getElementById('direct-link-btn')
    };
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 재시도 버튼
    elements.retryBtn.addEventListener('click', () => {
        console.log('재시도 버튼 클릭');
        loadChatSite();
    });
    
    // 새 탭에서 열기 버튼
    elements.directLinkBtn.addEventListener('click', () => {
        console.log('새 탭에서 열기 버튼 클릭');
        chrome.tabs.create({ url: currentUrl });
    });
    
    // iframe 로드 이벤트
    elements.iframe.addEventListener('load', handleIframeLoad);
    elements.iframe.addEventListener('error', handleIframeError);
}

// 채팅 사이트 로드
function loadChatSite() {
    console.log('채팅 사이트 로드 시작:', currentUrl);
    
    // 이전 타임아웃 클리어
    if (loadTimeout) {
        clearTimeout(loadTimeout);
    }
    
    // UI 상태 변경
    showLoading();
    
    // iframe src 설정
    elements.iframe.src = currentUrl;
    
    // 로드 타임아웃 설정
    loadTimeout = setTimeout(() => {
        console.log('iframe 로드 타임아웃');
        showError('연결 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.');
    }, IFRAME_LOAD_TIMEOUT);
}

// iframe 로드 성공 처리
function handleIframeLoad() {
    console.log('iframe 로드 완료');
    
    if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
    }
    
    // iframe이 실제로 콘텐츠를 로드했는지 확인
    try {
        const iframeDoc = elements.iframe.contentDocument || elements.iframe.contentWindow.document;
        if (iframeDoc && iframeDoc.readyState === 'complete') {
            showIframe();
        } else {
            // 약간의 지연 후 다시 확인
            setTimeout(() => {
                if (elements.iframe.src) {
                    showIframe();
                }
            }, 500);
        }
    } catch (error) {
        // Cross-origin 제한으로 인한 오류는 정상적인 로드로 간주
        console.log('Cross-origin 제한 (정상):', error.message);
        showIframe();
    }
}

// iframe 로드 오류 처리
function handleIframeError() {
    console.log('iframe 로드 오류');
    
    if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
    }
    
    showError('채팅 사이트에 연결할 수 없습니다. 사이트가 실행 중인지 확인해주세요.');
}

// 로딩 화면 표시
function showLoading() {
    elements.loading.style.display = 'flex';
    elements.error.style.display = 'none';
    elements.iframe.style.display = 'none';
}

// 오류 화면 표시
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.loading.style.display = 'none';
    elements.error.style.display = 'flex';
    elements.iframe.style.display = 'none';
}

// iframe 표시
function showIframe() {
    elements.loading.style.display = 'none';
    elements.error.style.display = 'none';
    elements.iframe.style.display = 'block';
}

// URL 변경 감지 (iframe 내부 네비게이션)
function detectUrlChange() {
    try {
        const iframeUrl = elements.iframe.contentWindow.location.href;
        if (iframeUrl !== currentUrl) {
            currentUrl = iframeUrl;
            console.log('URL 변경 감지:', currentUrl);
        }
    } catch (error) {
        // Cross-origin 제한으로 인한 오류는 무시
    }
}

// 주기적으로 URL 변경 감지 (Cross-origin 제한으로 인해 제한적)
setInterval(detectUrlChange, 1000);

// 메시지 리스너 (백그라운드 스크립트와 통신)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('사이드 패널에서 메시지 수신:', message);
    
    switch (message.type) {
        case 'RELOAD_CHAT':
            loadChatSite();
            sendResponse({ status: 'success' });
            break;
            
        case 'CHANGE_URL':
            if (message.url) {
                currentUrl = message.url;
                loadChatSite();
                sendResponse({ status: 'success' });
            } else {
                sendResponse({ status: 'error', message: 'URL이 제공되지 않았습니다.' });
            }
            break;
            
        default:
            sendResponse({ status: 'unknown_message_type' });
    }
});

// 오류 처리
window.addEventListener('error', (event) => {
    console.error('사이드 패널 오류:', event.error);
});

// 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (loadTimeout) {
        clearTimeout(loadTimeout);
    }
}); 