import { useState } from 'react'
import { FiSettings, FiUser, FiMapPin, FiPhone, FiMail, FiGlobe, FiUsers, FiShield, FiKey } from 'react-icons/fi'

function SettingsPage({ onNavigateToPage }) {
  const [activeTab, setActiveTab] = useState('general')

  // Mock data - in real app this would come from state/API
  const [churchInfo, setChurchInfo] = useState({
    name: 'Fort Portal Diocese',
    tagline: 'Serving the Community with Faith and Excellence',
    address: 'Fort Portal, Uganda',
    phone: '+256 414 595 945',
    email: 'info@fortportaldiocese.org',
    website: 'https://fortportaldiocese.org',
    denomination: 'Catholic',
    language: 'English',
    timezone: 'Africa/Kampala'
  })

  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', permissions: ['view', 'edit', 'delete', 'approve'], users: 2 },
    { id: 2, name: 'Pastor', permissions: ['view', 'edit'], users: 5 },
    { id: 3, name: 'Accountant', permissions: ['view', 'edit'], users: 1 },
    { id: 4, name: 'Volunteer', permissions: ['view'], users: 8 }
  ])

  const handleChurchInfoChange = (field, value) => {
    setChurchInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (roleId, field, value) => {
    setRoles(prev => prev.map(role =>
      role.id === roleId ? { ...role, [field]: value } : role
    ))
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <FiSettings />
          </div>
          <div>
            <h1>Settings</h1>
            <p>Configure church information and manage user roles</p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            type="button"
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FiSettings />
            General Church Information
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers />
            User & Role Management
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>Basic Identity and Profile Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="church-name">Church Name</label>
                  <input
                    id="church-name"
                    type="text"
                    value={churchInfo.name}
                    onChange={(e) => handleChurchInfoChange('name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tagline">Tagline</label>
                  <input
                    id="tagline"
                    type="text"
                    value={churchInfo.tagline}
                    onChange={(e) => handleChurchInfoChange('tagline', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Physical Address & GPS Location</label>
                  <div className="input-with-icon">
                    <FiMapPin />
                    <input
                      id="address"
                      type="text"
                      value={churchInfo.address}
                      onChange={(e) => handleChurchInfoChange('address', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <div className="input-with-icon">
                      <FiPhone />
                      <input
                        id="phone"
                        type="tel"
                        value={churchInfo.phone}
                        onChange={(e) => handleChurchInfoChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-with-icon">
                      <FiMail />
                      <input
                        id="email"
                        type="email"
                        value={churchInfo.email}
                        onChange={(e) => handleChurchInfoChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <div className="input-with-icon">
                    <FiGlobe />
                    <input
                      id="website"
                      type="url"
                      value={churchInfo.website}
                      onChange={(e) => handleChurchInfoChange('website', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="denomination">Denomination / Affiliation</label>
                    <input
                      id="denomination"
                      type="text"
                      value={churchInfo.denomination}
                      onChange={(e) => handleChurchInfoChange('denomination', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <select
                      id="language"
                      value={churchInfo.language}
                      onChange={(e) => handleChurchInfoChange('language', e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Swahili">Swahili</option>
                      <option value="Luganda">Luganda</option>
                      <option value="Runyankore">Runyankore</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <select
                    id="timezone"
                    value={churchInfo.timezone}
                    onChange={(e) => handleChurchInfoChange('timezone', e.target.value)}
                  >
                    <option value="Africa/Kampala">East Africa Time (UTC+3)</option>
                    <option value="Africa/Nairobi">East Africa Time (UTC+3)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="settings-section">
              <h2>Control Who Can Access What</h2>

              <div className="roles-section">
                <div className="section-header">
                  <h3>Roles & Permissions</h3>
                  <button type="button" className="btn-primary">
                    <FiUser />
                    Add New Role
                  </button>
                </div>

                <div className="roles-grid">
                  {roles.map((role) => (
                    <div key={role.id} className="role-card">
                      <div className="role-header">
                        <div className="role-icon">
                          <FiShield />
                        </div>
                        <div>
                          <h4>{role.name}</h4>
                          <span className="role-users">{role.users} users</span>
                        </div>
                      </div>

                      <div className="role-permissions">
                        <h5>Permissions:</h5>
                        <div className="permissions-list">
                          {role.permissions.map((perm) => (
                            <span key={perm} className="permission-badge">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="role-actions">
                        <button type="button" className="btn-secondary">
                          Edit Role
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="password-policy-section">
                <h3>Password Policies</h3>
                <div className="policy-settings">
                  <div className="form-group">
                    <label htmlFor="min-length">Minimum Password Length</label>
                    <input
                      id="min-length"
                      type="number"
                      defaultValue="8"
                      min="6"
                      max="20"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Require uppercase letters
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Require lowercase letters
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Require numbers
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input type="checkbox" />
                      Require special characters
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Enable password reset
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage