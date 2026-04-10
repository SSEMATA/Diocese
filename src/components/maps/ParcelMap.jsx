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

const DEFAULT_COORDS = [0.6527, 30.2506]

function getGoogleMapUrl(lat, lng, zoom = 13) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
}

function formatLatLng(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}

function ParcelMap({ parcel }) {
  const coords = DISTRICT_COORDS[parcel.district] || DEFAULT_COORDS

  return (
    <div className="parcel-map-wrap">
      <iframe
        title={`Map of ${parcel.name || parcel.district}`}
        className="parcel-map"
        src={getGoogleMapUrl(coords[0], coords[1], 13)}
        loading="lazy"
      />
      <div className="parcel-map-caption">
        <div><strong>{parcel.name || parcel.district}</strong></div>
        <div>{formatLatLng(coords[0], coords[1])}</div>
      </div>
    </div>
  )
}

export default ParcelMap
