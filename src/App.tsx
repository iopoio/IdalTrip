import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaceSelectionPage from './pages/PlaceSelectionPage';
import CourseResultPage from './pages/CourseResultPage';
import { tourApi } from './services/tourApi';
import type { Festival } from './types';

function App() {
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    const month = String(new Date().getMonth() + 1);
    tourApi.fetchFestivals(month).then((festivals) => {
      const withImage = (festivals as unknown as Festival[]).find(
        (f) => f.firstimage || f.firstimage2
      );
      if (withImage) {
        const url = (withImage.firstimage || withImage.firstimage2).replace(/^http:\/\//, 'https://');
        setBgUrl(url);
      }
    }).catch(() => {});
  }, []);

  return (
    <Router>
      <div
        className="min-h-screen bg-cover bg-center bg-fixed transition-all duration-700"
        style={bgUrl
          ? { backgroundImage: `url(${bgUrl})` }
          : { background: 'linear-gradient(135deg, #1a0e06, #a63415, #FF6B35)' }
        }
      >
        <div className="max-w-[430px] mx-auto min-h-screen bg-surface relative shadow-2xl text-on-surface font-body overflow-x-hidden">
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
