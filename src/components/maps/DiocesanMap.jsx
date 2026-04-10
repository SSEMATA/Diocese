import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Approximate coordinates for each diocese district
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

const CATEGORY_COLORS = {
  'Parish land':              '#2563eb',
  'Treasury land':            '#7c3aed',
  'Commission / Institution': '#0891b2',
}

function makeIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

function DiocesanMap({ parcels }) {
  // Group parcels by district with counts
  const districtStats = Object.entries(DISTRICT_COORDS).map(([district, coords]) => {
    const districtParcels = parcels.filter(p => p.district === district)
    const acreage = districtParcels.reduce((s, p) => s + (p.acreage || 0), 0)
    const byCategory = {}
    districtParcels.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1
    })
    return { district, coords, count: districtParcels.length, acreage, byCategory }
  })

  return (
    <div className="diocese-map-wrap">
      <MapContainer
        center={[0.6527, 30.2506]}
        zoom={8}
        zoomControl={false}
        scrollWheelZoom={false}
        className="diocese-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {districtStats.map(({ district, coords, count, acreage, byCategory }) => (
          <Marker
            key={district}
            position={coords}
            icon={makeIcon(count > 0 ? '#dc2626' : '#64748b')}
          >
            <Popup className="diocese-popup">
              <div className="dp-header">
                <strong>{district}</strong>
                <span className="dp-count">{count} {count === 1 ? 'parcel' : 'parcels'}</span>
              </div>
              <div className="dp-acreage">{acreage.toFixed(1)} acres total</div>
              {Object.entries(byCategory).map(([cat, n]) => (
                <div key={cat} className="dp-cat-row">
                  <span className="dp-cat-dot" style={{ background: CATEGORY_COLORS[cat] || '#64748b' }} />
                  <span className="dp-cat-label">{cat}</span>
                  <span className="dp-cat-n">{n}</span>
                </div>
              ))}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default DiocesanMap
