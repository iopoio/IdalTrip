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

export interface CourseItem {
  day: number;
  time: string;
  place_name: string;
  type: 'festival' | 'attraction' | 'food' | 'coffee';
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

export interface ParkingLot {
  prkpk: string;
  prknm: string;
  prk_style: string;
  pay_yn: string;
  addr: string;
  lat: string;
  lng: string;
}
