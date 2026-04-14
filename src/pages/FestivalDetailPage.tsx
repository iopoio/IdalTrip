import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Car, Train, ArrowLeft, Sparkles, Loader2, Check } from 'lucide-react';
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
        setNearbyPlaces([...(attractions || []), ...(foods || [])]);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const toggleSpot = (contentId: string) => {
    setSelectedSpots(prev => 
      prev.includes(contentId) ? prev.filter(i => i !== contentId) : [...prev, contentId]
    );
  };

  const handleGenerateCourse = async () => {
    if (!festival) return;
    setGenerating(true);
    try {
      const selectedPlaceObjects = nearbyPlaces.filter(p => selectedSpots.includes(p.contentid));
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
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-brand-primary" size={60} strokeWidth={3} />
    </div>
  );

  return (
    <div className="pb-40 bg-white min-h-screen">
      {/* Cinematic Hero - Premium Scale */}
      <section className="relative h-[600px] md:h-[700px]">
        <div className="absolute inset-0">
          <img 
            src={festival.firstimage || "https://images.unsplash.com/photo-1547036967-23d1199d3b1f?auto=format&fit=crop&q=80&w=2400"} 
            className="w-full h-full object-cover"
            alt={festival.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-black/10 to-transparent" />
        </div>

        <div className="relative inner-container h-full flex flex-col justify-end pb-32">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-12 left-8 w-14 h-14 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-secondary transition-all shadow-premium"
          >
            <ArrowLeft size={28} />
          </button>

          <div className="mb-10 px-6 py-2 bg-brand-primary rounded-full w-fit flex items-center gap-3 text-white shadow-premium">
             <Sparkles size={16} />
             <span className="text-[12px] font-black tracking-widest uppercase">Festive Pulse</span>
          </div>
          <h1 className="display-lg text-brand-secondary mb-10">{festival.title}</h1>
          <div className="flex flex-col md:flex-row gap-8 text-[18px] font-bold text-gray-500">
            <span className="flex items-center gap-3"><MapPin size={22} className="text-brand-primary" /> {festival.addr1}</span>
            <span className="flex items-center gap-3"><Calendar size={22} className="text-brand-primary" /> {festival.eventstartdate} ~ {festival.eventenddate}</span>
          </div>
        </div>
      </section>

      <div className="inner-container pt-32 flex flex-col lg:flex-row gap-24">
        {/* Nearby Spots - No-Line Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="display-lg !text-[2.5rem] text-brand-secondary mb-4">함께 떠나면 좋은 곳</h2>
              <p className="text-lg text-gray-400 font-medium">축제 현장 주변의 검증된 명소와 미식 거점들입니다.</p>
            </div>
            <button className="text-brand-primary font-black text-[15px] flex items-center gap-3 group transition-all">
              목록 새로고침 <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {nearbyPlaces.map((place) => (
              <div 
                key={place.contentid}
                onClick={() => toggleSpot(place.contentid)}
                className={`flex gap-10 p-6 rounded-[40px] transition-all duration-500 cursor-pointer ${
                  selectedSpots.includes(place.contentid) 
                  ? 'bg-brand-primary/5 shadow-[0_0_0_2px_#ff6b35] scale-[1.02]' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="relative w-40 h-40 md:w-60 md:h-56 flex-shrink-0 rounded-[32px] overflow-hidden">
                   <img 
                    src={place.firstimage || "https://images.unsplash.com/photo-1547036967-23d1199d3b1f?w=600"} 
                    alt={place.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[11px] font-black text-white shadow-lg ${
                    place.contenttypeid === '39' ? 'bg-orange-500' : 'bg-brand-secondary'
                  }`}>
                    {place.contenttypeid === '39' ? '미식' : '명소'}
                  </div>
                  {selectedSpots.includes(place.contentid) && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white shadow-2xl animate-scale-in">
                      <Check size={24} strokeWidth={4} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center py-4">
                  <h4 className="text-2xl font-black text-brand-secondary mb-4">{place.title}</h4>
                  <p className="text-gray-400 text-[16px] leading-relaxed font-medium mb-6 line-clamp-2">
                    시안의 감성을 담은 주변 추천 장소입니다. 축제 여정의 밀도를 높여줄 특별한 경험이 기다리고 있습니다.
                  </p>
                  <div className="flex gap-8 text-[14px] font-black">
                    <span className="flex items-center gap-2 text-brand-primary"><Sparkles size={16} /> 신뢰도 98%</span>
                    <span className="flex items-center gap-2 text-gray-500"><MapPin size={16} /> 직선거리 1.2km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planner Sidebar - Surface Tiering */}
        <div className="w-full lg:w-[420px]">
          <div className="sticky top-32 p-12 bg-white rounded-[56px] shadow-premium border-none">
            <h3 className="display-lg !text-[2rem] text-brand-secondary mb-12">여정 설계</h3>
            
            <div className="space-y-12">
              <section>
                <label className="text-[12px] font-black text-gray-300 uppercase tracking-[0.2em] block mb-6">출발 지점</label>
                <div className="relative">
                   <input 
                    type="text" 
                    placeholder="출발지를 입력하세요 (예: 서울역)"
                    className="w-full bg-gray-50 border-none rounded-[24px] py-5 px-14 text-[16px] font-bold focus:bg-white focus:shadow-premium outline-none transition-all"
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-primary rounded-full" />
                </div>
              </section>

              <section>
                <label className="text-[12px] font-black text-gray-300 uppercase tracking-[0.2em] block mb-6">최적 이동 수단</label>
                <div className="grid grid-cols-2 gap-6">
                  {(['car', 'public'] as const).map((t) => (
                    <button 
                      key={t}
                      onClick={() => setTransport(t)}
                      className={`h-40 rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all duration-500 ${
                        transport === t 
                        ? 'bg-brand-primary text-white shadow-2xl scale-105 font-black' 
                        : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {t === 'car' ? <Car size={36} /> : <Train size={36} />}
                      <span>{t === 'car' ? '자가용' : '대중교통'}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[12px] font-black text-gray-300 uppercase tracking-[0.2em] block mb-6">여행 박수</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['day', '1night', '2night'] as const).map((d) => (
                    <button 
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-5 rounded-[20px] font-black text-[14px] transition-all duration-300 ${
                        duration === d 
                        ? 'bg-brand-secondary text-white shadow-xl' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {d === 'day' ? '당일' : d === '1night' ? '1박 2일' : '2박 3일'}
                    </button>
                  ))}
                </div>
              </section>

              <div className="pt-8 flex justify-between items-center border-t border-gray-50 mb-12">
                 <span className="text-gray-400 font-bold">선택된 장소</span>
                 <span className="text-2xl font-black text-brand-secondary">{selectedSpots.length + 1}곳</span>
              </div>

              <button 
                onClick={handleGenerateCourse}
                disabled={generating}
                className={`cta-primary w-full py-6 text-xl shadow-brand-primary/30 ${
                  generating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {generating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                {generating ? '여정 분석 중...' : 'AI 코스 생성하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalDetailPage;
