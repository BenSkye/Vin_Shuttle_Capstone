# Technical Context - Backend

## Technologies Used

### Core Technologies
- **Framework**: NestJS (Node.js framework)
- **Language**: TypeScript
- **Database**: MongoDB
- **API Documentation**: Swagger
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Features**: WebSocket
- **Version Control**: Git

### Supporting Technologies
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **API Testing**: Postman/Insomnia
- **Package Manager**: npm/yarn
- **Process Manager**: PM2 (for production)
- **Code Quality**: ESLint, Prettier
- **Documentation**: Swagger/OpenAPI

## Development Setup
1. **Environment Requirements**
   - Node.js (Latest LTS version)
   - MongoDB installation
   - Git
   - IDE (VS Code recommended)

2. **Project Setup**
   ```bash
   npm install           # Install dependencies
   npm run start:dev    # Start development server
   ```

3. **Environment Configuration**
   - MongoDB connection settings
   - JWT secret keys
   - API keys
   - Port configurations
   - Environment-specific variables

4. **Development Tools**
   - VS Code Extensions:
     - ESLint
     - Prettier
     - TypeScript support
     - MongoDB tools
   - Postman/Insomnia for API testing
   - MongoDB Compass for database management

## Technical Constraints

### System Constraints
1. **Geographic Limitation**
   - Services limited to VinHome Grand Park area
   - Location-based features restricted to complex boundaries

2. **Performance Requirements**
   - Real-time tracking latency < 2 seconds
   - API response time < 500ms
   - Support for concurrent users

3. **Security Requirements**
   - JWT authentication
   - Role-based access control
   - Data encryption
   - Secure password storage

### Infrastructure Constraints
1. **Scalability**
   - Horizontal scaling capability
   - Load balancing requirements
   - Database sharding considerations

2. **Availability**
   - High availability requirements
   - Fault tolerance mechanisms
   - Backup and recovery procedures

3. **Integration Requirements**
   - External API dependencies
   - Payment gateway integration
   - Maps and location services

### Technical Limitations
1. **Real-time Updates**
   - WebSocket connection stability
   - Network dependency
   - Mobile data requirements

2. **Data Storage**
   - MongoDB document size limits
   - Index size constraints
   - Query performance considerations

3. **API Constraints**
   - Rate limiting
   - Request size limitations
   - Authentication timeout limits
