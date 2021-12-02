export type SearchResult = {
    mmsi?: number;
    name: string;
    typeText: string;
    type: number;
    flag: string;
    portId?: number;
}

export type BerthSearchResult = {
    id: number;
    name: string;
    maxDepth: number;
    type: string;
    region: string;
    coordinates: any;
    center: L.LatLng;
    width: number;
    length: number;
    dock: number;
}

export type SearchFilters = {
    excludePorts?: boolean;
    excludeVessels?: boolean;
}