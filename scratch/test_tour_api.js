
const API_KEY = '9fae9e07e42ee40cb37ad727972a65bad4fd9117b52a17497004bc89cf12d3c5';
const BASE_URL = 'http://apis.data.go.kr/B551011/KorService2';

async function testFetchFestivals() {
  const month = '05';
  const year = '2026';
  const startDate = `${year}${month}01`;
  const endDate = `${year}${month}31`;

  const url = `${BASE_URL}/searchFestival2?serviceKey=${API_KEY}&_type=json&MobileOS=ETC&MobileApp=test&arrange=O&eventStartDate=${startDate}&eventEndDate=${endDate}&numOfRows=1`;
  
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

testFetchFestivals();
