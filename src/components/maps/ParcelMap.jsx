function buildQuery(parcel) {
  // Build the most specific query possible from available location fields
  const parts = [
    parcel.name,
    parcel.village,
    parcel.subcounty,
    parcel.county,
    parcel.district,
    'Uganda',
  ].filter(Boolean)
  return parts.join(', ')
}

function ParcelMap({ parcel }) {
  const query = buildQuery(parcel)
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`

  return (
    <div className="parcel-map-wrap">
      <iframe
        key={parcel.id}
        title={`Map of ${parcel.name || parcel.district}`}
        className="parcel-map"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="parcel-map-caption">
        <strong>{parcel.name || parcel.district}</strong>
        <div>{[parcel.village, parcel.subcounty, parcel.district].filter(Boolean).join(' · ')}</div>
      </div>
    </div>
  )
}

export default ParcelMap
