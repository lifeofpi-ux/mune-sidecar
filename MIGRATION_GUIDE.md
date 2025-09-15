# MUNE Firebase Authentication 마이그레이션 가이드

## 📋 개요

이 가이드는 MUNE 서비스를 기존 임시 인증 시스템에서 Firebase Authentication 기반의 회원 관리 시스템으로 마이그레이션하는 과정을 안내합니다.

## 🎯 마이그레이션 목표

- ✅ 기존 모든 기능 100% 보존
- ✅ Firebase Auth 기반 회원 시스템 도입
- ✅ 채팅룸 소유권 관리 시스템 구축
- ✅ 기존 사용자 경험 최소한의 변경

## 🚀 마이그레이션 단계

### Phase 1: 사전 준비

#### 1.1 Firebase 프로젝트 설정 확인
```bash
# Firebase CLI 설치 (미설치시)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 연결 확인
firebase projects:list
```

#### 1.2 환경 변수 확인
`.env` 파일에 다음 변수들이 설정되어 있는지 확인:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Phase 2: 코드 배포

#### 2.1 의존성 설치
```bash
npm install
```

#### 2.2 빌드 및 테스트
```bash
# 개발 서버 테스트
npm run dev

# 프로덕션 빌드
npm run build
```

#### 2.3 Firestore 보안 규칙 업데이트
```bash
# 보안 규칙 배포
firebase deploy --only firestore:rules
```

### Phase 3: 데이터 마이그레이션

#### 3.1 Firebase Admin SDK 설정
1. Firebase Console > 프로젝트 설정 > 서비스 계정
2. "새 비공개 키 생성" 클릭
3. 다운로드한 JSON 파일을 `firebase-admin-key.json`으로 프로젝트 루트에 저장

#### 3.2 마이그레이션 스크립트 실행
```bash
# 마이그레이션 실행
node scripts/migrate-rooms-to-user-ownership.js

# 롤백이 필요한 경우
node scripts/migrate-rooms-to-user-ownership.js --rollback
```

#### 3.3 마이그레이션 결과 확인
- Firebase Console에서 `users` 컬렉션 생성 확인
- `rooms` 컬렉션에 `ownerId`, `ownerEmail`, `ownerDisplayName` 필드 추가 확인
- 기본 관리자 계정 생성 확인 (`admin@mune.system`)

### Phase 4: 프로덕션 배포

#### 4.1 애플리케이션 배포
```bash
# Vercel 배포
vercel --prod

# 또는 기존 배포 방식 사용
npm run build
# 빌드 결과물을 호스팅 서비스에 업로드
```

#### 4.2 배포 후 검증
1. **기존 기능 테스트**
   - 임시 인증 키워드로 로그인 가능한지 확인
   - 채팅룸 생성/삭제 정상 작동 확인
   - 채팅, 설문조사, 랜덤추첨 기능 확인

2. **새 기능 테스트**
   - 회원가입/로그인 기능 확인
   - 회원 기반 채팅룸 관리 확인
   - 소유권 기반 권한 제어 확인

## 🔄 사용자 전환 가이드

### 기존 사용자 (임시 인증 시스템)
1. 기존 방식으로 계속 사용 가능
2. 홈페이지에서 "새로운 회원 시스템" 안내 확인
3. 원하는 시점에 회원가입 후 새 시스템 사용

### 신규 사용자 (회원 시스템)
1. 홈페이지에서 "회원가입" 버튼 클릭
2. 이메일/비밀번호로 계정 생성
3. 로그인 후 본인만의 채팅룸 관리

## 📊 마이그레이션 체크리스트

### 사전 준비
- [ ] Firebase 프로젝트 설정 확인
- [ ] 환경 변수 설정 완료
- [ ] Firebase Admin SDK 키 파일 준비
- [ ] 기존 데이터 백업 완료

### 코드 배포
- [ ] 새로운 컴포넌트들 정상 작동 확인
- [ ] 기존 컴포넌트 호환성 확인
- [ ] Firestore 보안 규칙 업데이트
- [ ] 빌드 오류 없음 확인

### 데이터 마이그레이션
- [ ] 마이그레이션 스크립트 실행 완료
- [ ] `users` 컬렉션 생성 확인
- [ ] `rooms` 컬렉션 소유권 필드 추가 확인
- [ ] 기본 관리자 계정 생성 확인

### 프로덕션 배포
- [ ] 애플리케이션 배포 완료
- [ ] 기존 기능 정상 작동 확인
- [ ] 새 회원 시스템 정상 작동 확인
- [ ] 사용자 안내 문구 표시 확인

### 사후 관리
- [ ] 사용자 피드백 수집 체계 구축
- [ ] 마이그레이션 통계 모니터링
- [ ] 롤백 계획 수립

## 🚨 주의사항

### 데이터 안전성
1. **마이그레이션 전 반드시 데이터 백업 실행**
2. **테스트 환경에서 먼저 마이그레이션 테스트**
3. **롤백 계획 수립 후 진행**

### 사용자 경험
1. **기존 사용자가 혼란스러워하지 않도록 점진적 전환**
2. **새 기능에 대한 명확한 안내 제공**
3. **기존 워크플로우 최대한 보존**

### 보안
1. **Firebase Admin SDK 키 파일 보안 관리**
2. **환경 변수 안전한 저장**
3. **Firestore 보안 규칙 철저한 검토**

## 🔧 트러블슈팅

### 일반적인 문제들

#### 1. Firebase 인증 오류
```
Error: Firebase configuration is invalid
```
**해결책**: 환경 변수 설정 확인 및 Firebase 프로젝트 설정 재검토

#### 2. 마이그레이션 스크립트 오류
```
Error: Firebase Admin SDK key file not found
```
**해결책**: `firebase-admin-key.json` 파일 경로 확인

#### 3. Firestore 권한 오류
```
Error: Missing or insufficient permissions
```
**해결책**: Firestore 보안 규칙 업데이트 및 배포

#### 4. 빌드 오류
```
Error: Module not found
```
**해결책**: `npm install` 재실행 및 의존성 확인

### 롤백 절차

마이그레이션에 문제가 발생한 경우:

1. **데이터 롤백**
   ```bash
   node scripts/migrate-rooms-to-user-ownership.js --rollback
   ```

2. **코드 롤백**
   ```bash
   git revert <commit-hash>
   npm run build
   # 이전 버전 재배포
   ```

3. **Firestore 규칙 롤백**
   ```bash
   # 이전 규칙으로 복원
   firebase deploy --only firestore:rules
   ```

## 📞 지원

마이그레이션 과정에서 문제가 발생하면:

1. **로그 확인**: 브라우저 개발자 도구 콘솔 및 Firebase Console 로그
2. **문서 참조**: [Firebase Auth 공식 문서](https://firebase.google.com/docs/auth)
3. **이슈 리포트**: GitHub Issues에 상세한 오류 정보와 함께 문의

## 📈 성공 지표

마이그레이션 성공 확인:

- ✅ 기존 모든 기능 정상 작동 (100%)
- ✅ 새 회원 시스템 정상 작동
- ✅ 데이터 무결성 유지 (0% 손실)
- ✅ 사용자 불편 최소화
- ✅ 보안 강화 완료

---

**마이그레이션 완료 후 이 문서를 참조하여 향후 유지보수에 활용하시기 바랍니다.**
