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
