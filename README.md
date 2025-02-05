# Service Shield

A modern service monitoring and incident management platform built with React and TypeScript.

## Features

### 🚀 Core Features
- **Service Monitoring**: Real-time status tracking for all your services
- **Incident Management**: Report and track incidents with detailed updates
- **Maintenance Scheduling**: Plan and communicate maintenance windows
- **Team Management**: Collaborate with role-based access control
- **Metrics Visualization**: Track incident trends with interactive graphs
- **Authentication**: Secure login system with session management

### 💡 Technical Highlights
- Built with React + TypeScript for type safety
- Modern UI components with Shadcn UI
- Responsive design that works on all devices
- Interactive data visualization with Recharts
- Clean and maintainable code structure
- Comprehensive error handling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/service-shield.git
cd service-shield
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Demo Credentials
- Email: demo@example.com
- Password: demo123

## Usage Guide

### 1. Authentication
- Visit the landing page
- Click "Get Started"
- Use demo credentials to log in
- Access the dashboard

### 2. Core Features
- **Service Status**: Monitor your services' health in real-time
- **Incident Reporting**: Create and track incidents
  - Click "Report Incident"
  - Fill in incident details
  - Track status updates
- **Maintenance**: Schedule and manage maintenance windows
  - Click "Schedule Maintenance"
  - Set maintenance time window
  - Assign affected services
- **Team Management**: Manage team members and roles
  - Click "Manage Teams"
  - Invite new members
  - Assign roles (Admin, Member, Viewer)

### 3. Dashboard Navigation
- Overview tab shows service status and key metrics
- Incidents tab displays active and resolved incidents
- Maintenance tab shows scheduled maintenance
- Teams tab manages team members and roles

## Project Structure
```
src/
├── components/         # Reusable UI components
├── pages/             # Main application pages
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── styles/            # Global styles and themes
```

## Technologies Used
- **Frontend**: React, TypeScript
- **Routing**: React Router
- **UI Components**: Shadcn UI
- **State Management**: React Hooks
- **Data Visualization**: Recharts
- **Authentication**: Local Storage (Demo)
- **Build Tool**: Vite

## 🐳 Docker Deployment

### Quick Start with Docker

Pull and run the image directly:
```bash
docker run -p 8080:80 yourusername/service-shield:latest
```
Visit http://localhost:8080 in your browser.

### Build Locally

1. Clone the repository:
```bash
git clone https://github.com/yourusername/service-shield.git
cd service-shield
```

2. Build the Docker image:
```bash
docker build -t service-shield .
```

3. Run the container:
```bash
docker run -p 8080:80 service-shield
```

### Docker Compose (Optional)

Create a docker-compose.yml:
```yaml
version: '3.8'
services:
  app:
    image: yourusername/service-shield:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### Environment Variables

The application uses the following environment variables:
- None required for basic setup
- Add any custom variables in the Dockerfile or at runtime

### Docker Tags

- `latest`: Most recent stable release
- `dev`: Development branch (may be unstable)
- `x.x.x`: Specific version releases

## Future Improvements
1. Backend Integration
   - Real authentication system
   - Database persistence
   - API endpoints

2. Enhanced Features
   - Real-time updates
   - Email notifications
   - Advanced metrics
   - Custom themes
   - Advanced permissions

3. Additional Functionality
   - Service dependencies
   - Automated status checks
   - Incident templates
   - Report generation

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
