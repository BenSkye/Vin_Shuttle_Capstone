# System Patterns - Backend

## Architecture Patterns

### 1. Modular Architecture
- Separate modules for each domain:
  - Users
  - Vehicles
  - Pricing 
  - Authentication
  - OTP
  - Vehicle Categories
- Each module is self-contained with its own:
  - Controllers
  - Services
  - DTOs
  - Schemas
  - Repositories
- Clear separation of concerns
- Easy to maintain and scale

### 2. Repository Pattern
- Data access abstraction layer
- Clean separation between business logic and data access
- Consistent interface for database operations
- Examples:
  - `pricing.repo.ts`
  - `users.repo.ts`
  - `vehicles.repo.ts`

### 3. DTO Pattern
- Data Transfer Objects for API request/response
- Input validation and type safety
- Clear contract between client and server
- Examples:
  - `users.dto.ts`
  - `pricing.dto.ts`
  - `vehicle-category.dto.ts`

### 4. Schema Pattern
- MongoDB schemas for data modeling
- Define document structure and validation
- Type definitions for database models
- Examples:
  - `users.schema.ts`
  - `pricing.schema.ts`

### 5. Service Pattern
- Business logic encapsulation
- Service layer abstraction
- Single Responsibility Principle
- Examples:
  - `app.service.ts`
  - Auth service
  - User service

### 6. Controller Pattern
- API endpoint definitions
- Request handling and routing
- Response formatting
- Examples:
  - `app.controller.ts`
  - `vehicle-category.controller.ts`

### 7. Middleware Pattern
- Request/Response pipeline processing
- Authentication and authorization
- Request validation
- Error handling
- Logging and monitoring

### 8. Validation Pattern
- Input validation using decorators
- Custom validation pipes
- Schema-based validation
- Examples:
  - `pricing.validation.ts`
  - Custom validators

### 9. Configuration Pattern
- Environment-based configuration
- Centralized config management
- Type-safe configuration
- Examples:
  - `mongodb.config.ts`
  - `swagger.config.ts`

### 10. Error Handling Pattern
- Centralized error handling
- Custom exception filters
- Consistent error responses
- HTTP status code mapping
