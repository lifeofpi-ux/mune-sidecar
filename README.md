# Sidecar - 실시간 강의 채팅 및 설문조사 플랫폼

실시간 채팅과 설문조사 기능을 제공하는 강의용 웹 애플리케이션입니다.

## 주요 기능

- 🎯 **실시간 채팅**: 강의자와 참여자 간 실시간 소통
- 📊 **객관식 설문조사**: 실시간 투표 및 결과 시각화
- ☁️ **워드클라우드**: 자유 응답을 워드클라우드로 시각화
- 📱 **QR 코드**: 간편한 참여자 입장
- 👨‍🏫 **관리자 기능**: 설문조사 생성 및 관리
- 📱 **반응형 디자인**: 모바일 및 데스크톱 지원

## 기술 스택

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore (실시간 데이터베이스)
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Libraries**: 
  - React Router (라우팅)
  - Heroicons (아이콘)
  - React WordCloud (워드클라우드)
  - React QR Code (QR 코드 생성)

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd sidecar
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 Firebase 설정을 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일에 다음 값들을 설정하세요:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 프로덕션 빌드
```bash
npm run build
```

## Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화
3. 웹 앱 추가 및 설정 정보 복사
4. `.env` 파일에 설정 정보 입력

### Firestore 보안 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 배포

### Vercel 배포
1. Vercel 계정 생성 및 GitHub 연동
2. 프로젝트 import
3. 환경 변수 설정 (Vercel 대시보드에서)
4. 자동 배포 완료

### 환경 변수 설정 (Vercel)
Vercel 대시보드 → Settings → Environment Variables에서 다음 변수들을 추가:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 사용 방법

### 강의자 (관리자)
1. 메인 페이지에서 "강의자 로그인" 선택
2. 강의룸 생성 또는 기존 강의룸 관리
3. QR 코드를 통해 참여자 초대
4. 실시간으로 설문조사 생성 및 관리

### 참여자
1. QR 코드 스캔 또는 링크 접속
2. 이름 입력 후 강의룸 입장
3. 실시간 채팅 참여
4. 설문조사 및 워드클라우드 응답

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── AdminLogin.tsx   # 관리자 로그인
│   ├── ChatRoom.tsx     # 채팅룸 메인
│   ├── PollCard.tsx     # 설문조사 카드
│   ├── PollModal.tsx    # 설문조사 생성 모달
│   ├── QRCodeGenerator.tsx # QR 코드 생성
│   ├── UserLogin.tsx    # 사용자 로그인
│   └── WordCloud.tsx    # 워드클라우드
├── hooks/               # Custom Hooks
│   └── useChat.ts       # 채팅 관련 로직
├── types/               # TypeScript 타입 정의
│   └── index.ts
├── firebase.ts          # Firebase 설정
└── App.tsx             # 메인 앱 컴포넌트
```

## 라이선스

ISC License 