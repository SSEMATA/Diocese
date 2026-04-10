import { useState } from 'react'
import {
  FiMapPin, FiLayers, FiFileText, FiUser,
  FiCheckCircle, FiChevronRight, FiChevronLeft, FiSave, FiX,
} from 'react-icons/fi'

const STEPS = [
  { id: 1, label: 'Location',  icon: FiMapPin },
  { id: 2, label: 'Details',   icon: FiLayers },
  { id: 3, label: 'Tenure',    icon: FiFileText },
  { id: 4, label: 'Contact',   icon: FiUser },
  { id: 5, label: 'Review',    icon: FiCheckCircle },
]

const EMPTY = {
  name: '', parish: '', outstation: '', village: '',
  subcounty: '', county: '', district: '', deanery: '',
  category: '', acreage: '', status: '',
  tenureType: '', leaseType: '', acquisition: '', lastSurvey: '',
  tenant: '', contact: '', remarks: '',
}

function Field({ label, required, hint, children }) {
  return (
    <div className="alp-field">
      <label className="alp-label">
        {label}{required && <span className="alp-required">*</span>}
      </label>
      {children}
      {hint && <span className="alp-hint">{hint}</span>}
    </div>
  )
}

function AddLandPage({ categories, statuses, tenureTypes, districts, onSave, onCancel }) {
  const [step, setStep]           = useState(1)
  const [form, setForm]           = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const inp = (key) => ({ value: form[key], onChange: (e) => set(key, e.target.value) })

  if (submitted) {
    return (
      <div className="alp-success-wrap">
        <div className="alp-success">
          <div className="alp-success-ring">
            <FiCheckCircle className="alp-success-icon" />
          </div>
          <div className="alp-success-text">
            <h2>Record Saved Successfully</h2>
            <p>The parcel <strong>{form.name || 'New Parcel'}</strong> has been added to the Fort Portal Diocese land registry.</p>
          </div>
          <div className="alp-success-meta">
            {[
              { label: 'Parcel',   value: form.name || '—' },
              { label: 'District', value: form.district || '—' },
              { label: 'Category', value: form.category || '—' },
              { label: 'Acreage',  value: form.acreage ? `${form.acreage} ac` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="alp-success-meta-item">
                <span className="alp-success-meta-label">{label}</span>
                <span className="alp-success-meta-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="alp-success-actions">
            <button type="button" className="alp-btn-primary"
              onClick={() => { setForm(EMPTY); setStep(1); setSubmitted(false) }}>
              Add Another Record
            </button>
            <button type="button" className="alp-btn-ghost" onClick={onCancel}>
              Back to Land Records
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="alp-page">

      {/* ── Top mini navbar ── */}
      <div className="alp-topnav">
        <div className="alp-topnav-left">
          <div className="alp-topnav-icon">
            <FiMapPin />
          </div>
          <div>
            <h2 className="alp-topnav-title">Add Land Record</h2>
            <span className="alp-topnav-sub">Fort Portal Diocese</span>
          </div>
        </div>

        <div className="alp-steps-bar">
          {STEPS.map((s, i) => (
            <div key={s.id} className="alp-steps-bar-item">
              <button
                type="button"
                className={`alp-steps-bar-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}
                onClick={() => setStep(s.id)}
              >
                <div className="alp-steps-bar-circle">
                  {step > s.id ? <FiCheckCircle /> : <s.icon />}
                </div>
                <span className="alp-steps-bar-label">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`alp-steps-bar-line ${step > s.id ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress track ── */}
      <div className="alp-track">
        <div className="alp-track-fill" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
      </div>

      {/* ── Form card ── */}
      <form className="alp-form" onSubmit={(e) => {
          e.preventDefault()
          const newParcel = {
            ...form,
            id: 'P' + Date.now(),
            acreage: parseFloat(form.acreage) || 0,
          }
          onSave(newParcel)
          setSubmitted(true)
        }}>

        <div className="alp-form-header">
          <div className="alp-form-step-badge">Step {step} of {STEPS.length}</div>
          <h2 className="alp-form-title">{STEPS[step - 1].label}</h2>
          <p className="alp-form-desc">
            {['Where is this land parcel located?',
              'Category, size, status and survey information.',
              'Ownership type and lease details.',
              'Who manages or is responsible for this parcel?',
              'Confirm all details before saving the record.',
            ][step - 1]}
          </p>
        </div>

        <div className="alp-form-body">

          {step === 1 && (
            <div className="alp-grid-2">
              <Field label="Parcel Name" required hint="Official name of the land parcel">
                <input className="alp-input" placeholder="e.g. St. Francis Parish Field" {...inp('name')} />
              </Field>
              <Field label="District" required>
                <select className="alp-input" {...inp('district')}>
                  <option value="">Select district</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="County">
                <input className="alp-input" placeholder="e.g. Kyenjojo" {...inp('county')} />
              </Field>
              <Field label="Subcounty">
                <input className="alp-input" placeholder="e.g. Kiyombya" {...inp('subcounty')} />
              </Field>
              <Field label="Village">
                <input className="alp-input" placeholder="e.g. Kicwamba" {...inp('village')} />
              </Field>
              <Field label="Parish">
                <input className="alp-input" placeholder="e.g. St. Francis Parish" {...inp('parish')} />
              </Field>
              <Field label="Outstation">
                <input className="alp-input" placeholder="e.g. Hope Outstation" {...inp('outstation')} />
              </Field>
              <Field label="Deanery">
                <input className="alp-input" placeholder="e.g. North Deanery" {...inp('deanery')} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="alp-grid-2">
                <Field label="Category" required>
                  <select className="alp-input" {...inp('category')}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Status" required>
                  <select className="alp-input" {...inp('status')}>
                    <option value="">Select status</option>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Acreage (acres)" required hint="Total land area in acres">
                  <input className="alp-input" type="number" step="0.1" min="0" placeholder="e.g. 12.5" {...inp('acreage')} />
                </Field>
                <Field label="Year of Acquisition">
                  <input className="alp-input" type="number" min="1900" max="2099" placeholder="e.g. 2005" {...inp('acquisition')} />
                </Field>
                <Field label="Last Survey Date">
                  <input className="alp-input" type="date" {...inp('lastSurvey')} />
                </Field>
              </div>
              <Field label="Remarks">
                <textarea className="alp-input alp-textarea" rows={4}
                  placeholder="Any additional notes about this parcel…" {...inp('remarks')} />
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="alp-grid-2">
              <Field label="Tenure Type" required>
                <select className="alp-input" {...inp('tenureType')}>
                  <option value="">Select tenure type</option>
                  {tenureTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Lease Type" hint="Enter N/A if not applicable">
                <input className="alp-input" placeholder="e.g. 10-year lease" {...inp('leaseType')} />
              </Field>
              <Field label="Tenant / Occupant">
                <input className="alp-input" placeholder="e.g. Parish Council" {...inp('tenant')} />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="alp-grid-2">
              <Field label="Contact Email / Phone" hint="Primary contact for this parcel">
                <input className="alp-input" placeholder="e.g. admin@parish.org or +256 700 000000" {...inp('contact')} />
              </Field>
            </div>
          )}

          {step === 5 && (
            <>
              <div className="alp-review-notice">
                <FiCheckCircle className="alp-review-notice-icon" />
                Review all details carefully before saving. Click any step above to go back and edit.
              </div>
              {[
                { group: 'Location', fields: [
                  { label: 'Parcel Name', value: form.name },
                  { label: 'District',   value: form.district },
                  { label: 'County',     value: form.county },
                  { label: 'Subcounty',  value: form.subcounty },
                  { label: 'Village',    value: form.village },
                  { label: 'Parish',     value: form.parish },
                  { label: 'Outstation', value: form.outstation },
                  { label: 'Deanery',    value: form.deanery },
                ]},
                { group: 'Details', fields: [
                  { label: 'Category',    value: form.category },
                  { label: 'Status',      value: form.status },
                  { label: 'Acreage',     value: form.acreage ? `${form.acreage} ac` : '' },
                  { label: 'Acquisition', value: form.acquisition },
                  { label: 'Last Survey', value: form.lastSurvey },
                  { label: 'Remarks',     value: form.remarks },
                ]},
                { group: 'Tenure', fields: [
                  { label: 'Tenure Type', value: form.tenureType },
                  { label: 'Lease Type',  value: form.leaseType },
                  { label: 'Tenant',      value: form.tenant },
                ]},
                { group: 'Contact', fields: [
                  { label: 'Contact', value: form.contact },
                ]},
              ].map(({ group, fields }) => (
                <div key={group} className="alp-review-group">
                  <div className="alp-review-group-title">{group}</div>
                  <div className="alp-review-grid">
                    {fields.map(({ label, value }) => (
                      <div key={label} className="alp-review-row">
                        <span className="alp-review-label">{label}</span>
                        <span className={`alp-review-value ${!value ? 'alp-review-empty' : ''}`}>
                          {value || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="alp-footer">
          <button type="button" className="alp-btn-ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            <FiChevronLeft /> Back
          </button>
          <span className="alp-footer-hint">{step} / {STEPS.length}</span>
          {step < 5
            ? <button type="button" className="alp-btn-primary" onClick={() => setStep((s) => s + 1)}>
                Continue <FiChevronRight />
              </button>
            : <button type="submit" className="alp-btn-primary alp-btn-save">
                <FiSave /> Save Record
              </button>
          }
        </div>
      </form>
    </div>
  )
}

export default AddLandPage
