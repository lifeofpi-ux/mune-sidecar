import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

interface SignUpProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup(email, password, displayName);
      onSuccess();
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('이미 사용 중인 이메일입니다.');
          break;
        case 'auth/invalid-email':
          setError('올바른 이메일 주소를 입력해주세요.');
          break;
        case 'auth/weak-password':
          setError('비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.');
          break;
        default:
          setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };


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
          <p className="text-blue-700 font-medium">회원가입</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
              <div className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>이름</span>
              </div>
            </label>
            <div className="relative">
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="표시될 이름을 입력하세요"
                required
                maxLength={20}
              />
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
              <div className="flex items-center space-x-1">
                <EnvelopeIcon className="w-4 h-4" />
                <span>이메일</span>
              </div>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="이메일을 입력하세요"
                required
              />
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
              <div className="flex items-center space-x-1">
                <LockClosedIcon className="w-4 h-4" />
                <span>비밀번호</span>
              </div>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="비밀번호를 입력하세요 (최소 6자)"
                required
                minLength={6}
              />
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
              <div className="flex items-center space-x-1">
                <LockClosedIcon className="w-4 h-4" />
                <span>비밀번호 확인</span>
              </div>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
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
            <div className="flex items-center justify-center space-x-2">
              <UserPlusIcon className="w-5 h-5" />
              <span>{loading ? '회원가입 중...' : '회원가입'}</span>
            </div>
          </button>
        </form>


        <div className="mt-6 text-center">
          <p className="text-blue-600">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-800 font-medium hover:underline"
            >
              로그인하기
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

export default SignUp;
