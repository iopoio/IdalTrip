export interface Festival {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  firstimage2: string;
  mapx: string;
  mapy: string;
  eventstartdate: string;
  eventenddate: string;
  tel?: string;
  overview?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  areacode?: string;
}

export interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  mapx: string;
  mapy: string;
  contenttypeid: string;
}

export interface SpotWithStatus {
  contentid: string;
  contenttypeid: string;
  title: string;
  firstimage?: string;
  addr1?: string;
  mapx?: string;
  mapy?: string;
  // 운영 상태 (detailIntro2에서 가져옴)
  isOpen?: boolean;       // true: 운영중, false: 휴무, undefined: 확인중
  openTime?: string;      // 이용시간/영업시간
  restDate?: string;      // 쉬는날
  firstMenu?: string;     // 대표메뉴 (음식점만)
  // 축제 전용
  eventstartdate?: string;
  eventenddate?: string;
}

// CourseItem에 type 확장
export type PlaceType = 'festival' | 'attraction' | 'food' | 'culture' | 'leisure' | 'stay';

export interface CourseItem {
  day: number;
  time: string;
  place_name: string;
  type: PlaceType;
  stay_duration: string;
  description: string;
  move_time?: string;
  distance?: string;
  image_url?: string;
  lat: number;
  lng: number;
}

export interface CourseResponse {
  title: string;
  theme: string;
  summary: string;
  total_duration: string;
  estimated_cost: string;
  schedule: CourseItem[];
}

// 장소 상세 정보 (detailIntro2에서 가져옴)
export interface PlaceDetail {
  contentid: string;
  opentime?: string;
  restdate?: string;
  usetime?: string;
  infocenter?: string;
  parking?: string;
  useseason?: string;
  accomcount?: string;
  expguide?: string;
  firstmenu?: string;
  treatmenu?: string;
  chkcreditcard?: string;
  kidsfacility?: string;
}

// 카카오 장소 검색 결과
export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  x: string;  // 경도
  y: string;  // 위도
  phone?: string;
  place_url?: string;
  distance?: string;
}

// 장소 (PlaceWithDetail): Place + detail + kakao rating
export interface PlaceWithDetail extends Place {
  detail?: PlaceDetail;
  kakaoRating?: number;
  kakaoReviews?: number;
  isKakaoSource?: boolean;
  dist?: string;
}

// 추천 여행지 (홈 큐레이션용)
export interface RecommendedDestination {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  regionCode: string;
  imageUrl: string;
  badge?: string;
  badgeType?: 'festival' | 'recommend' | 'popular';
}

export interface ParkingLot {
  prkpk: string;
  prknm: string;
  prk_style: string;
  pay_yn: string;
  addr: string;
  lat: string;
  lng: string;
}
