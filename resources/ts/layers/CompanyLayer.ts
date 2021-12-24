import * as L from "leaflet";
import Layer from "./Layer";
import { arcgisToGeoJSON } from "@esri/arcgis-to-geojson-utils";

const arcgis = {
	companies: require('../../northSeaPortGeoJson/bedrijven_northsp.json'),
	management: require('../../northSeaPortGeoJson/beheergebied_northsp.json'),
}

export default class CompanyLayer extends Layer {
	private readonly MIN_MANAGEMENT_ZOOM = 8;
	private readonly MIN_COMPANIES_ZOOM = 13;
	private _managementLayer: L.GeoJSON;
	private _popup?: L.Popup;

	public constructor(map: L.Map) {
		super(map);
		this._nestedLayer = this.createCompaniesJSON();
		this._managementLayer = this.createManagementJSON();
		this.update();
		this.show();
	}

	/**
	 * Rendert alle layers
	 */
	public update(): void {
		const zoomLevel = this._map.getZoom();
		this.renderCompanies(zoomLevel);
		this.renderManagement(zoomLevel);
	}

	public show(): void {
		this.update();
	}

	public hide(): void {
		if (this._layerGroup.hasLayer(this._nestedLayer)) {
			this._layerGroup.removeLayer(this._nestedLayer);
		}
		if (this._layerGroup.hasLayer(this._managementLayer)) {
			this._layerGroup.removeLayer(this._managementLayer);
		}
	}

	private renderCompanies(zoomLevel: number): void {
		if (zoomLevel >= this.MIN_COMPANIES_ZOOM) {
			this._layerGroup.addLayer(this._nestedLayer);
		} else {
			this._layerGroup.removeLayer(this._nestedLayer);
		}
	}

	private renderManagement(zoomLevel: number): void {
		if (zoomLevel >= this.MIN_MANAGEMENT_ZOOM && zoomLevel < this.MIN_COMPANIES_ZOOM) {
			this._layerGroup.addLayer(this._managementLayer);
			if (this._popup) {
				this._map.closePopup(this._popup);
			}
		} else {
			this._layerGroup.removeLayer(this._managementLayer);
		}
	}

	private createCompaniesJSON(): L.GeoJSON {
		return L.geoJSON(arcgisToGeoJSON(arcgis.companies), {
			onEachFeature: (feature, layer) => {
				const popup = L.popup()
					.setLatLng(this.getCenter(layer as L.Polygon))
					.setContent(this.createCompanyPopupContent(feature));

				layer.on("mouseover", () => {
					this._map.openPopup(popup);
					this._popup = popup;
				});

				layer.on("mouseout", () => {
					this._map.closePopup(popup);
					this._popup = undefined;
				});
			},
			style: {
				"color": "#ff7800",
				"weight": 0,
				"opacity": 0.65
			}
		});
	}

	private createManagementJSON(): L.GeoJSON {
		return L.geoJSON(arcgisToGeoJSON(arcgis.management));
	}

	private getCenter(layer: L.Polygon): L.LatLng {
		return layer.getBounds().getCenter();
	}

	private createCompanyPopupContent(feature: { properties: { bedrijf: string, havenNummer: string } }): string {
		return `<table>
        <tr>
            <th>Bedrijf</th>
        </tr>
        <tr>
            <td>${feature.properties.bedrijf}</td>
        </tr>
        <tr>
            <th>Haven</th>
        </tr>
        <tr>
            <td>${feature.properties.havenNummer}</td>
        </tr>
        </table>`;
	}
}
