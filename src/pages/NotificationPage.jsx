import { FiBell, FiClock, FiInfo, FiShield } from 'react-icons/fi'

function NotificationPage({ notifications, selectedNotification, onOpenNotification, compact = false }) {
  return (
    <div className={compact ? 'notification-page notification-page-compact' : 'notification-page'}>
      {!compact && (
        <div className="page-header notification-header">
          <div className="page-header-content">
            <div className="page-header-icon notification-icon">
              <FiBell />
            </div>
            <div>
              <h1>Notifications</h1>
              <p>Recent alerts and messages for your Diocese.</p>
            </div>
          </div>
        </div>
      )}

      <div className="notification-list">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            className={`notification-card ${selectedNotification?.id === notification.id ? 'selected' : ''}`}
            onClick={() => onOpenNotification(notification)}
          >
            <div className="notification-card-icon" style={{ background: notification.color }}>
              {notification.icon}
            </div>
            <div className="notification-card-body">
              <div className="notification-card-title">{notification.title}</div>
              <div className="notification-card-subtitle">{notification.subtitle}</div>
            </div>
            <div className="notification-card-time">{notification.time}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default NotificationPage
