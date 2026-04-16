import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaceSelectionPage from './pages/PlaceSelectionPage';
import CourseResultPage from './pages/CourseResultPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#2d1a0e] via-[#5c2e1a] to-[#a63415]">
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
