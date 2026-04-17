import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaceSelectionPage from './pages/PlaceSelectionPage';
import CourseResultPage from './pages/CourseResultPage';
import { tourApi } from './services/tourApi';
import type { Festival } from './types';

const FEATURES = [
  {
    icon: '🎪',
    num: '01',
    title: '이달의 축제 코스',
    desc: '매달 업데이트되는 전국 시즌 축제 기반 큐레이션 코스를 만나보세요.',
    cta: '코스 보기',
  },
  {
    icon: '✦',
    num: '02',
    title: 'AI 동선 최적화',
    desc: '이동시간·운영시간·휴무일까지 고려한 현실적인 여행 코스 설계.',
    cta: '코스 만들기',
  },
  {
    icon: '🗺️',
    num: '03',
    title: '카카오 내비 연동',
    desc: '코스 완성 후 바로 내비 시작, 친구와 공유까지 한 번에.',
    cta: '지금 시작',
  },
];

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function App() {
  const [bgUrl, setBgUrl] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const month = String(new Date().getMonth() + 1);
    tourApi.fetchFestivals(month).then((festivals) => {
      const withImages = (festivals as unknown as Festival[]).filter(
        (f) => f.firstimage || f.firstimage2
      );
      if (withImages.length > 0) {
        // 랜덤 인덱스 — HomePage 히어로와 다른 이미지
        const idx = Math.floor(Math.random() * Math.min(withImages.length, 8));
        const picked = withImages[idx];
        const url = (picked.firstimage || picked.firstimage2).replace(/^http:\/\//, 'https://');
        setBgUrl(url);
      }
    }).catch(() => {});
  }, []);

  const currentMonth = MONTHS[new Date().getMonth()];

  return (
    <Router>
      <div className="min-h-screen relative">
        {/* 배경 이미지 */}
        <div
          className="fixed inset-0 bg-cover bg-center transition-all duration-700"
          style={bgUrl
            ? { backgroundImage: `url(${bgUrl})` }
            : { background: 'linear-gradient(135deg, #1a0e06, #a63415, #FF6B35)' }
          }
        />
        {/* 배경 dim */}
        <div className="fixed inset-0 bg-black/55" />

        {/* 데스크탑 사이드 오버레이 — lg 이상 */}
        <div className="hidden lg:flex fixed inset-0 z-10 pointer-events-none">

          {/* 좌측 — 에디토리얼 타이포 */}
          <div className="flex-1 flex flex-col justify-center items-start pl-16 pr-8 gap-6 pointer-events-auto">
            <p className="text-[11px] font-bold tracking-[0.35em] text-white/50 uppercase">
              {currentMonth} 특선 코스 · 2025
            </p>
            <h1
              className="text-[5rem] font-black leading-[1.05] tracking-tighter text-white"
              style={{ fontFamily: 'Noto Serif KR, serif', wordBreak: 'keep-all' }}
            >
              이달의<br />
              축제로<br />
              <span style={{ color: '#FF6B35' }}>떠나다.</span>
            </h1>
            <p className="text-sm text-white/55 leading-relaxed max-w-[260px]">
              AI가 축제 일정·이동시간·운영시간을<br />
              분석해 나만의 최적 여행 코스를 설계합니다.
            </p>
          </div>

          {/* 중앙 — 앱 너비 여백 */}
          <div className="w-[430px] shrink-0" />

          {/* 우측 — 에디토리얼 카드 */}
          <div className="flex-1 flex flex-col justify-center gap-4 pl-8 pr-16 pointer-events-auto">
            {FEATURES.map((f) => (
              <button
                key={f.num}
                onClick={() => setShowComingSoon(true)}
                className="rounded-2xl p-5 border border-white/10 backdrop-blur-xl text-left hover:border-white/25 transition-colors"
                style={{ background: 'rgba(15,10,5,0.45)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-white/30">{f.num} / 03</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {f.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed mb-3">{f.desc}</p>
                <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: '#FF6B35' }}>
                  {f.cta} →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 준비중 팝업 */}
        {showComingSoon && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          >
            <div
              className="bg-white rounded-[28px] px-8 py-8 mx-6 text-center shadow-2xl max-w-xs w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">준비 중입니다</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                더 많은 기능을 준비하고 있어요.<br />조금만 기다려 주세요!
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-3 rounded-full font-bold text-sm text-on-primary bg-primary active:opacity-80 transition-opacity"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 앱 컨테이너 */}
        <div className="relative z-20 mx-auto w-full max-w-[430px] min-h-screen bg-surface shadow-2xl text-on-surface font-body overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/places" element={<PlaceSelectionPage />} />
            <Route path="/course/:id" element={<CourseResultPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
