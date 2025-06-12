import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Wordcloud } from '@visx/wordcloud';
import { scaleOrdinal } from '@visx/scale';
import { Text } from '@visx/text';

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
      // 한글, 영문, 숫자만 추출하고 공백으로 분리
      const cleanText = response.replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ');
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

  const colorScale = scaleOrdinal({
    domain: words.map((w) => w.text),
    range: colors,
  });

  const fontScale = (value: number) => {
    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));
    const range = maxValue - minValue || 1;
    const normalized = (value - minValue) / range;
    
    // 반응형 폰트 크기
    const minFont = Math.max(10, Math.min(dimensions.width / 40, 16));
    const maxFont = Math.min(dimensions.width / 8, 48);
    
    return minFont + (maxFont - minFont) * normalized;
  };

  const fontWeight = (datum: WordData) => {
    const maxValue = Math.max(...words.map(w => w.value));
    return datum.value === maxValue ? 700 : 400;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden"
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg width={dimensions.width} height={dimensions.height}>
          <Wordcloud
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
              cloudWords.map((w) => {
                const originalWord = words.find(word => word.text === w.text);
                return (
                  <Text
                    key={w.text}
                    fill={colorScale(w.text || '')}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y})`}
                    fontSize={w.size}
                    fontFamily={w.font}
                    fontWeight={originalWord ? fontWeight(originalWord) : 400}
                  >
                    {w.text}
                  </Text>
                );
              })
            }
          </Wordcloud>
        </svg>
      </div>
    </div>
  );
};

export default WordCloud; 