# Fort Portal Diocese Land Management System

A comprehensive web application for managing land holdings and inventory for the Fort Portal Diocese. Built with React, Vite, and Chart.js for data visualization.

## Features

### 🏠 Dashboard
- **Key Metrics**: Total parcels, acreage, active/reserved counts
- **Data Visualizations**: Interactive charts showing distribution by category, status, and district
- **Recent Parcels**: Quick view of latest land holdings
- **Quick Actions**: Easy navigation to detailed views

### 📊 Land Inventory
- Complete parcel listing with filtering capabilities
- Category and status-based filtering
- Detailed parcel information table
- Parcel selection for detailed review

### 🏛️ Hierarchy View
- Diocesan organizational structure
- Deanery and parish relationships
- Outstation and subparish details

### 📋 Parcel Details
- Comprehensive parcel information
- Acquisition and survey history
- Tenure and lease details
- Contact information

## Technology Stack

- **Frontend**: React 19 with Vite
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: CSS with modern design patterns
- **Data**: JSON-based data structure

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx          # Main dashboard component
│   └── ...
├── pages/
│   ├── LandInventoryPage.jsx  # Inventory management
│   ├── LandDetailPage.jsx     # Parcel details
│   └── HierarchyPage.jsx      # Organizational hierarchy
├── data/
│   └── land.js                # Land data and hierarchy
└── App.jsx                    # Main application component
```

## Data Model

The application manages land parcels with the following key attributes:
- **Categories**: Parish land, Treasury land, Commission/Institution
- **Statuses**: Active, Reserved, Inactive
- **Locations**: District, county, subcounty, parish, village
- **Tenure Types**: Freehold, Lease, Customary
- **Management**: Tenant information, lease details, contacts

## Contributing

This application serves the Fort Portal Diocese for effective land management and inventory tracking.
