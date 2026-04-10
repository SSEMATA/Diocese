import { useEffect, useRef, useState } from 'react'
import {
  FiBell, FiUser, FiHome, FiLayers, FiFileText,
  FiMapPin, FiBarChart2, FiChevronLeft, FiChevronRight,
  FiMenu, FiX, FiClock, FiShield,
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
import NotificationPage from './pages/NotificationPage.jsx'
import NotificationDetailPage from './pages/NotificationDetailPage.jsx'

const notifications = [
  {
    id: 'notif-1',
    title: 'New Parish Land Added',
    subtitle: 'Kabarole parish now has a new registered parcel',
    message: 'A new parcel was successfully registered under Kabarole parish. Review the details and assign a status for survey.',
    time: '5 minutes ago',
    color: '#2563eb',
    icon: <FiBell />,
  },
  {
    id: 'notif-2',
    title: 'Pending Survey Reminder',
    subtitle: 'Survey needed for Treasury land in Kamwenge',
    message: 'The Kamwenge treasury parcel requires a survey appointment before it can be approved. Please assign a surveyor.',
    time: '12 minutes ago',
    color: '#f59e0b',
    icon: <FiClock />,
  },
  {
    id: 'notif-3',
    title: 'User Access Request',
    subtitle: 'Volunteer account request pending approval',
    message: 'A volunteer has requested access to the system. Review their role and permissions before granting access.',
    time: '30 minutes ago',
    color: '#16a34a',
    icon: <FiShield />,
  },
]

function App() {
  const [selectedParcelId, setSelectedParcelId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen]       = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')
  const [searchResult, setSearchResult]         = useState(null)
  const [activePage, setActivePage]             = useState(() => {
    const savedPage = localStorage.getItem('activePage')
    const validPages = ['Dashboard', 'Inventory', 'AddLand', 'Hierarchy', 'Reports', 'Settings', 'Notifications', 'NotificationDetail', 'Account']
    const page = savedPage && validPages.includes(savedPage) ? savedPage : 'Dashboard'
    if (page === 'NotificationDetail') {
      const savedNotificationId = localStorage.getItem('activeNotificationId')
      if (!savedNotificationId || !notifications.find((notification) => notification.id === savedNotificationId)) {
        return 'Notifications'
      }
    }
    return page
  })
  const [activeNotification, setActiveNotification] = useState(() => {
    const savedNotificationId = localStorage.getItem('activeNotificationId')
    return savedNotificationId ? notifications.find((notification) => notification.id === savedNotificationId) : null
  })
  const [isNotificationsModalOpen, setNotificationsModalOpen] = useState(false)
  const [isTopbarVisible, setTopbarVisible] = useState(true)
  const scrollRef = useRef(window?.scrollY ?? 0)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) {
        setTopbarVisible(true)
        return
      }

      const currentScroll = window.scrollY
      const lastScroll = scrollRef.current
      const scrolledDown = currentScroll > lastScroll + 8
      const scrolledUp = currentScroll < lastScroll - 8

      if (scrolledDown) {
        setTopbarVisible(false)
      } else if (scrolledUp) {
        setTopbarVisible(true)
      }

      scrollRef.current = Math.max(currentScroll, 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    localStorage.setItem('activePage', activePage)
  }, [activePage])

  useEffect(() => {
    if (activeNotification) {
      localStorage.setItem('activeNotificationId', activeNotification.id)
    } else {
      localStorage.removeItem('activeNotificationId')
    }
  }, [activeNotification])

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen || isNotificationsModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen, isNotificationsModalOpen])
  const { parcels, updateParcel } = useParcels()

  const handleSearch = (q) => { setSearchQuery(q); setSearchResult(null) }
  const handleClearSearch = () => { setSearchQuery(''); setSearchResult(null) }

  const navigate = (page) => {
    setActivePage(page)
    setMobileNavOpen(false)
  }

  const toggleMobileNav = () => {
    if (!mobileNavOpen) {
      setSidebarCollapsed(false)
    }
    setMobileNavOpen((prev) => !prev)
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
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.page}
                type="button"
                className={`sidebar-link ${activePage === item.page ? 'active' : ''}`}
                onClick={() => navigate(item.page)}
                title={item.label}
              >
                <Icon className="sidebar-link-icon" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
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
          {!mobileNavOpen && (
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={() => setSidebarCollapsed(p => !p)}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

        <header className={`dashboard-topbar ${isTopbarVisible ? 'visible' : 'hidden'}`}>
          <div className="topbar-left" />

          <div className="topbar-center">
            <GlobalSearch parcels={parcels} onSearch={handleSearch} />
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="icon-btn notification-bell-btn"
              onClick={() => setNotificationsModalOpen(true)}
              title="View notifications"
            >
              <FiBell />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            <button type="button" className="user-pill" onClick={() => setActivePage('Account')}><FiUser /></button>
            {/* Hamburger — mobile only, right side */}
            <button
              type="button"
              className="topbar-hamburger"
              onClick={toggleMobileNav}
              title="Menu"
            >
              <FiMenu />
            </button>
          </div>
          {isNotificationsModalOpen && (
            <>
              <div className="notification-modal-backdrop" onClick={() => setNotificationsModalOpen(false)} />
              <div className="notification-modal">
                <div className="notification-modal-header">
                  <div>
                    <h3>Notifications</h3>
                    <p>Recent alerts for your Diocese.</p>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setNotificationsModalOpen(false)}
                    aria-label="Close notifications"
                  >
                    <FiX />
                  </button>
                </div>
                <NotificationPage
                  notifications={notifications}
                  selectedNotification={activeNotification}
                  compact
                  onOpenNotification={(notification) => {
                    setActiveNotification(notification)
                    setNotificationsModalOpen(false)
                    setActivePage('NotificationDetail')
                  }}
                />
              </div>
            </>
          )}
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
              onNavigateToPage={setActivePage}
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
          {!searchQuery && activePage === 'Notifications' && (
            <NotificationPage
              notifications={notifications}
              selectedNotification={activeNotification}
              onOpenNotification={(notification) => {
                setActiveNotification(notification)
                setActivePage('NotificationDetail')
              }}
            />
          )}
          {!searchQuery && activePage === 'NotificationDetail' && (
            <NotificationDetailPage
              notification={activeNotification}
              onBack={() => setActivePage('Notifications')}
            />
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
        <footer className="dashboard-footer">
          <div className="footer-copy">
            © 2026 Fort Portal Diocese. Built for land stewardship and parish management.
          </div>
          <div className="footer-links">
            <button type="button" className="footer-link" onClick={() => setActivePage('Settings')}>Settings</button>
            <button type="button" className="footer-link" onClick={() => setActivePage('Dashboard')}>Home</button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
