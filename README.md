# MUNE (무네) - 강의 및 프레젠테이션용 실시간 채팅 사이드카

![MUNE Logo](./extension/icons/icon128.png)

MUNE는 강의나 프레젠테이션 중 실시간으로 청중과 소통할 수 있는 Chrome 확장 프로그램입니다. 강의자는 쉽게 채팅방을 생성하고 관리할 수 있으며, 참여자들은 간단한 링크로 채팅에 참여할 수 있습니다.

## 🚀 주요 기능

### 👨‍🏫 강의자용 기능
- **강의룸 생성 및 관리**: 간편한 강의룸 생성과 비밀번호 보호
- **실시간 채팅 모니터링**: 참여자들의 질문과 의견을 실시간으로 확인
- **설문조사 기능**: 객관식 투표 및 워드클라우드 생성
- **랜덤 추첨**: 참여자 중 랜덤으로 선정하는 기능
- **QR 코드 생성**: 참여 링크를 QR 코드로 공유

### 👥 참여자용 기능
- **간편 참여**: QR 코드나 링크로 쉽게 채팅방 입장
- **실시간 채팅**: 강의 중 질문이나 의견 실시간 전송
- **설문 참여**: 객관식 투표 및 워드클라우드 응답
- **닉네임 중복 방지**: 같은 방 내에서 중복 닉네임 자동 차단

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Vite** - 빌드 도구

### Backend & Database
- **Firebase Firestore** - 실시간 데이터베이스
- **Firebase Authentication** - 사용자 인증

### Chrome Extension
- **Manifest V3** - 최신 Chrome 확장 프로그램 표준
- **Side Panel API** - Chrome 사이드 패널 기능

### Additional Libraries
- **@heroicons/react** - 아이콘
- **@visx/wordcloud** - 워드클라우드 시각화
- **qrcode** - QR 코드 생성
- **react-router-dom** - 라우팅

## 📦 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/[your-username]/sidecar.git
cd sidecar
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
```

## 🔧 Chrome 확장 프로그램 설치

### 개발자 모드로 설치
1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우상단의 "개발자 모드" 토글 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 프로젝트의 `extension` 폴더 선택

### 확장 프로그램 사용
1. Chrome 툴바에서 MUNE 확장 프로그램 아이콘 클릭
2. 사이드 패널이 열리면서 강의룸 관리 화면 표시
3. 강의룸 생성 후 QR 코드로 참여자들과 공유

## 📱 사용 방법

### 강의자
1. **강의룸 생성**
   - 강의룸 이름 입력
   - 강의자 이름 입력
   - 관리자 비밀번호 설정

2. **참여자 초대**
   - 생성된 QR 코드를 화면에 표시
   - 또는 참여 링크를 공유

3. **실시간 소통**
   - 참여자들의 채팅 실시간 모니터링
   - 설문조사 생성 및 결과 확인
   - 랜덤 추첨으로 참여자 선정

### 참여자
1. **채팅방 입장**
   - QR 코드 스캔 또는 링크 클릭
   - 닉네임 입력 후 입장

2. **채팅 참여**
   - 질문이나 의견을 실시간으로 전송
   - 설문조사 참여
   - 워드클라우드 응답 작성

## 🔥 주요 특징

- **실시간 동기화**: Firebase를 통한 실시간 데이터 동기화
- **반응형 디자인**: 모바일과 데스크톱 모두 지원
- **사용자 친화적 UI**: 직관적이고 현대적인 인터페이스
- **안전한 관리**: 비밀번호 기반 강의룸 관리
- **확장성**: 대규모 참여자도 안정적으로 지원

## 🌐 배포

### 웹 애플리케이션
- **배포 URL**: `https://sidecar-nine.store`
- **호스팅**: Vercel/Netlify 등

### Chrome 웹 스토어
- Chrome 웹 스토어에서 "MUNE" 검색
- 또는 직접 설치 파일 다운로드

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👨‍💻 개발자

**@라이프오브파이** - 전체 개발 및 디자인

## 📞 지원 및 문의

- 이슈 및 버그 리포트: [GitHub Issues](https://github.com/[your-username]/sidecar/issues)
- 기능 요청: [GitHub Discussions](https://github.com/[your-username]/sidecar/discussions)

## 🎯 향후 계획

- [ ] 모바일 앱 버전 개발
- [ ] 다국어 지원
- [ ] 고급 분석 기능
- [ ] 녹화 및 재생 기능
- [ ] API 개방
- [ ] 플러그인 시스템

---

**MUNE**로 더 interactive한 강의와 프레젠테이션을 만들어보세요! 🚀 