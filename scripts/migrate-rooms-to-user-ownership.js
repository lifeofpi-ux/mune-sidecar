/**
 * MUNE 채팅룸 데이터 마이그레이션 스크립트
 * 
 * 목적: 기존 채팅룸 데이터에 소유권 정보 추가
 * 실행 환경: Node.js
 * 
 * 사용법:
 * 1. Firebase Admin SDK 키 파일을 프로젝트 루트에 위치
 * 2. 환경 변수 설정: FIREBASE_SERVICE_ACCOUNT_KEY_PATH
 * 3. node scripts/migrate-rooms-to-user-ownership.js 실행
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK 초기화
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './firebase-admin-key.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase Admin SDK 키 파일을 찾을 수 없습니다:', serviceAccountPath);
  console.error('환경 변수 FIREBASE_SERVICE_ACCOUNT_KEY_PATH를 설정하거나 firebase-admin-key.json 파일을 생성하세요.');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * 마이그레이션 실행 함수
 */
async function migrateRoomsToUserOwnership() {
  console.log('🚀 MUNE 채팅룸 마이그레이션 시작...');
  
  try {
    // 1. 기존 채팅룸 데이터 조회
    console.log('📋 기존 채팅룸 데이터 조회 중...');
    const roomsSnapshot = await db.collection('rooms').get();
    
    if (roomsSnapshot.empty) {
      console.log('✅ 마이그레이션할 채팅룸이 없습니다.');
      return;
    }

    console.log(`📊 총 ${roomsSnapshot.size}개의 채팅룸을 발견했습니다.`);

    // 2. 마이그레이션이 필요한 룸 필터링
    const roomsToMigrate = [];
    const alreadyMigratedRooms = [];

    roomsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.ownerId) {
        roomsToMigrate.push({
          id: doc.id,
          ...data
        });
      } else {
        alreadyMigratedRooms.push({
          id: doc.id,
          ownerId: data.ownerId
        });
      }
    });

    console.log(`🔄 마이그레이션 필요: ${roomsToMigrate.length}개`);
    console.log(`✅ 이미 마이그레이션됨: ${alreadyMigratedRooms.length}개`);

    if (roomsToMigrate.length === 0) {
      console.log('✅ 모든 채팅룸이 이미 마이그레이션되었습니다.');
      return;
    }

    // 3. 기본 소유자 계정 생성 또는 확인
    console.log('👤 기본 소유자 계정 확인 중...');
    const defaultOwner = await createOrGetDefaultOwner();

    // 4. 배치 업데이트 실행
    console.log('🔄 채팅룸 데이터 업데이트 중...');
    const batch = db.batch();
    let updateCount = 0;

    roomsToMigrate.forEach(room => {
      const roomRef = db.collection('rooms').doc(room.id);
      
      // 소유권 정보 추가
      const updateData = {
        ownerId: defaultOwner.uid,
        ownerEmail: defaultOwner.email,
        ownerDisplayName: defaultOwner.displayName || room.adminName || '관리자',
        // 기존 adminName이 없는 경우 기본값 설정
        adminName: room.adminName || '관리자'
      };

      batch.update(roomRef, updateData);
      updateCount++;

      console.log(`  📝 ${room.name} (${room.id}) -> 소유자: ${defaultOwner.email}`);
    });

    // 5. 배치 커밋
    await batch.commit();
    console.log(`✅ ${updateCount}개 채팅룸 업데이트 완료`);

    // 6. 기본 소유자의 룸 카운트 업데이트
    const userRef = db.collection('users').doc(defaultOwner.uid);
    await userRef.update({
      roomCount: admin.firestore.FieldValue.increment(updateCount)
    });

    console.log(`📊 기본 소유자의 룸 카운트 업데이트: +${updateCount}`);

    // 7. 마이그레이션 완료 보고서
    console.log('\n📋 마이그레이션 완료 보고서');
    console.log('=====================================');
    console.log(`✅ 성공적으로 마이그레이션된 채팅룸: ${updateCount}개`);
    console.log(`👤 기본 소유자: ${defaultOwner.email} (${defaultOwner.uid})`);
    console.log(`📊 기존에 마이그레이션된 채팅룸: ${alreadyMigratedRooms.length}개`);
    console.log(`📈 총 채팅룸 수: ${roomsSnapshot.size}개`);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 기본 소유자 계정 생성 또는 조회
 */
async function createOrGetDefaultOwner() {
  const defaultEmail = 'admin@mune.system';
  const defaultPassword = 'MuneSystem2025!';
  const defaultDisplayName = 'MUNE 시스템 관리자';

  try {
    // 기존 사용자 확인
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(defaultEmail);
      console.log(`👤 기존 기본 소유자 계정 발견: ${defaultEmail}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 새 사용자 생성
        console.log('👤 기본 소유자 계정 생성 중...');
        userRecord = await admin.auth().createUser({
          email: defaultEmail,
          password: defaultPassword,
          displayName: defaultDisplayName,
          emailVerified: true
        });
        console.log(`✅ 기본 소유자 계정 생성 완료: ${defaultEmail}`);
      } else {
        throw error;
      }
    }

    // Firestore 사용자 문서 생성 또는 업데이트
    const userRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid: userRecord.uid,
        email: defaultEmail,
        displayName: defaultDisplayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        roomCount: 0
      });
      console.log('📄 기본 소유자 Firestore 문서 생성 완료');
    } else {
      console.log('📄 기본 소유자 Firestore 문서 이미 존재');
    }

    return {
      uid: userRecord.uid,
      email: defaultEmail,
      displayName: defaultDisplayName
    };

  } catch (error) {
    console.error('❌ 기본 소유자 계정 처리 중 오류:', error);
    throw error;
  }
}

/**
 * 마이그레이션 롤백 함수 (필요시 사용)
 */
async function rollbackMigration() {
  console.log('🔄 마이그레이션 롤백 시작...');
  
  try {
    const roomsSnapshot = await db.collection('rooms').get();
    const batch = db.batch();
    let rollbackCount = 0;

    roomsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.ownerId) {
        const roomRef = db.collection('rooms').doc(doc.id);
        batch.update(roomRef, {
          ownerId: admin.firestore.FieldValue.delete(),
          ownerEmail: admin.firestore.FieldValue.delete(),
          ownerDisplayName: admin.firestore.FieldValue.delete()
        });
        rollbackCount++;
      }
    });

    await batch.commit();
    console.log(`✅ ${rollbackCount}개 채팅룸 롤백 완료`);

  } catch (error) {
    console.error('❌ 롤백 중 오류 발생:', error);
    throw error;
  }
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    await rollbackMigration();
  } else {
    await migrateRoomsToUserOwnership();
  }
  
  console.log('🎉 작업 완료!');
  process.exit(0);
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 중 오류:', error);
    process.exit(1);
  });
}

module.exports = {
  migrateRoomsToUserOwnership,
  rollbackMigration
};
