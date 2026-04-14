import { useState, useEffect } from 'react';
import { Calendar, MapPin, Navigation, Clock, ChevronRight, Sparkles, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { tourApi } from './services/tourApi';
import { geminiService } from './services/gemini';
import type { Festival } from './types';

function App() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    const loadFestivals = async () => {
      setLoading(true);
      try {
        const data = await tourApi.fetchFestivals(selectedMonth.toString());
        setFestivals(data);
      } catch (error) {
        console.error('Failed to load festivals', error);
      } finally {
        setLoading(false);
      }
    };
    loadFestivals();
  }, [selectedMonth]);

  const handleRecommend = async (festival: Festival) => {
    setSelectedFestival(festival);
    setRecLoading(true);
    setRecommendation(null);
    try {
      // Mocking some nearby places for the prompt
      const mockPlaces = [
        { title: '인근 맛집 A', contenttypeid: '39' },
        { title: '테마파크 B', contenttypeid: '12' },
        { title: '전통시장 C', contenttypeid: '0' }
      ];
      const result = await geminiService.recommendCourse(festival.title, mockPlaces);
      setRecommendation(result);
    } catch (error) {
      setRecommendation("추천을 생성하는 중 오류가 발생했습니다.");
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary-500/30">
      {/* Hero Section */}
      <header className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero" 
            className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              대한민국 구석구석, 시즌별 맞춤 여행
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-primary-400">
              이달의 여행
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              이번 달 가장 빛나는 축제를 중심으로 당신만의 완벽한 여행 코스를 AI가 실시간으로 설계해 드립니다.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => document.getElementById('festival-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 group"
              >
                축제 선택하기
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main id="festival-grid" className="max-w-7xl mx-auto px-6 py-20">
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary-500" />
                지금 가장 핫한 축제
              </h2>
              <p className="text-slate-400">대한민국 곳곳에서 열리고 있는 이달의 대표 축제들입니다.</p>
            </div>
            
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
              {[4, 5, 6].map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-semibold transition-all",
                    selectedMonth === month 
                      ? "bg-primary-600 text-white shadow-lg" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {month}월
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[450px] rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800" />
                ))
              ) : (
                festivals.map((festival, index) => (
                  <motion.div
                    key={festival.contentid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative h-[450px] rounded-3xl overflow-hidden border border-slate-800 hover:border-primary-500/30 transition-all shadow-2xl"
                  >
                    <img 
                      src={festival.firstimage || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop'} 
                      alt={festival.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-primary-600/90 text-[11px] font-bold uppercase tracking-wider text-white">
                          축제
                        </span>
                        <span className="flex items-center gap-1 text-slate-300 text-xs">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {festival.addr1 || '지역 정보 없음'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-400 transition-colors">
                        {festival.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {festival.eventstartdate} - {festival.eventenddate}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleRecommend(festival)}
                        className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        AI 코스 추천받기
                        <Brain className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Recommendation Modal */}
      <AnimatePresence>
        {selectedFestival && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="relative h-48">
                <img 
                  src={selectedFestival.firstimage || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop'} 
                  className="w-full h-full object-cover"
                  alt={selectedFestival.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <button 
                  onClick={() => setSelectedFestival(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-bold mb-2">{selectedFestival.title}</h3>
                <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  {selectedFestival.addr1}
                </p>

                <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800">
                  <h4 className="flex items-center gap-2 text-primary-400 font-bold mb-4">
                    <Brain className="w-5 h-5" />
                    AI 추천 여행 코스
                  </h4>
                  
                  {recLoading ? (
                    <div className="space-y-4 py-4">
                      <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2" />
                      <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6" />
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      {recommendation ? (
                        <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                          {recommendation}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">추천을 생성하지 못했습니다.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" />
                    길찾기 (카카오맵)
                  </button>
                  <button 
                    onClick={() => setSelectedFestival(null)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-slate-900 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 이달의 여행 (IdalTrip) - 관광데이터 활용 공모전 출품작</p>
      </footer>

      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}

export default App;
