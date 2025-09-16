import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsOfService from './TermsOfService';
import { 
  UserPlusIcon, 
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* 메인 로고 및 제목 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative ">
              <img 
                src="/logo.webp" 
                alt="MUNE Logo" 
                className="w-12 h-12 object-contain bg-white rounded-full"
              />
              <div className="absolute -inset-2 bg-white/20 rounded-full blur-md -z-10"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-blue-900 drop-shadow-sm tracking-tight">MUNE</h1>
            </div>
          </div>
          
          <p className="text-xl text-blue-800 font-medium mb-2">실시간 채팅 & 소통 플랫폼</p>
          <p className="text-gray-600 text-xs max-w-md mx-auto leading-relaxed">
            강의, 프레젠테이션, 이벤트에서 참여자분들과 실시간으로 소통하세요. 
          </p>
        </div>

        {/* 메인 액션 카드 */}
        <div className="max-w-sm mx-auto bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
          <div className="space-y-4">
            {/* 로그인 버튼 */}
            <button
              onClick={() => navigate('/signin')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center space-x-3 text-sm">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>기존 계정으로 로그인</span>
              </div>
            </button>

            {/* 회원가입 버튼 */}
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-white/80 backdrop-blur-sm hover:bg-white text-blue-700 font-semibold py-3 px-6 rounded-2xl border-2 border-blue-200/50 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-3 text-sm">
                <UserPlusIcon className="w-5 h-5" />
                <span>새 계정 만들기</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 크레딧 및 약관 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-blue-600/80 drop-shadow-sm mb-3">
          <span className="font-medium text-blue-700">라이프오브파이 Lab</span>
        </p>
        <div className="text-xs text-gray-500 space-x-1">
          <span>© 2025 MUNE</span>          
           
          <button
            onClick={() => setShowTerms(true)}
            className="hover:text-blue-600 hover:underline transition-colors"
          >
            이용약관 및 개인정보처리방침
          </button>
        </div>
      </div>

      {/* 약관 모달 */}
      <TermsOfService
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        showAgreeButton={false}
      />
    </div>
  );
};

export default WelcomeScreen;
