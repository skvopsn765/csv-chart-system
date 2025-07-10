# CSV Chart System

A simple and user-friendly CSV data visualization system that allows users to upload CSV files and generate real-time charts.

## 📋 Features

- 📊 **Real-time Chart Generation** - Generate line charts or bar charts immediately after uploading CSV files
- 🔄 **Multi-axis Selection** - Support selecting any X-axis and multiple Y-axis fields
- 🎨 **Chart Type Switching** - Support both line charts and bar charts
- 🔍 **Smart Data Detection** - Automatically identify numeric fields and text fields
- 🛡️ **Secure File Upload** - Complete file validation and error handling
- ⚡ **High Performance** - Smooth rendering of up to 5,000 data records

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern user interface
- **Recharts** - High-performance charting library
- **CSS3** - Responsive design and modern styling

### Backend
- **Node.js + Express** - Lightweight API server
- **Multer** - File upload handling
- **PapaParse** - CSV file parsing
- **Helmet** - Security middleware
- **CORS** - Cross-origin request handling

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn

### Installation Steps

1. **Clone Project**
   ```bash
   git clone <repository-url>
   cd csv-chart-system
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Backend Server**
   ```bash
   cd ../backend
   npm run dev
   ```
   Backend server will run at http://localhost:5000

5. **Start Frontend Application**
   ```bash
   cd ../frontend
   npm start
   ```
   Frontend app will run at http://localhost:3000

## 📁 Project Structure

```
csv-chart-system/
├── frontend/                 # React frontend app
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── CSVUploader.js
│   │   │   ├── FieldSelector.js
│   │   │   └── ChartDisplay.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── routes/
│   │   └── csvRoutes.js
│   ├── server.js
│   └── package.json
├── sample-data.csv          # Sample data file
├── .gitignore
└── README.md
```

## 🔧 How to Use

1. **Upload CSV File**
   - Click "Choose CSV File" button
   - Select a CSV file that meets format requirements
   - System will automatically upload and parse the file

2. **Select Chart Fields**
   - Select one field from X-axis dropdown
   - Select one or more numeric fields from Y-axis checkboxes
   - System will automatically detect field types

3. **View and Switch Charts**
   - Default display: Line chart
   - Click button to switch to Bar chart
   - Charts update in real-time

## 📊 CSV File Format Requirements

- **File Format**: .csv
- **File Size**: Maximum 10MB
- **Data Records**: Maximum 5,000 records
- **Encoding**: UTF-8
- **First Row**: Must be column headers
- **Column Limit**: Maximum 100 columns

### Sample CSV Format

```csv
Date,Revenue,Cost,Profit
2024/01/01,1000,500,500
2024/01/02,1200,600,600
2024/01/03,900,450,450
```

## 🔒 Security Considerations

- File type validation
- File size limits
- Data record limits
- CORS configuration
- Request rate limiting
- Input data sanitization

## 🐛 Common Issues

### Q: Why can't my CSV file be uploaded?
A: Please check if the file meets format requirements (.csv extension, UTF-8 encoding, first row as column headers)

### Q: Why can't some fields be selected as Y-axis?
A: Y-axis can only select numeric fields. System automatically detects field types (requires 70%+ data to be numbers)

### Q: Chart display is incomplete?
A: Check if data contains invalid values. System automatically converts invalid values to 0

### Q: How to modify file size limit?
A: Modify the `MAX_FILE_SIZE` constant in `backend/routes/csvRoutes.js`

## 🔄 Development Commands

### Backend Development
```bash
cd backend
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Frontend Development
```bash
cd frontend
npm start        # Start development server
npm run build    # Build production version
npm test         # Run tests
```

## 📝 API Endpoints

### POST /api/upload-csv
Upload CSV file and parse data

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: csvFile (file)

**Response**:
```json
{
  "success": true,
  "message": "CSV file uploaded successfully",
  "data": {
    "columns": ["Date", "Revenue", "Cost", "Profit"],
    "rows": [
      {"Date": "2024/01/01", "Revenue": 1000, "Cost": 500, "Profit": 500}
    ],
    "summary": {
      "totalRows": 1,
      "totalColumns": 4,
      "fileName": "data.csv",
      "fileSize": 1024
    }
  }
}
```

### GET /api/test
Test API connection status

### GET /health
Health check endpoint

## 🌟 Future Enhancement Plans

- [ ] User authentication system
- [ ] Chart export functionality (PNG/JPEG)
- [ ] More chart types (Pie chart, Radar chart)
- [ ] Responsive mobile interface
- [ ] Multi-language support
- [ ] Database storage functionality
- [ ] Chart customization options
- [ ] Data preview table
- [ ] Batch file processing

## 📄 License

MIT License

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

---

**Developer**: Your Team  
**Version**: 1.0.0  
**Last Updated**: 2024 