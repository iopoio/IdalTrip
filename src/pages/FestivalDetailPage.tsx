import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CalendarToday, 
  LocationOn, 
  DirectionsCar, 
  DirectionsBus, 
  WbSunny, 
  AutoAwesome, 
  Description,
  CheckCircle,
  Loader2
} from '../components/Icons';
import { tourApi } from '../services/tourApi';
import { geminiService } from '../services/gemini';
import type { Festival, Place } from '../types';

const FestivalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [festival, setFestival] = useState<Festival | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  
  const [transport, setTransport] = useState<'car' | 'public'>('car');
  const [duration, setDuration] = useState<'day' | '1night' | '2night'>('day');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      const festDetail = await tourApi.fetchFestivalDetail(id);
      if (festDetail) {
        setFestival(festDetail);
        const [attractions, foods] = await Promise.all([
          tourApi.fetchNearbyPlaces(festDetail.mapx, festDetail.mapy, 10000, '12'),
          tourApi.fetchNearbyPlaces(festDetail.mapx, festDetail.mapy, 10000, '39')
        ]);
        // Initial selection: take first 3
        const spots = [...(attractions || []), ...(foods || [])];
        setNearbyPlaces(spots);
        setSelectedSpots(spots.slice(0, 3).map(s => s.contentid));
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const toggleSpot = (contentId: string) => {
    setSelectedSpots((prev: string[]) => 
      prev.includes(contentId) ? prev.filter((i: string) => i !== contentId) : [...prev, contentId]
    );
  };

  const handleGenerateCourse = async () => {
    if (!festival) return;
    setGenerating(true);
    try {
      const selectedPlaceObjects = nearbyPlaces.filter((p: Place) => selectedSpots.includes(p.contentid));
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
      }
    } catch (error) {
       console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !festival) return (
    <div className="h-screen flex items-center justify-center bg-surface">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="bg-surface text-on-surface">
      <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area (Left) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Hero Section - Mockup 1:1 */}
            <section className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-2xl group">
              <img 
                alt={festival.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={festival.firstimage || "https://images.unsplash.com/photo-1547036967-23d1199d3b1f?w=1200"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">진행중</span>
                  <span className="text-sm font-medium text-white/80">#전통축제 #추천스팟</span>
                </div>
                <h1 className="text-5xl font-headline font-bold mb-2 tracking-tight">{festival.title}</h1>
                <p className="text-lg text-white/90 font-light font-body">계절이 머무는 자리에 당신을 초대합니다.</p>
              </div>
            </section>

            {/* Detailed Description */}
            <section className="bg-surface-container-low rounded-xl p-8">
              <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
                <Description className="text-primary w-6 h-6" />
                축제 상세 정보
              </h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed font-body">
                <p>{festival.overview || "축제에 대한 풍성한 이야기가 곧 업데이트될 예정입니다. IdalTrip과 함께 계절의 정취를 만끽해 보세요."}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">기간</span>
                    <span className="font-semibold text-on-surface">{festival.eventstartdate} ~ {festival.eventenddate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">장소</span>
                    <span className="font-semibold text-on-surface">{festival.addr1}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Recommended Spots Grid - Bento Layout */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-headline font-bold">AI 추천 주변 스팟</h2>
                  <p className="text-sm text-slate-500 mt-1">축제와 함께 즐기기 좋은 주변 명소들을 AI가 엄선했습니다.</p>
                </div>
                <button 
                  onClick={() => setSelectedSpots(nearbyPlaces.map(p => p.contentid))}
                  className="text-primary text-sm font-bold cursor-pointer hover:underline"
                >
                  모두 선택
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {nearbyPlaces.slice(0, 5).map((place, idx) => {
                  const isLarge = idx === 0;
                  const isChecked = selectedSpots.includes(place.contentid);
                  return (
                    <div 
                      key={place.contentid}
                      onClick={() => toggleSpot(place.contentid)}
                      className={`${isLarge ? 'col-span-2' : ''} relative group rounded-xl overflow-hidden bg-surface-container-highest h-[240px] cursor-pointer`}
                    >
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={place.firstimage || "https://images.unsplash.com/photo-1547036967-23d1199d3b1f?w=600"}
                        alt={place.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-6 flex flex-col justify-end">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`${isLarge ? 'text-xl' : 'text-lg'} text-white font-bold mb-1`}>{place.title}</h3>
                            <p className="text-white/70 text-sm">도보 이동 가능 · 추천 필터</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {}} // Controlled via parent div click
                            className="w-6 h-6 rounded-lg border-2 border-white/50 bg-white/20 checked:bg-primary checked:border-primary focus:ring-primary transition-all cursor-pointer shadow-xl"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar (Right) - Mockup 1:1 */}
          <div className="lg:col-span-4">
            <aside className="sticky top-32 bg-surface-container-lowest rounded-xl p-8 shadow-sm border-t border-slate-50">
              <h2 className="text-xl font-bold mb-8 text-on-surface font-headline">여행 옵션 설정</h2>
              <div className="space-y-8">
                {/* Origin Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-[0.2em]">출발지 입력</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-semibold italic" 
                      placeholder="서울역" 
                      type="text"
                    />
                    <LocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  </div>
                </div>

                {/* Transportation Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-[0.2em]">이동수단 선택</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setTransport('car')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all shadow-md ${
                        transport === 'car' ? 'bg-primary text-white' : 'bg-surface-container-high text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <DirectionsCar className="w-6 h-6" />
                      <span className="text-sm font-bold">자가용</span>
                    </button>
                    <button 
                      onClick={() => setTransport('public')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                        transport === 'public' ? 'bg-primary text-white' : 'bg-surface-container-high text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <DirectionsBus className="w-6 h-6" />
                      <span className="text-sm font-medium">대중교통</span>
                    </button>
                  </div>
                </div>

                {/* Schedule Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-[0.2em]">일정 선택</label>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setDuration('day')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        duration === 'day' ? 'bg-surface-container-high border-primary/20' : 'bg-white border-slate-100 hover:border-primary/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarToday className="text-slate-400 w-5 h-5" />
                        <span className="font-medium text-on-surface">당일 여행</span>
                      </div>
                      {duration === 'day' && <CheckCircle className="text-primary w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => setDuration('1night')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        duration === '1night' ? 'bg-surface-container-high border-primary/20' : 'bg-white border-slate-100 hover:border-primary/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <WbSunny className="text-slate-400 w-5 h-5" />
                        <span className="font-medium text-on-surface">1박 2일</span>
                      </div>
                      {duration === '1night' && <CheckCircle className="text-primary w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* AI Course Generation Button */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 font-medium">예상 방문 장소</span>
                    <span className="text-lg font-bold text-on-surface">{selectedSpots.length + 1}곳</span>
                  </div>
                  <button 
                    onClick={handleGenerateCourse}
                    disabled={generating}
                    className="w-full bg-primary-container hover:scale-[1.02] text-white py-5 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary-container/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="animate-spin w-6 h-6" /> : <AutoAwesome className="w-6 h-6" />}
                    AI 코스 생성하기
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed font-body uppercase tracking-wider">
                    Powered by Gemini 1.5 Pro
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FestivalDetailPage;
