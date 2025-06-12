// 확장 프로그램 설치 시 실행
chrome.runtime.onInstalled.addListener(() => {
  console.log('MUNE 사이드패널 확장 프로그램이 설치되었습니다.');
  
  // 액션 버튼 클릭 시 사이드 패널 열기 설정
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('사이드 패널 설정 오류:', error));
});

// 액션 버튼 클릭 이벤트 (추가 제어가 필요한 경우)
chrome.action.onClicked.addListener((tab) => {
  console.log('액션 버튼이 클릭되었습니다.');
  
  // 현재 탭에서 사이드 패널 열기
  chrome.sidePanel.open({ tabId: tab.id })
    .then(() => {
      console.log('사이드 패널이 열렸습니다.');
    })
    .catch((error) => {
      console.error('사이드 패널 열기 오류:', error);
    });
});

// 탭 업데이트 이벤트 리스너 (필요시 특정 사이트에서만 활성화)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('탭이 업데이트되었습니다:', tab.url);
    
    // 모든 사이트에서 사이드 패널 활성화
    try {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true
      });
    } catch (error) {
      console.error('사이드 패널 옵션 설정 오류:', error);
    }
  }
});

// 메시지 리스너 (사이드 패널과 통신)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('메시지 수신:', message);
  
  switch (message.type) {
    case 'PANEL_READY':
      console.log('사이드 패널이 준비되었습니다.');
      sendResponse({ status: 'success' });
      break;
      
    case 'GET_CURRENT_TAB':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ tab: tabs[0] });
      });
      return true; // 비동기 응답을 위해 true 반환
      
    default:
      console.log('알 수 없는 메시지 타입:', message.type);
      sendResponse({ status: 'unknown_message_type' });
  }
}); 