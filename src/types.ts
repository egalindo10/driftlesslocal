export type Category = 'art' | 'coffee' | 'dog-park' | 'trail-park' | 'attraction' | 'shop';

export interface Location {
  id: string;
  name: string;
  category: Category;
  description: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  website?: string;
  image?: string;
}

export interface MapState {
  selectedLocation: Location | null;
  activeCategory: Category | 'all';
  zoom: number;
  center: [number, number];
}
