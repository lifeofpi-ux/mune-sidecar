import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SignInProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const { login, signInWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      onSuccess();
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('존재하지 않는 이메일입니다.');
          break;
        case 'auth/wrong-password':
          setError('잘못된 비밀번호입니다.');
          break;
        case 'auth/invalid-email':
          setError('올바른 이메일 주소를 입력해주세요.');
          break;
        case 'auth/too-many-requests':
          setError('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
          break;
        default:
          setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      await resetPassword(resetEmail);
      setResetMessage('비밀번호 재설정 이메일을 전송했습니다. 이메일을 확인해주세요.');
      setError('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('존재하지 않는 이메일입니다.');
          break;
        case 'auth/invalid-email':
          setError('올바른 이메일 주소를 입력해주세요.');
          break;
        default:
          setError('비밀번호 재설정 중 오류가 발생했습니다.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      onSuccess();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('구글 로그인이 취소되었습니다.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');
      } else {
        setError('구글 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="p-8 w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-5">
              <img 
                src="/logo.webp" 
                alt="MUNE Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-3xl font-bold text-blue-900 drop-shadow-sm">MUNE</h1>
            </div>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                이메일
              </label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="등록된 이메일을 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100/80 backdrop-blur-sm border border-red-300/50 rounded-md p-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-100/80 backdrop-blur-sm border border-green-300/50 rounded-md p-3">
                <p className="text-sm text-green-700 font-medium">{resetMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full modern-btn modern-btn-primary py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                비밀번호 재설정 이메일 전송
              </button>
              
              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="w-full modern-btn modern-btn-secondary py-2 bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/logo.webp" 
              alt="MUNE Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-3xl font-bold text-blue-900 drop-shadow-sm">MUNE</h1>
          </div>
          <p className="text-blue-500/80 text-xs font-bold">강의자를 위한 실시간 소통 플랫폼 "뮨"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100/80 backdrop-blur-sm border border-red-300/50 rounded-md p-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

            <button
              type="submit"
              disabled={loading}
              className="w-full modern-btn modern-btn-primary py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-200/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">또는</span>
            </div>
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-2 px-4 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Google로 로그인</span>
          </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowResetPassword(true)}
            className="text-blue-600 text-sm hover:underline"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-blue-600">
            아직 계정이 없으신가요?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-800 font-medium hover:underline"
            >
              회원가입하기
            </button>
          </p>
        </div>
      </div>
      
      {/* 크레딧 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-blue-600/80 text-center drop-shadow-sm">
          제작 <span className="font-medium text-blue-700">@라이프오브파이</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
