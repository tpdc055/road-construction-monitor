# PNG Road Construction Monitor - GPS Data Entry System

A comprehensive GPS data collection application for Papua New Guinea road construction projects, featuring real-time location capture, interactive mapping, bulk data import, and mobile photo documentation.

## 🌟 Features

### 🛰️ Real-time GPS Location Capture
- Browser Geolocation API integration
- Automatic coordinate population with accuracy indicators
- GPS quality validation (Excellent/Good/Fair/Poor)
- Error handling for various GPS scenarios

### 🗺️ Interactive Map Visualization
- Leaflet-based interactive maps
- Color-coded markers by work type
- Click-to-view detailed point information
- Advanced filtering and search capabilities
- GeoJSON export for GIS applications

### 📤 Bulk Data Import
- CSV template download and validation
- Batch processing with error reporting
- Preview functionality before import
- Support for all GPS data fields

### 📷 Mobile Photo Documentation
- Direct camera access for site documentation
- Professional photography guidance
- Multiple photo support (up to 5 per entry)
- Photo gallery with metadata

### 💾 Advanced Data Management
- LocalStorage database simulation
- Multiple export formats (CSV, GeoJSON)
- Advanced search and filtering
- Record management and analytics

## 🚀 Technology Stack

- **Framework**: Next.js 15.3.2 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Mapping**: Leaflet with React-Leaflet
- **Data Processing**: PapaParse for CSV handling
- **Build Tool**: Bun for fast package management
- **Deployment**: Vercel-ready static export

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/tpdc055/road-construction-monitor.git
cd road-construction-monitor

# Install dependencies
bun install

# Start development server
bun run dev
```

## 🔧 Development

```bash
# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linting
bun run lint
```

## 📱 Usage

### GPS Data Entry
1. Navigate to the GPS Data Entry section
2. Select a project from the dropdown
3. Use "Get Current Location" to capture GPS coordinates automatically
4. Fill in task details and work type
5. Add photos using the camera or upload functionality
6. Save to database

### Map Visualization
1. Navigate to "GPS Points Map" in the Field Operations menu
2. View all collected GPS points on an interactive map
3. Use filters to narrow down by project or work type
4. Click markers to view detailed information
5. Export data as GeoJSON for GIS applications

### Bulk Import
1. Click "Bulk Import" toggle in GPS Data Entry
2. Download the CSV template
3. Fill template with your GPS data
4. Upload and validate before importing
5. Review and process bulk data

### Data Management
1. Navigate to "View GPS Records"
2. Search and filter existing records
3. Export data as CSV
4. Manage individual records

## 🌐 Deployment

This application is configured for Vercel deployment with static export:

```bash
# Build for deployment
bun run build

# The built files will be in the 'out' directory
```

### Vercel Configuration
The app uses Next.js static export (`output: 'export'`) and is fully compatible with Vercel's static hosting.

## 🏗️ Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── GPSDataEntry.tsx # Main data entry form
│   │   ├── GPSCapture.tsx  # GPS location capture
│   │   ├── GPSMap.tsx      # Interactive map component
│   │   ├── BulkImport.tsx  # CSV import functionality
│   │   ├── PhotoCapture.tsx # Mobile photo capture
│   │   ├── DataViewer.tsx  # Data management interface
│   │   └── MapView.tsx     # Map visualization page
│   └── lib/
│       ├── database.ts     # Database simulation layer
│       └── utils.ts        # Utility functions
├── public/                 # Static assets
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies and scripts
```

## 🎯 Key Components

### GPSDataEntry
Main form component with project selection, GPS capture, and data entry.

### GPSCapture
Handles browser Geolocation API integration with accuracy validation.

### GPSMap
Interactive Leaflet map with custom markers and popups.

### BulkImport
CSV import system with validation and batch processing.

### PhotoCapture
Mobile camera integration for site documentation.

### DataViewer
Comprehensive data management with search and export capabilities.

## 📊 Data Structure

GPS records include:
- Project information and task details
- Precise coordinates (latitude, longitude, altitude, accuracy)
- Work type categorization
- Description and notes
- Collection metadata (date, collector)
- Photo attachments

## 🔒 Security & Privacy

- GPS data stored locally in browser
- No external data transmission
- Camera access requires user permission
- All data remains on user's device

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

Built for Papua New Guinea Department of Works road construction monitoring.

## 🆘 Support

For technical support or feature requests, please create an issue in the GitHub repository.

---

**Professional GPS data collection for PNG road construction projects** 🛣️🏗️
