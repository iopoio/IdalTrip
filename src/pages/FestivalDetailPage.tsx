import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Car, Train, Clock, ArrowLeft, Sparkles, Loader2, Info } from 'lucide-react';
import { tourApi } from '../services/tourApi';
import { geminiService } from '../services/gemini';
import type { Festival, Place } from '../types';
import SpotCard from '../components/SpotCard';
import { formatKTODate } from '../lib/utils';

const FestivalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [festival, setFestival] = useState<Festival | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [transport, setTransport] = useState<'car' | 'public'>('car');
  const [duration, setDuration] = useState<'day' | '1night' | '2night'>('day');
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const detail = await tourApi.fetchFestivalDetail(id);
        if (detail) {
          setFestival(detail);
          // Fetch nearby attractions and restaurants
          const attractions = await tourApi.fetchNearbyPlaces(detail.mapx, detail.mapy, 10000, '12');
          const restaurants = await tourApi.fetchNearbyPlaces(detail.mapx, detail.mapy, 10000, '39');
          setNearbyPlaces([...attractions.slice(0, 4), ...restaurants.slice(0, 4)]);
        }
      } catch (error) {
        console.error('Failed to load detail data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSpotToggle = (spotId: string) => {
    setSelectedSpots(prev => 
      prev.includes(spotId) ? prev.filter(s => s !== spotId) : [...prev, spotId]
    );
  };

  const handleGenerateCourse = async () => {
    if (!festival) return;
    setGenerating(true);
    
    // Filter selected places objects
    const selectedPlaceObjects = nearbyPlaces.filter(p => selectedSpots.includes(p.contentid));

    try {
      const response = await geminiService.generateCourse({
        festivalTitle: festival.title,
        festivalAddr: festival.addr1,
        festivalLat: parseFloat(festival.mapy),
        festivalLng: parseFloat(festival.mapx),
        places: selectedPlaceObjects,
        transportation: transport,
        duration: duration
      });

      if (response) {
        navigate(`/course/${id}`, { state: { course: response, transport } });
      } else {
        setError('AI 코스 생성에 실패했습니다. 장소를 2~3곳 선택 후 다시 시도해 주세요.');
      }
    } catch (error) {
       setError('서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="text-primary animate-spin" />
        <p className="text-on-surface-variant font-bold">축제 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!festival) return <div className="p-20 text-center">정보를 찾을 수 없습니다.</div>;

  return (
    <div className="bg-surface min-h-screen">
      {/* Back Button for mobile */}
      <div className="fixed top-24 left-8 z-30 md:hidden">
        <button onClick={() => navigate(-1)} className="p-3 bg-white shadow-soft rounded-2xl">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-12 px-8 py-32">
        <div className="flex-grow lg:max-w-[65%] space-y-16">
          {/* Main Content */}
          <section className="space-y-8 animate-in fade-in duration-700">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-soft bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center border border-surface-container">
              {festival.firstimage ? (
                <img src={festival.firstimage} alt={festival.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-primary opacity-30">
                  <Calendar size={80} strokeWidth={1} />
                  <span className="font-brand text-2xl tracking-widest italic font-bold">Nature Pulse</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase">
                <Calendar size={14} />
                <span>이달의 특별한 축제</span>
              </div>
              <h1 className="text-5xl font-headline font-bold text-on-surface tracking-tight leading-tight">
                {festival.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-on-surface-variant font-medium">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg">
                  <MapPin size={16} />
                  <span>{festival.addr1}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg">
                  <Clock size={16} />
                  <span>{formatKTODate(festival.eventstartdate)} - {formatKTODate(festival.eventenddate)}</span>
                </div>
              </div>
              <p className="text-xl leading-relaxed text-on-surface-variant font-light font-body pt-4">
                {festival.overview?.replace(/<br\s*\/?>/gi, '\n') || '상세 정보가 준비 중입니다.'}
              </p>
            </div>
          </section>

          {/* AI Nearby Spots */}
          <section className="space-y-8 bg-surface-container-low p-10 rounded-2xl border border-surface-container/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-secondary font-bold text-sm">
                   <Sparkles size={20} className="fill-secondary/20" />
                   <span>주변 핫플레이스 추천</span>
                </div>
                <h3 className="text-3xl font-headline font-bold text-on-surface">함께 가고 싶은 곳들을 선택해 보세요</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyPlaces.map(spot => (
                <SpotCard 
                   key={spot.contentid}
                   id={spot.contentid}
                   name={spot.title}
                   image={spot.firstimage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'}
                   category={spot.contenttypeid === '39' ? '음식점' : '관광지'}
                   rating={4.7} // Placeholder as API doesn't provide rating
                   isSelected={selectedSpots.includes(spot.contentid)}
                   onToggle={handleSpotToggle}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Options Stickable Aside */}
        <aside className="lg:w-[35%]">
           <div className="lg:sticky lg:top-32 bg-white rounded-3xl p-10 shadow-soft border border-surface-container/30 space-y-10">
              <h3 className="text-2xl font-bold text-on-surface">여행 설계 가이드</h3>
              
              {/* Transport */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">이동 수단</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTransport('car')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border-2 ${transport === 'car' ? 'bg-primary/5 border-primary text-primary shadow-vibrant scale-[1.02]' : 'bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <Car size={32} strokeWidth={transport === 'car' ? 2.5 : 2} />
                    <span className="font-bold">자차 이용</span>
                  </button>
                  <button 
                    onClick={() => setTransport('public')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border-2 ${transport === 'public' ? 'bg-primary/5 border-primary text-primary shadow-vibrant scale-[1.02]' : 'bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <Train size={32} strokeWidth={transport === 'public' ? 2.5 : 2} />
                    <span className="font-bold">대중교통</span>
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">일정 기간</label>
                <div className="flex bg-surface-container-low p-1.5 rounded-2xl">
                   {[
                     { id: 'day', label: '당일' },
                     { id: '1night', label: '1박 2일' },
                     { id: '2night', label: '2박 3일' }
                   ].map(opt => (
                     <button
                       key={opt.id}
                       onClick={() => setDuration(opt.id as any)}
                       className={`flex-grow py-3 rounded-xl font-bold transition-all ${duration === opt.id ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant opacity-60 hover:opacity-100'}`}
                     >
                       {opt.label}
                     </button>
                   ))}
                </div>
              </div>

              {/* Summary of selection */}
              <div className="p-4 bg-secondary/5 rounded-xl flex items-center justify-between border border-secondary/10">
                 <span className="text-sm font-medium text-secondary">선택된 장소</span>
                 <span className="text-lg font-bold text-secondary">{selectedSpots.length + 1}곳</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <Info size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={handleGenerateCourse}
                disabled={generating}
                className={`w-full py-6 mt-8 rounded-2xl text-xl font-bold shadow-vibrant hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 bg-gradient-to-r from-primary to-primary-container text-on-primary ${generating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {generating ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>AI 코스 생성 중...</span>
                  </>
                ) : (
                  <>
                    <span>AI 코스 설계하기</span>
                    <Sparkles size={24} />
                  </>
                )}
              </button>
           </div>
        </aside>
      </div>

      {/* Floating CTA for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-surface-container z-50">
        <button 
          onClick={handleGenerateCourse}
          disabled={generating}
          className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-vibrant text-lg flex items-center justify-center gap-3"
        >
          {generating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
          {generating ? 'AI 코스 생성 중...' : 'AI 코스 생성하기'}
        </button>
      </div>
    </div>
  );
};

export default FestivalDetailPage;
