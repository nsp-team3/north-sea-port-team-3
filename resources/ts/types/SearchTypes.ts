export type SearchResult = {
    mmsi?: number;
    name: string;
    typeText: string;
    type: number;
    flag: string;
    portId?: number;
}

export type SearchFilters = {
    excludePorts?: boolean;
    excludeVessels?: boolean;
}