import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DISTRICT_COORDS = {
  Kabarole:    [0.6527,  30.2506],
  Bundibugyo:  [0.7167,  30.0667],
  Kamwenge:    [0.1833,  30.4667],
  Kyenjojo:    [0.6167,  30.6333],
  Kyegegwa:    [0.4833,  31.0500],
  Ntoroko:     [1.0500,  30.4167],
  Bunyangabu:  [0.4167,  30.2000],
  Kitagwenda:  [0.2500,  30.3500],
}

const STATUS_COLORS = {
  Active:   '#059669',
  Inactive: '#dc2626',
  Reserved: '#d97706',
}

function makePin(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.667 16 26 16 26S32 26.667 32 16C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2.5"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  })
}

function ParcelMap({ parcel }) {
  const coords = DISTRICT_COORDS[parcel.district] || [0.6527, 30.2506]
  const pinColor = STATUS_COLORS[parcel.status] || '#2563eb'

  return (
    <MapContainer
      key={parcel.id}
      center={coords}
      zoom={11}
      zoomControl={false}
      scrollWheelZoom={false}
      className="parcel-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />

      {/* Soft radius circle around the pin */}
      <Circle
        center={coords}
        radius={3000}
        pathOptions={{ color: pinColor, fillColor: pinColor, fillOpacity: 0.08, weight: 1.5, dashArray: '6 4' }}
      />

      <Marker position={coords} icon={makePin(pinColor)}>
        <Popup className="parcel-popup">
          <div className="pp-name">{parcel.name}</div>
          <div className="pp-row">
            <span className="pp-label">District</span>
            <span className="pp-value">{parcel.district}</span>
          </div>
          <div className="pp-row">
            <span className="pp-label">Village</span>
            <span className="pp-value">{parcel.village || '—'}</span>
          </div>
          <div className="pp-row">
            <span className="pp-label">Acreage</span>
            <span className="pp-value">{parcel.acreage} ac</span>
          </div>
          <div className="pp-row">
            <span className="pp-label">Status</span>
            <span className="pp-status" style={{ color: pinColor }}>{parcel.status}</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default ParcelMap
