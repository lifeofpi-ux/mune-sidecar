import React from 'react';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
  showAgreeButton?: boolean;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({
  isOpen,
  onClose,
  onAgree,
  showAgreeButton = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAgree = () => {
    if (onAgree) {
      onAgree();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="modern-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">이용약관 및 개인정보처리방침</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-8 text-sm leading-relaxed">
          {/* 이용약관 */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">제1조 이용약관</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">1. 서비스 개요</h4>
                <p className="text-gray-600 pl-4">
                  MUNE는 실시간 채팅 및 커뮤니케이션 플랫폼을 제공하는 서비스입니다.
                  사용자는 채팅방을 생성하거나 참여하여 다른 사용자들과 소통할 수 있습니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">2. 서비스 이용 조건</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• 사용자는 만 14세 이상이어야 합니다.</li>
                  <li>• 허위 정보를 제공하거나 타인의 정보를 도용해서는 안 됩니다.</li>
                  <li>• 서비스를 불법적이거나 부적절한 목적으로 사용해서는 안 됩니다.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">3. 사용자의 의무 및 책임</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• 사용자는 서비스 이용 시 발생하는 모든 행위에 대해 전적인 책임을 집니다.</li>
                  <li>• 타인의 권리를 침해하거나 명예를 훼손하는 행위를 금지합니다.</li>
                  <li>• 음란물, 폭력적 내용, 불법 정보 등의 게시를 금지합니다.</li>
                  <li>• 서비스의 안정적 운영을 방해하는 행위를 금지합니다.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">4. 서비스 제공자의 면책</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• 서비스는 "있는 그대로" 제공되며, 특정 목적에 대한 적합성을 보장하지 않습니다.</li>
                  <li>• 사용자 간의 분쟁이나 거래에 대해 책임지지 않습니다.</li>
                  <li>• 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
                  <li>• 사용자가 게시한 내용으로 인한 모든 법적 책임은 해당 사용자에게 있습니다.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">5. 서비스 이용 제한</h4>
                <p className="text-gray-600 pl-4">
                  약관 위반, 불법 행위, 서비스 운영 방해 등의 경우 사전 통지 없이
                  서비스 이용을 제한하거나 계정을 정지할 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 개인정보처리방침 */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">제2조 개인정보처리방침</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">1. 수집하는 개인정보 항목</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• <strong>필수항목:</strong> 이메일 주소, 사용자명(닉네임)</li>
                  <li>• <strong>자동 수집:</strong> 서비스 이용 기록, 접속 로그, 쿠키</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">2. 개인정보 수집 및 이용 목적</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• 회원가입 및 본인확인</li>
                  <li>• 서비스 제공 및 운영</li>
                  <li>• 사용자 식별 및 채팅방 관리</li>
                  <li>• 서비스 개선 및 통계 분석</li>
                  <li>• 고객 문의 응대</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">3. 개인정보 보유 및 이용 기간</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• 회원탈퇴 시까지 (탈퇴 즉시 삭제)</li>
                  <li>• 법령에 의해 보존이 필요한 경우 해당 기간까지</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">4. 개인정보 제3자 제공</h4>
                <p className="text-gray-600 pl-4">
                  수집된 개인정보는 원칙적으로 제3자에게 제공하지 않습니다.
                  다만, 법령의 규정에 의거하거나 수사기관의 요구가 있는 경우 예외로 합니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">5. 개인정보 처리 위탁</h4>
                <p className="text-gray-600 pl-4">
                  서비스 운영을 위해 다음과 같은 업체에 개인정보 처리를 위탁합니다:
                </p>
                <ul className="text-gray-600 pl-4 mt-2 space-y-1">
                  <li>• <strong>Firebase (Google):</strong> 사용자 인증, 데이터베이스 관리</li>
                  <li>• <strong>Vercel:</strong> 웹 호스팅 서비스</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">6. 개인정보 보호 조치</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• 개인정보는 암호화하여 저장 및 전송됩니다</li>
                  <li>• 접근 권한을 최소한으로 제한합니다</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">7. 사용자의 권리</h4>
                <ul className="text-gray-600 pl-4 space-y-1">
                  <li>• 개인정보 열람, 정정, 삭제를 요구할 수 있습니다</li>
                  <li>• 개인정보 처리 정지를 요구할 수 있습니다</li>
                  <li>• 언제든지 회원탈퇴를 통해 개인정보 삭제를 요구할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 기타 조항 */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">제3조 기타</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">1. 약관의 변경</h4>
                <p className="text-gray-600 pl-4">
                  본 약관은 관련 법령의 변경이나 서비스 정책의 변경에 따라 수정될 수 있으며,
                  변경 시 서비스 내 공지사항을 통해 안내합니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">2. 문의처</h4>
                <p className="text-gray-600 pl-4">
                  개인정보 처리에 관한 문의사항이나 서비스 관련 문의는 indend007@gmail.com 를 통해 연락해 주시기 바랍니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">3. 시행일</h4>
                <p className="text-gray-600 pl-4">
                  본 약관은 2025년 9월 16일부터 시행됩니다.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-gray-500 text-xs">
              © 2025 MUNE. 제작: ©VIVAMUNE
            </p>
          </div>
        </div>

        {showAgreeButton && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="modern-btn modern-btn-secondary px-8 py-3"
            >
              취소
            </button>
            <button
              onClick={handleAgree}
              className="modern-btn modern-btn-primary px-8 py-3"
            >
              동의합니다
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsOfService;
