export interface Festival {
  contentid: string;
  title: string;
  addr1: string;
  addr2: string;
  firstimage: string;
  firstimage2: string;
  mapx: string;
  mapy: string;
  eventstartdate: string;
  eventenddate: string;
  tel: string;
  overview?: string; // Added for detail view
}

export interface Place {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  mapx: string;
  mapy: string;
  firstimage: string;
  dist?: number;
}

export interface ParkingLot {
  name: string;
  addr: string;
  lat: number;
  lng: number;
  capacity: number;
  feeInfo: string;
}

export interface CourseItem {
  time: string;
  placeName: string;
  category: 'festival' | 'attraction' | 'food' | 'parking';
  duration: string;
  memo?: string;
  lat: number;
  lng: number;
  kakaoMapUrl?: string;
  parkingInfo?: ParkingLot; // For car users
}

export interface CourseResponse {
  title: string;
  summary: string;
  days: {
    day: number;
    items: CourseItem[];
  }[];
}

export interface TravelCourse {
  title: string;
  items: CourseItem[];
  transportation: 'car' | 'public';
  durationWeeks?: number;
  day: number;
}
