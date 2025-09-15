# MUNE Firebase Authentication 마이그레이션 PRD

## 📋 프로젝트 개요

### 목표
기존 MUNE 서비스를 Firebase Authentication 기반의 회원 관리 시스템으로 전환하여, 사용자가 본인의 채팅룸을 체계적으로 관리할 수 있는 구조로 개선

### 핵심 원칙
- **기존 기능 100% 유지**: 모든 채팅, 설문조사, 랜덤추첨 등 기능 그대로 보존
- **최소한의 변경**: 코드 구조와 UI/UX는 최대한 기존 형태 유지
- **회원 기반 관리**: 채팅룸 생성/관리를 로그인한 회원 기준으로 전환

## 🎯 주요 변경사항

### 1. 인증 시스템 도입
- **기존**: 임시 비밀번호 기반 관리
- **변경**: Firebase Authentication (이메일/비밀번호)
- **추가 기능**: 회원가입, 로그인, 로그아웃, 비밀번호 재설정

### 2. 채팅룸 소유권 관리
- **기존**: 임시 세션 기반
- **변경**: 사용자 UID 기반 소유권
- **추가 기능**: 본인 채팅룸만 관리 가능

### 3. 데이터 구조 변경
```javascript
// 기존 채팅룸 구조
{
  id: "room_id",
  name: "강의룸 이름",
  adminName: "강의자 이름",
  adminPassword: "해시된 비밀번호",
  createdAt: timestamp,
  isActive: boolean
}

// 변경된 채팅룸 구조
{
  id: "room_id",
  name: "강의룸 이름",
  adminName: "강의자 이름",
  adminPassword: "해시된 비밀번호", // 기존 기능 호환성 유지
  ownerId: "user_uid", // 새로 추가
  ownerEmail: "user@email.com", // 새로 추가
  createdAt: timestamp,
  isActive: boolean
}
```

## 🔄 마이그레이션 단계

### Phase 1: 인증 시스템 구축
1. Firebase Authentication 설정
2. 사용자 타입 및 인터페이스 업데이트
3. 회원가입/로그인 컴포넌트 구현
4. 인증 상태 관리 시스템 구축

### Phase 2: 채팅룸 관리 시스템 전환
1. 채팅룸 데이터 구조 업데이트
2. 소유권 기반 CRUD 작업 구현
3. AdminLogin 컴포넌트 회원 시스템 연동
4. 권한 검증 로직 추가

### Phase 3: 데이터 마이그레이션
1. 기존 채팅룸 데이터 백업
2. 새로운 구조로 데이터 변환
3. 마이그레이션 스크립트 실행
4. 데이터 무결성 검증

### Phase 4: 테스트 및 배포
1. 전체 기능 테스트
2. 기존 기능 호환성 검증
3. 사용자 시나리오 테스트
4. 프로덕션 배포

## 🏗️ 기술 구현 계획

### 1. 새로운 컴포넌트
- `AuthProvider.tsx`: 인증 상태 관리
- `SignUp.tsx`: 회원가입 폼
- `SignIn.tsx`: 로그인 폼
- `UserProfile.tsx`: 사용자 프로필 관리

### 2. 수정할 기존 컴포넌트
- `AdminLogin.tsx`: 회원 시스템 연동
- `App.tsx`: 인증 라우팅 추가
- Firebase 설정 파일 업데이트

### 3. 새로운 훅스
- `useAuth.ts`: 인증 상태 및 메서드 관리
- `useUserRooms.ts`: 사용자 채팅룸 관리

## 📊 데이터베이스 스키마

### Users Collection (새로 추가)
```javascript
users/{userId} {
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  lastLoginAt: timestamp,
  roomCount: number // 생성한 채팅룸 수
}
```

### Rooms Collection (기존 + 확장)
```javascript
rooms/{roomId} {
  // 기존 필드 유지
  id: string,
  name: string,
  adminName: string,
  adminPassword: string,
  createdAt: timestamp,
  isActive: boolean,
  
  // 새로 추가되는 필드
  ownerId: string, // 사용자 UID
  ownerEmail: string, // 사용자 이메일
  ownerDisplayName: string // 사용자 표시명
}
```

## 🔒 보안 고려사항

### 1. Firestore 보안 규칙
```javascript
// 채팅룸: 소유자만 수정/삭제 가능
match /rooms/{roomId} {
  allow read: if true; // 모든 사용자 읽기 가능 (참여자를 위해)
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.ownerId;
  allow update, delete: if request.auth != null && 
    request.auth.uid == resource.data.ownerId;
}

// 메시지: 기존 규칙 유지
match /rooms/{roomId}/messages/{messageId} {
  allow read, write: if true;
}
```

### 2. 기존 비밀번호 시스템 유지
- 참여자 입장 시 기존 비밀번호 검증 로직 그대로 유지
- 회원 시스템은 관리자(채팅룸 소유자)에게만 적용

## 🎨 UI/UX 변경사항

### 1. 로그인 화면
- 기존 "뮨 인증 키워드" 입력 → 회원 로그인/회원가입 선택
- 로그인 후 기존 관리자 화면과 동일한 인터페이스 제공

### 2. 채팅룸 관리
- "내 채팅룸" 탭에서 본인이 생성한 채팅룸만 표시
- 다른 사용자의 채팅룸은 접근/수정 불가

### 3. 사용자 프로필
- 간단한 프로필 정보 표시
- 로그아웃 기능 추가

## 📈 성공 지표

### 기능적 지표
- [ ] 기존 모든 기능 정상 작동
- [ ] 회원가입/로그인 플로우 완성
- [ ] 채팅룸 소유권 기반 관리 구현
- [ ] 데이터 마이그레이션 무결성 100%

### 사용자 경험 지표
- [ ] 기존 사용자 워크플로우 변경 최소화
- [ ] 새로운 기능 학습 곡선 최소화
- [ ] 로딩 시간 기존 대비 동일 수준 유지

## 🚀 배포 계획

### 1. 개발 환경 테스트
- 로컬 Firebase Emulator 사용
- 모든 기능 검증 완료

### 2. 스테이징 배포
- 테스트용 Firebase 프로젝트 사용
- 베타 테스터 피드백 수집

### 3. 프로덕션 배포
- 점진적 롤아웃 (Canary 배포)
- 모니터링 및 롤백 계획 준비

## 📋 체크리스트

### 개발 단계
- [ ] Firebase Authentication 설정
- [ ] 사용자 인터페이스 업데이트
- [ ] 인증 컴포넌트 구현
- [ ] 채팅룸 소유권 시스템 구현
- [ ] 보안 규칙 설정

### 테스트 단계
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 실행
- [ ] 사용자 시나리오 테스트
- [ ] 성능 테스트

### 배포 단계
- [ ] 마이그레이션 스크립트 실행
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] 문서 업데이트

---

**작성일**: 2025년 9월 15일  
**작성자**: AI Assistant  
**버전**: 1.0  
**상태**: 승인 대기
