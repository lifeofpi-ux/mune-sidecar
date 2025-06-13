import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Wordcloud } from '@visx/wordcloud';
import { scaleOrdinal } from '@visx/scale';
import { Text } from '@visx/text';
import './WordCloud.css';

interface WordCloudProps {
  responses: string[];
  width?: number;
  height?: number;
}

interface WordData {
  text: string;
  value: number;
}

const colors = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9'
];

const WordCloud: React.FC<WordCloudProps> = ({ responses, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const [animationKey, setAnimationKey] = useState(0);
  const prevWordsRef = useRef<WordData[]>([]);
  const [tooltip, setTooltip] = useState<{ text: string; count: number; x: number; y: number } | null>(null);

  // 컨테이너 크기에 맞춰 동적으로 크기 조정
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // 패딩을 고려하여 실제 사용 가능한 크기 계산
        const availableWidth = Math.max(containerWidth - 32, 200); // 최소 200px
        const availableHeight = Math.max(containerHeight - 32, 150); // 최소 150px
        
        setDimensions({
          width: width || availableWidth,
          height: height || availableHeight
        });
      }
    };

    updateDimensions();
    
    // 윈도우 리사이즈 시 크기 재조정
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  // 텍스트를 단어별로 분석하여 빈도수 계산
  const words = useMemo(() => {
    if (!responses || responses.length === 0) {
      return [];
    }

    const wordCount: { [key: string]: number } = {};
    
    responses.forEach(response => {
      // 타입 안전성 확인
      if (typeof response !== 'string' || !response.trim()) {
        return;
      }
      
      // [userId] response 형태에서 실제 응답 부분만 추출
      let actualResponse = response;
      const userIdMatch = response.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (userIdMatch) {
        actualResponse = userIdMatch[2]; // userId 부분을 제거하고 실제 응답만 사용
      }
      
      // 한글, 영문, 숫자만 추출하고 공백으로 분리
      const cleanText = actualResponse.replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ');
      const words = cleanText.split(/\s+/).filter(word => word.length > 1);
      
      words.forEach(word => {
        const normalizedWord = word.toLowerCase().trim();
        if (normalizedWord.length > 1) {
          wordCount[normalizedWord] = (wordCount[normalizedWord] || 0) + 1;
        }
      });
    });

    // 빈도수 기준으로 정렬하고 상위 50개만 선택
    return Object.entries(wordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
  }, [responses]);

  // 단어 변화 감지 및 애니메이션 트리거
  useEffect(() => {
    const prevWords = prevWordsRef.current;
    const hasChanged = words.length !== prevWords.length || 
      words.some((word, index) => 
        !prevWords[index] || 
        word.text !== prevWords[index].text || 
        word.value !== prevWords[index].value
      );

    if (hasChanged && words.length > 0) {
      setAnimationKey(prev => prev + 1);
      prevWordsRef.current = [...words];
      
      // 디버깅: 상위 5개 단어의 빈도수와 폰트 크기 출력
      console.log('워드 클라우드 업데이트:');
      const maxValue = Math.max(...words.map(w => w.value));
      words.slice(0, 5).forEach(word => {
        // 새로운 폰트 크기 계산 (fontScale 함수와 동일한 로직)
        const baseFont = 12;
        const ratio = word.value / maxValue;
        const absoluteIncrease = (word.value - 1) * 12;
        const relativeSize = ratio * 60;
        const totalIncrease = relativeSize + Math.max(0, absoluteIncrease);
        const minFont = baseFont;
        const maxFont = Math.min(dimensions.width / 3, 120);
        const calculatedSize = baseFont + totalIncrease;
        const fontSize = Math.max(minFont, Math.min(maxFont, calculatedSize));
        
        console.log(`"${word.text}": 빈도수 ${word.value}, 폰트 크기 ${fontSize.toFixed(1)}px (상대:${relativeSize.toFixed(1)}, 절대:${Math.max(0, absoluteIncrease).toFixed(1)})`);
      });
    }
  }, [words, dimensions.width]);

  const colorScale = scaleOrdinal({
    domain: words.map((w) => w.text),
    range: colors,
  });

  const fontScale = (value: number) => {
    // 기본 폰트 크기 설정 (더 작게)
    const baseFont = 12;
    
    // 최대값을 기준으로 상대적 크기 계산
    const maxValue = Math.max(...words.map(w => w.value));
    
    if (maxValue === 0) return baseFont;
    
    // 상대적 비율 계산 (0~1)
    const ratio = value / maxValue;
    
    // 빈도수에 따른 절대적 크기 증가
    const absoluteIncrease = (value - 1) * 12; // 빈도수가 1 증가할 때마다 12px 증가 (8px에서 12px로 증가)
    
    // 상대적 크기와 절대적 크기를 조합
    const relativeSize = ratio * 60; // 최대 60px의 상대적 증가 (40px에서 60px로 증가)
    const totalIncrease = relativeSize + Math.max(0, absoluteIncrease);
    
    // 최소/최대 크기 제한
    const minFont = baseFont;
    const maxFont = Math.min(dimensions.width / 3, 90); // 최대 크기를 120px로 증가 (80px에서 120px로)
    
    const calculatedSize = baseFont + totalIncrease;
    
    // 최소/최대 범위 내에서 제한
    return Math.max(minFont, Math.min(maxFont, calculatedSize));
  };

  const fontWeight = (datum: WordData) => {
    // 빈도수에 따라 폰트 가중치를 점진적으로 증가
    if (datum.value >= 5) return 700;      // 5회 이상: bold
    if (datum.value >= 3) return 600;      // 3-4회: semi-bold
    if (datum.value >= 2) return 500;      // 2회: medium
    return 400;                            // 1회: normal
  };

  // 단어가 새로 추가되었는지 확인
  const isNewWord = (text: string) => {
    return !prevWordsRef.current.some(word => word.text === text);
  };

  // 단어의 크기가 변경되었는지 확인
  const hasWordSizeChanged = (text: string, currentValue: number) => {
    const prevWord = prevWordsRef.current.find(word => word.text === text);
    return prevWord && prevWord.value !== currentValue;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden relative"
    >
      <div className={`w-full h-full flex items-center justify-center word-cloud-container ${animationKey > 0 ? 'word-cloud-pulse' : ''}`}>
        <svg width={dimensions.width} height={dimensions.height}>
          <Wordcloud
            key={animationKey} // 강제 리렌더링을 위한 키
            words={words}
            width={dimensions.width}
            height={dimensions.height}
            fontSize={(datum: WordData) => fontScale(datum.value)}
            font="system-ui, -apple-system, sans-serif"
            padding={2}
            spiral="archimedean"
            rotate={0}
            random={() => 0.5}
          >
            {(cloudWords) =>
              cloudWords.map((w, index) => {
                const originalWord = words.find(word => word.text === w.text);
                const isNew = isNewWord(w.text || '');
                const sizeChanged = originalWord && hasWordSizeChanged(w.text || '', originalWord.value);
                
                return (
                  <Text
                    key={`${w.text}-${animationKey}`}
                    fill={colorScale(w.text || '')}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y})`}
                    fontSize={w.size}
                    fontFamily={w.font}
                    fontWeight={originalWord ? fontWeight(originalWord) : 400}
                    className={`word-cloud-text ${isNew ? 'new-word' : ''} ${sizeChanged ? 'size-changed' : ''}`}
                    style={{
                      animationDelay: `${index * 0.1}s`, // 순차적 애니메이션
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(event) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect && originalWord) {
                        setTooltip({
                          text: w.text || '',
                          count: originalWord.value,
                          x: event.clientX - rect.left,
                          y: event.clientY - rect.top - 10
                        });
                      }
                    }}
                    onMouseMove={(event) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect && tooltip) {
                        setTooltip(prev => prev ? {
                          ...prev,
                          x: event.clientX - rect.left,
                          y: event.clientY - rect.top - 10
                        } : null);
                      }
                    }}
                    onMouseLeave={() => {
                      setTooltip(null);
                    }}
                  >
                    {w.text}
                  </Text>
                );
              })
            }
          </Wordcloud>
        </svg>
      </div>
      
      {/* 툴팁 */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 transform -translate-x-1/2"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-blue-300 font-semibold">"{tooltip.text}"</span>
              <span className="text-gray-300">•</span>
              <span className="text-green-300">{tooltip.count}명 응답</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCloud; 