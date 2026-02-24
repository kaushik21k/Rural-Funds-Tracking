# GramChain Backend API

A secure, role-based authentication system for the GramChain rural funds tracking platform.

## Features

- **Multi-role Authentication**: Government, Local Authority, Contractor, Public
- **JWT Token-based Security**: Secure authentication with token expiration
- **Role-based Access Control**: Different permissions for different user types
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Support**: Cross-origin resource sharing configuration

## User Roles & Permissions

### Government
- Create and manage projects
- Allocate funds to projects
- View all users and projects
- Full administrative access

### Local Authority
- Approve payments for milestones
- Manage local projects
- View project details and transactions
- Moderate administrative access

### Contractor
- Submit project milestones
- Request payments
- View assigned projects
- Limited project access

### Public
- View public project information
- Track fund usage
- View transactions (read-only)
- Public access only

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-token` - Verify JWT token

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Deactivate user (Admin only)
- `GET /api/users/role/:role` - Get users by role (Admin only)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Government only)
- `PUT /api/projects/:id/allocate` - Allocate funds (Government only)
- `PUT /api/projects/:id/approve-payment` - Approve payment (Local Authority only)
- `POST /api/projects/:id/milestones` - Submit milestone (Contractor only)
- `GET /api/projects/:id/transactions` - Get project transactions

## Setup Instructions

### Quick Setup
```bash
cd backend
./setup.sh
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB Atlas connection string
   ```

3. **Database Setup**
   - Follow the guide in `MONGODB_ATLAS_SETUP.md`
   - Set up MongoDB Atlas cluster
   - Update MONGODB_URI in .env

4. **Seed Database**
   ```bash
   npm run seed
   ```

5. **Run Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration time
- `FRONTEND_URL` - Frontend URL for CORS

### MongoDB Atlas Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/gramchain?retryWrites=true&w=majority
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Request throttling
- **CORS**: Cross-origin protection
- **Input Validation**: Request sanitization
- **Password Hashing**: Secure password storage
- **JWT Tokens**: Stateless authentication

## Testing

Use tools like Postman or curl to test the API endpoints:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "contractor",
    "organization": "ABC Construction"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```
