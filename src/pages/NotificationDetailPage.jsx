import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

function NotificationDetailPage({ notification, onBack }) {
  if (!notification) {
    return (
      <div className="notification-page">
        <div className="page-header notification-header">
          <div className="page-header-content">
            <div className="page-header-icon notification-icon">
              <FiCheckCircle />
            </div>
            <div>
              <h1>No Notification Selected</h1>
              <p>Select a notification from the list to view details.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="notification-page notification-detail-page">
      <div className="notification-detail-back">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="page-header notification-header">
        <div className="page-header-content">
          <div className="page-header-icon notification-icon detail-icon">
            {notification.icon}
          </div>
          <div>
            <h1>{notification.title}</h1>
            <p>{notification.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="notification-detail-body">
        <p className="notification-detail-time">{notification.time}</p>
        <div className="notification-detail-text">
          {notification.message}
        </div>
      </div>
    </div>
  )
}

export default NotificationDetailPage
