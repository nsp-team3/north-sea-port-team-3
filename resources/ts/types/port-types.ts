export enum PortType {
    Last = "LP",
    Current = "CP",
    Next = "DSTPORT"
}

export type PortSearchResult = {
    name: string;
    flag: string;
    portId: number;
}

export type PortSearchFilters = {
    name?: string;
    portId?: string;
    flag?: string;
}

export type PortDetails = {
    country: string;
    countryCode: string;
    id: number;
    latitude: number;
    longitude: number;
    name: string;
    size: string;
}