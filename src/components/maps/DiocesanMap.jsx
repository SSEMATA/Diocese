const DEFAULT_COORDS = [0.6527, 30.2506]

function getGoogleMapUrl(lat, lng, zoom = 8) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
}

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

function formatLatLng(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
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

  const parcelCount = districtStats.reduce((sum, district) => sum + district.count, 0)

  return (
    <div className="diocese-map-wrap">
      <iframe
        title="Fort Portal Diocese overview map"
        className="diocese-map"
        src={getGoogleMapUrl(DEFAULT_COORDS[0], DEFAULT_COORDS[1], 8)}
        loading="lazy"
      />
      <div className="diocese-map-caption">
        <div><strong>Fort Portal Diocese overview</strong></div>
        <div>{parcelCount} parcels across 8 districts • {formatLatLng(DEFAULT_COORDS[0], DEFAULT_COORDS[1])}</div>
      </div>
    </div>
  )
}

export default DiocesanMap
