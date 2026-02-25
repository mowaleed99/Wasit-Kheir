declare module '@mapbox/mapbox-gl-geocoder' {
  import type { Map } from 'mapbox-gl';
  
  interface MapboxGeocoderOptions {
    accessToken: string;
    mapboxgl: any;
    placeholder?: string;
    countries?: string;
    proximity?: { longitude: number; latitude: number };
  }
  
  export default class MapboxGeocoder {
    constructor(options: MapboxGeocoderOptions);
    getQueryString(): string;
    onAdd(map: Map): HTMLElement;
    onRemove(): void;
  }
}

