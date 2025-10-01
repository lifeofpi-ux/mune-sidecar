import React from 'react';

/**
 * URL을 감지하는 정규표현식
 * http://, https://, www. 로 시작하는 URL을 감지
 */
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

/**
 * 텍스트에서 URL을 찾아 하이퍼링크로 변환하는 함수
 * @param text 변환할 텍스트
 * @returns JSX 요소 배열 (텍스트와 링크가 혼합)
 */
export const linkifyText = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // URL을 찾아서 처리
  text.replace(URL_REGEX, (match, offset) => {
    // URL 이전의 텍스트 추가
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }

    // URL을 링크로 변환
    let href = match;
    // www로 시작하는 경우 http://를 추가
    if (match.toLowerCase().startsWith('www.')) {
      href = 'http://' + match;
    }

    parts.push(
      <a
        key={`link-${offset}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all hover:opacity-70 transition-opacity"
        style={{ color: 'inherit' }}
        onClick={(e) => e.stopPropagation()} // 부모 요소의 클릭 이벤트 방지
      >
        {match}
      </a>
    );

    lastIndex = offset + match.length;
    return match;
  });

  // 마지막 URL 이후의 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // URL이 없는 경우 원본 텍스트 반환
  return parts.length === 0 ? [text] : parts;
};
