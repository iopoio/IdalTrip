import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FestivalDetailPage from './pages/FestivalDetailPage';
import CourseResultPage from './pages/CourseResultPage';
import CourseMapPage from './pages/CourseMapPage';

import Header from './components/Header';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/10">
        <Header />

        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/festival/:id" element={<FestivalDetailPage />} />
            <Route path="/course/:id" element={<CourseResultPage />} />
            <Route path="/course/:id/map" element={<CourseMapPage />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
