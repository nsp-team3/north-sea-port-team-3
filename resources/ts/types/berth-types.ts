export type BerthInfo = {
    id?: number;
    name: string;
    owner: string;
    enigmaCode: string;
    externalCode: string;
    maxDepth?: number;
    type: string;
    region: string;
    location: L.LatLng;
    width?: number;
    length?: number;
    dock: number;
}