import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FestivalDetailPage from './pages/FestivalDetailPage';
import CourseResultPage from './pages/CourseResultPage';
import ExploreResultPage from './pages/ExploreResultPage';

import Header from './components/Header';
import BottomNav from './components/BottomNav';

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-slate-400">
    <span className="text-5xl">🚧</span>
    <p className="text-lg font-bold">{title}</p>
    <p className="text-sm">준비 중입니다</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FFF8F3]">
        <div className="max-w-[430px] mx-auto min-h-screen bg-white relative shadow-xl text-on-surface font-body selection:bg-primary/10 overflow-x-hidden">
          <Header />

          <main className="min-h-screen pb-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExploreResultPage />} />
              <Route path="/festival/:id" element={<FestivalDetailPage />} />
              <Route path="/course/:id" element={<CourseResultPage />} />
              <Route path="/festivals" element={<ComingSoon title="축제 소식" />} />
              <Route path="/course-gen" element={<ComingSoon title="AI 추천" />} />
              <Route path="/mypage" element={<ComingSoon title="내 정보" />} />
            </Routes>
          </main>

          <BottomNav />
        </div>
      </div>
    </Router>
  );
}

export default App;
