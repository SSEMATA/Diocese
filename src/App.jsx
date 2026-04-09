import { useMemo, useState } from 'react'
import {
  FiBell, FiUser, FiHome, FiLayers, FiFileText,
  FiMapPin, FiBarChart2, FiChevronLeft, FiChevronRight,
  FiMenu, FiX,
} from 'react-icons/fi'
import './App.css'
import './pages/pages.css'
import './sidebar.css'
import landData from './data/land.js'
import { useParcels } from './hooks/useParcels.js'
import Dashboard from './components/Dashboard.jsx'
import LandInventoryPage from './pages/LandInventoryPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import HierarchyPage from './pages/HierarchyPage.jsx'
import ThemeSwitcher from './components/ThemeSwitcher.jsx'
import AddLandPage from './pages/AddLandPage.jsx'
import GlobalSearch from './components/GlobalSearch.jsx'
import SearchResultsPage from './pages/SearchResultsPage.jsx'
import SearchDetailPage from './pages/SearchDetailPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function App() {
  const [activePage, setActivePage]             = useState('Dashboard')
  const [selectedParcelId, setSelectedParcelId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen]       = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')
  const [searchResult, setSearchResult]         = useState(null)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })
  const { parcels, updateParcel } = useParcels()

  const handleSearch = (q) => { setSearchQuery(q); setSearchResult(null) }
  const handleClearSearch = () => { setSearchQuery(''); setSearchResult(null) }

  const navigate = (page) => {
    setActivePage(page)
    setMobileNavOpen(false)
  }

  const navItems = [
    { label: 'Dashboard',    page: 'Dashboard', icon: FiHome },
    { label: 'Add Land',     page: 'AddLand',   icon: FiMapPin },
    { label: 'Land Records', page: 'Inventory', icon: FiFileText },
    { label: 'Hierarchy',    page: 'Hierarchy', icon: FiLayers },
    { label: 'Reports',      page: 'Reports',   icon: FiBarChart2 },
    { label: 'Settings',     page: 'Settings',   icon: FiUser },
  ]

  if (activePage === 'Account') {
    return (
      <AccountPage
        currentUser={currentUser}
        onLogin={(user) => { setCurrentUser(user); setActivePage('Dashboard') }}
        onLogout={() => { setCurrentUser(null); localStorage.removeItem('currentUser') }}
        onClose={() => setActivePage('Dashboard')}
      />
    )
  }

  return (
    <div className="dashboard-app">

      {/* ── Mobile backdrop ── */}
      {mobileNavOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">FP</div>
          {!sidebarCollapsed && (
            <div>
              <h2>Fort Portal Diocese</h2>
              <p>Land management</p>
            </div>
          )}
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={() => setMobileNavOpen(false)}
            title="Close menu"
          >
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ label, page, icon: Icon }) => (
            <button
              key={page}
              type="button"
              className={`sidebar-link ${activePage === page ? 'active' : ''}`}
              onClick={() => navigate(page)}
              title={label}
            >
              <Icon className="sidebar-link-icon" />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-theme">
          <ThemeSwitcher collapsed={sidebarCollapsed} />
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar">{currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U'}</div>
          {!sidebarCollapsed && (
            <div className="user-card-details">
              <div className="user-name">{currentUser ? currentUser.name : 'Guest'}</div>
              <div className="user-role">{currentUser ? currentUser.role : 'Please Login'}</div>
            </div>
          )}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(p => !p)}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

        <header className="dashboard-topbar">
          <div className="topbar-left" />

          <div className="topbar-center">
            <GlobalSearch parcels={parcels} onSearch={handleSearch} />
          </div>

          <div className="topbar-actions">
            <button type="button" className="icon-btn"><FiBell /></button>
            <button type="button" className="user-pill" onClick={() => setActivePage('Account')}><FiUser /></button>
            {/* Hamburger — mobile only, right side */}
            <button
              type="button"
              className="topbar-hamburger"
              onClick={() => setMobileNavOpen(o => !o)}
              title="Menu"
            >
              <FiMenu />
            </button>
          </div>
        </header>

        <main className="app-main">
          {searchQuery && !searchResult && (
            <SearchResultsPage
              query={searchQuery}
              parcels={parcels}
              onSelectResult={setSearchResult}
              onClear={handleClearSearch}
            />
          )}
          {searchQuery && searchResult && (
            <SearchDetailPage
              item={searchResult}
              parcels={parcels}
              onBack={() => setSearchResult(null)}
              onNavigate={(page) => { setActivePage(page); handleClearSearch() }}
              onSelectResult={setSearchResult}
            />
          )}

          {!searchQuery && activePage === 'Dashboard' && (
            <Dashboard
              parcels={parcels}
              categories={landData.categories}
              statuses={landData.statuses}
              districts={landData.districts}
              onNavigateToPage={setActivePage}
            />
          )}
          {!searchQuery && activePage === 'Inventory' && (
            <LandInventoryPage
              parcels={parcels}
              categories={landData.categories}
              statuses={landData.statuses}
              selectedParcelId={selectedParcelId}
              onSelectParcel={setSelectedParcelId}
              onUpdateParcel={updateParcel}
            />
          )}
          {!searchQuery && activePage === 'AddLand' && (
            <AddLandPage
              categories={landData.categories}
              statuses={landData.statuses}
              tenureTypes={landData.tenureTypes}
              districts={landData.districts}
              onCancel={() => setActivePage('Inventory')}
            />
          )}
          {!searchQuery && activePage === 'Hierarchy' && (
            <HierarchyPage hierarchy={landData.hierarchy} />
          )}
          {!searchQuery && activePage === 'Reports' && (
            <ReportPage
              parcels={parcels}
              categories={landData.categories}
              statuses={landData.statuses}
              districts={landData.districts}
            />
          )}
          {!searchQuery && activePage === 'Settings' && (
            <SettingsPage onNavigateToPage={setActivePage} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
