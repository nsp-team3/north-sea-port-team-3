import * as L from "leaflet";

declare module 'leaflet' {
    export interface MapOptions {
        smoothWheelZoom: boolean,
        smoothSensitivity: number,
    }
}

declare module 'leaflet' {
    export function trackSymbol(latlng: L.LatLng, options?: {
		trackId: number,
		fill: boolean,
		fillColor: string,
		fillOpacity: number,
		stroke: boolean,
		color: string,
		opacity: number,
		weight: number,
		speed: number,
		course: number,
		heading: number,
		updateTimestamp: Date,
	}): L.LayerGroup;
}
