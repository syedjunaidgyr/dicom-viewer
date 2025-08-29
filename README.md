# DICOM Viewer - PACS System

A modern, web-based DICOM viewer built with Next.js, Tailwind CSS, and CornerstoneJS. This application provides a comprehensive interface for viewing, searching, and managing DICOM medical images through the Orthanc PACS server.

## Features

- 🖼️ **Advanced DICOM Viewer**: High-performance image rendering with CornerstoneJS
- 🔍 **Smart Search**: Advanced search capabilities across studies, series, and instances
- 📊 **Study Management**: Browse and organize DICOM studies by patient
- 🛠️ **Image Tools**: Pan, zoom, window/level adjustment, and rotation
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS
- 🔄 **Real-time Updates**: Live data from Orthanc PACS server
- 📥 **Download Support**: Export studies and series as ZIP archives

## Prerequisites

- Node.js 18+ and npm
- Orthanc PACS server running on `localhost:8042`
- CORS proxy server running on `localhost:8080` (for development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dicom-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Orthanc server**
   - Ensure Orthanc is running on `localhost:8042`
   - Configure CORS settings in Orthanc configuration
   - Set up authentication if required

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Configuration

### API Endpoints

The application is configured to work with the following endpoints:

- **Orthanc Base**: `http://localhost:8080/orthanc` (via CORS proxy)
- **Orthanc Direct**: `http://localhost:8042` (admin operations)
- **CORS Proxy**: `http://localhost:8080`

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_ORTHANC_BASE_URL=http://localhost:8080/orthanc
NEXT_PUBLIC_ORTHANC_DIRECT_URL=http://localhost:8042
NEXT_PUBLIC_CORS_PROXY_URL=http://localhost:8080
```

## Usage

### Main Interface

The application is organized into four main tabs:

1. **Studies**: Browse all DICOM studies with filtering and search
2. **Patients**: View studies organized by patient
3. **Search**: Advanced DICOM search with multiple criteria
4. **Viewer**: Dedicated image viewing interface

### DICOM Viewer Tools

- **Pan Tool**: Move around the image (left mouse button)
- **Zoom Tool**: Zoom in/out (right mouse button)
- **Window/Level**: Adjust image contrast and brightness
- **Rotate**: Rotate the image
- **Reset View**: Return to default view

### Search Capabilities

Search across multiple DICOM attributes:
- Patient Name and ID
- Study Description and Date
- Modality (CT, MR, XR, etc.)
- Series Description
- SOP Class UID

## API Integration

The application integrates with the Orthanc REST API using the endpoints defined in your Postman collection:

- `GET /studies` - Retrieve all studies
- `GET /studies/{id}` - Get study details
- `GET /studies/{id}/instances` - Get study instances
- `POST /tools/find` - Advanced search
- `GET /patients` - Get all patients
- `GET /instances/{id}/file` - Download DICOM files

## Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/          # React components
│   ├── DicomViewer.tsx # Main DICOM viewer
│   ├── StudyList.tsx   # Studies list component
│   ├── PatientList.tsx # Patients list component
│   └── SearchPanel.tsx # Search interface
└── config/             # Configuration files
    └── api.ts          # API configuration
```

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **CornerstoneJS**: Medical imaging library
- **Lucide React**: Icon library

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your CORS proxy is running and configured correctly
2. **Image Loading Failures**: Check Orthanc server connectivity and DICOM file accessibility
3. **Tool Activation Issues**: Verify CornerstoneJS initialization and tool registration

### Debug Mode

Enable debug logging by setting the environment variable:

```env
NEXT_PUBLIC_DEBUG=true
```

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
- Check the Orthanc documentation: https://orthanc-server.com/
- Review CornerstoneJS documentation: https://cornerstonejs.org/
- Open an issue in the repository

## Acknowledgments

- [Orthanc](https://orthanc-server.com/) - Open-source PACS server
- [CornerstoneJS](https://cornerstonejs.org/) - Medical imaging library
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
