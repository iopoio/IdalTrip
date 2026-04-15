import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourApi } from '../services/tourApi';
import type { Festival } from '../types';
import MonthFilter from '../components/MonthFilter';
import FestivalCard from '../components/FestivalCard';
import { getFestivalStatus } from '../lib/utils';

const FestivalsPage = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('전체');

  const regions = ['전체', '서울/경기', '강원', '충청', '전라', '경상', '제주'];

  const filteredFestivals = selectedRegion === '전체'
    ? festivals
    : festivals.filter(festival => {
        const addr = festival.addr1 || '';
        const prefix = addr.split(' ')[0];
        if (selectedRegion === '서울/경기') return ['서울', '경기', '인천'].some(r => prefix.includes(r));
        if (selectedRegion === '충청') return ['충청', '대전', '세종'].some(r => prefix.includes(r));
        if (selectedRegion === '전라') return ['전라', '광주'].some(r => prefix.includes(r));
        if (selectedRegion === '경상') return ['경상', '부산', '대구', '울산'].some(r => prefix.includes(r));
        return prefix.includes(selectedRegion);
      });

  useEffect(() => {
    setSelectedRegion('전체'); // 월 바뀌면 지역 초기화
    const loadFestivals = async () => {
      setLoading(true);
      const data = await tourApi.fetchFestivals(currentMonth.toString());
      
      const sorted = [...data].sort((a, b) => {
        const order = { '진행중': 0, '예정': 1, '종료': 2 };
        const sa = getFestivalStatus(a.eventstartdate, a.eventenddate) as keyof typeof order;
        const sb = getFestivalStatus(b.eventstartdate, b.eventenddate) as keyof typeof order;
        return (order[sa] ?? 3) - (order[sb] ?? 3);
      });
      
      setFestivals(sorted);
      setLoading(false);
    };
    loadFestivals();
  }, [currentMonth]);

  return (
    <div className="bg-surface text-on-surface pb-24">
      {/* 페이지 타이틀 */}
      <section className="px-6 pt-6 pb-4 bg-white">
        <h1 className="font-headline text-2xl font-bold text-on-surface">축제 소식</h1>
        <p className="text-sm text-slate-500 mt-1">전국 각지의 생생한 축제 소식을 전해드립니다.</p>
      </section>

      {/* 월 필터 */}
      <section className="pt-4 pb-6 bg-surface-container-low overflow-visible">
        <div className="px-6 overflow-visible">
          <MonthFilter currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
      </section>

      {/* 지역 필터 */}
      <section className="px-4 pb-4 bg-surface">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedRegion === region
                  ? 'bg-primary-container text-white'
                  : 'bg-surface-container text-slate-500'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </section>

      {/* 축제 그리드 */}
      <section className="px-4 py-6 bg-surface">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-surface-container-high rounded-xl aspect-[3/4]" />
            ))}
          </div>
        ) : filteredFestivals.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">해당 지역의 축제 정보가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredFestivals.map((festival) => (
              <FestivalCard
                key={festival.contentid}
                festival={festival}
                onClick={() => navigate(`/festival/${festival.contentid}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FestivalsPage;
