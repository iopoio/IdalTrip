import { useNavigate } from 'react-router-dom';

const RecentCoursePage = () => {
  const navigate = useNavigate();

  const raw = localStorage.getItem('idaltrip_last_course');
  const savedData = raw ? JSON.parse(raw) : null;

  const savedAt = savedData?.savedAt
    ? new Date(savedData.savedAt).toLocaleDateString('ko-KR', {
        month: 'long', day: 'numeric', weekday: 'short'
      })
    : null;

  if (!savedData?.course) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 px-8 text-center">
        <span className="text-5xl">🗺️</span>
        <p className="text-lg font-bold text-on-surface">아직 생성한 코스가 없습니다</p>
        <p className="text-sm text-slate-400">여행지를 탐색하고 AI 코스를 만들어보세요.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-primary-container text-white rounded-xl font-bold text-sm"
        >
          탐색 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface pb-24">
      <section className="px-6 pt-6 pb-4 bg-white">
        <h1 className="font-headline text-2xl font-bold text-on-surface">최근 코스</h1>
        {savedAt && (
          <p className="text-sm text-slate-400 mt-1">{savedAt} 생성</p>
        )}
      </section>

      <section className="px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
          <div>
            <h2 className="font-bold text-lg text-on-surface">{savedData.course.title}</h2>
            <p className="text-sm text-primary font-semibold mt-1">
              {savedData.course.theme} · {savedData.course.total_duration}
            </p>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">{savedData.course.summary}</p>
          <button
            onClick={() => navigate(`/course/recent`, { state: savedData })}
            className="w-full bg-primary-container text-white py-4 rounded-xl font-bold text-base shadow-md active:scale-[0.98] transition-all"
          >
            코스 다시 보기
          </button>
        </div>
      </section>
    </div>
  );
};

export default RecentCoursePage;
