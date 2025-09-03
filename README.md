# DICOM Viewer with Enhanced Study List

A professional medical imaging viewer built with Next.js, featuring an enhanced study list interface similar to OHIF, button evaluator for intelligent button state management, and Cornerstone.js integration for advanced DICOM viewing capabilities.

## Features

### 🏥 Enhanced Study List
- **Dark Theme Interface**: Professional medical imaging interface with dark theme
- **Advanced Filtering**: Filter studies by patient name, MRN, study date, description, modality, and accession number
- **Selected Study Details**: Detailed view of selected study with comprehensive information
- **Series Information**: Display series details with modality and instance counts
- **Copy Functionality**: Copy instance counts and other data to clipboard

### 🎯 Button Evaluator
- **Intelligent Button States**: Automatically enables/disables buttons based on study characteristics
- **Modality-Based Logic**: Different tools available based on imaging modality (CT, MR, US, etc.)
- **Study Content Analysis**: Analyzes study descriptions and content to determine available tools
- **Dynamic Tool Availability**: Buttons are enabled/disabled in real-time as studies are selected

### 🔬 Multiple Viewer Modes
- **Basic Viewer**: Standard DICOM viewing with pan, zoom, and window/level controls
- **Segmentation**: Advanced tools for CT and MR studies with measurement capabilities
- **Annotations**: Specialized tools for ultrasound studies and annotations
- **Metabolic Analysis**: Tools for PET/CT studies and tumor volume analysis
- **Microscopy**: High-resolution image tools for histological studies
- **Preclinical 4D**: Research tools for preclinical studies and time-series data

### 🖼️ Cornerstone.js Integration
- **Professional DICOM Rendering**: High-quality medical image display
- **Advanced Tools**: Measurement, annotation, and analysis tools
- **Multi-Series Support**: Navigate between different series within a study
- **Responsive Design**: Optimized for various screen sizes and devices

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dicom-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Prerequisites

### Orthanc PACS Server
This application requires a running Orthanc PACS server. Make sure you have:

- Orthanc server running on `http://localhost:8080`
- DICOM studies loaded into Orthanc
- CORS properly configured for local development

### Cornerstone.js Dependencies
The following Cornerstone.js packages are included:
- `@cornerstonejs/core`: Core rendering engine
- `@cornerstonejs/tools`: Measurement and annotation tools
- `@cornerstonejs/dicom-image-loader`: DICOM image loading and decoding

## Usage

### 1. Study List Interface
- Navigate to `/studies` to view the enhanced study list
- Use the filter controls at the top to search for specific studies
- Click on any study row to select it and view details

### 2. Button Evaluator
The button evaluator automatically determines which tools are available:
- **Basic Viewer**: Always available for all studies
- **Segmentation**: Available for CT and MR studies
- **Annotations**: Available for ultrasound studies
- **Metabolic Analysis**: Available for PET/CT and tumor studies
- **Microscopy**: Available for high-resolution and histological studies
- **Preclinical 4D**: Available for research studies with multiple time points

### 3. Viewer Modes
Click on any enabled button to open the appropriate viewer mode:
- Each mode provides specialized tools and interface elements
- Navigate between series using the series navigation panel
- Use the back button to return to the study list

## Architecture

### Components
- **`EnhancedStudyList`**: Main study list interface with filtering and selection
- **`ButtonEvaluator`**: Invisible component that manages button states
- **`CornerstoneViewer`**: DICOM viewer with Cornerstone.js integration
- **`Navigation`**: Consistent navigation across the application

### State Management
- Study selection and viewer mode state
- Button availability states based on study characteristics
- Series and instance data for the selected study

### API Integration
- RESTful API calls to Orthanc PACS server
- Study, series, and instance data fetching
- DICOM file loading for viewer display

## Configuration

### Orthanc Server
Update the Orthanc server URL in the components if needed:
```typescript
const ORTHANC_BASE_URL = 'http://localhost:8080/orthanc'
```

### Button Evaluation Rules
Modify the button evaluation logic in `ButtonEvaluator.tsx`:
```typescript
// Example: Add new modality support
if (modalities.includes('XR')) {
  buttonStates.xray = true
}
```

## Development

### Adding New Viewer Modes
1. Add the new mode to the type definition
2. Update the button evaluator logic
3. Implement the viewer component
4. Add the mode to the studies page

### Customizing Button States
Modify the `ButtonEvaluator` component to add new evaluation rules based on:
- Study modality
- Study description keywords
- Instance count thresholds
- Series characteristics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation
- Review the code examples
- Open an issue on GitHub

## Roadmap

- [ ] Multi-viewport support
- [ ] Advanced measurement tools
- [ ] Report generation
- [ ] Export functionality
- [ ] User authentication
- [ ] Study comparison tools
