# API Integration Guide - Feedback Management Backend

> Frontend integration documentation for the Feedback Management Backend (Frill.io-style feedback platform)

## Table of Contents
1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Token Management](#token-management)
8. [Implementation Guide](#implementation-guide)

---

## Overview

The Feedback Management Backend is a production-grade FastAPI application providing authentication and user management for a Frill.io-style feedback platform.

### Tech Stack
- **Framework**: FastAPI 0.115.0
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt

### Key Features
- ✅ User Registration & Login
- ✅ JWT-based Authentication (Access + Refresh Tokens)
- ✅ User Session Management
- ✅ Role-based User Model (admin, moderator, member)
- ✅ Redis caching support
- ✅ CORS enabled

---

## Configuration

### Base URL

```
Development:   http://localhost:8000
Production:    {YOUR_PRODUCTION_URL}
API Version:   v1
```

### API Documentation
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **Health Check**: `/health`

### CORS Setup
The backend supports CORS for frontend integration. Ensure your frontend URL is configured in the backend's `ALLOWED_ORIGINS` environment variable.

**Default CORS Origins**: `http://localhost:3000`

### Environment Variables (Frontend needs to know)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Base URL for API calls | `http://localhost:8000` |
| `REACT_APP_ENV` | Environment | `development` |

---

## Authentication Flow

### Overview Diagram

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ├─→ [1] Register/Login
       │        ↓
       ├─→ [2] Receive Access + Refresh Tokens
       │        ↓
       ├─→ [3] Store tokens (localStorage/sessionStorage)
       │        ↓
       ├─→ [4] Use Access Token for authenticated requests
       │        ↓
       └─→ [5] On expiry, use Refresh Token to get new Access Token
```

### Token Details

| Token Type | Duration | Usage | Storage |
|-----------|----------|-------|---------|
| **Access Token** | 15 minutes | API requests (Authorization header) | localStorage/sessionStorage |
| **Refresh Token** | 7 days | Obtain new access tokens | localStorage/sessionStorage (secure) |

### Token Format
- **Type**: JWT (JSON Web Token)
- **Algorithm**: HS256
- **Signature**: HMAC with SHA-256

### Token Payload Structure

```json
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "exp": 1234567890,
  "type": "access" // or "refresh"
}
```

---

## API Endpoints

### 1. **Register User**

**Endpoint**: `POST /api/v1/auth/register`

**Purpose**: Create a new user account

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules**:
- **Name**: 1-255 characters
- **Email**: Valid email format
- **Password**: 8-128 characters

**Success Response** (201 Created):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "avatar_url": null,
    "created_at": "2026-04-28T10:30:45+00:00"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

**Error Response** (400/409):
```json
{
  "detail": "Email already registered"
}
```

---

### 2. **Login User**

**Endpoint**: `POST /api/v1/auth/login`

**Purpose**: Authenticate user and receive tokens

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "avatar_url": null,
    "created_at": "2026-04-28T10:30:45+00:00"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Invalid credentials"
}
```

---

### 3. **Refresh Access Token**

**Endpoint**: `POST /api/v1/auth/refresh`

**Purpose**: Get a new access token using refresh token

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Could not validate credentials"
}
```

---

### 4. **Get Current User**

**Endpoint**: `GET /api/v1/auth/me`

**Purpose**: Retrieve authenticated user's profile

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "member",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2026-04-28T10:30:45+00:00"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Could not validate credentials"
}
```

---

### 5. **Logout User**

**Endpoint**: `POST /api/v1/auth/logout`

**Purpose**: Invalidate user session and tokens

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "message": "Successfully logged out"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Could not validate credentials"
}
```

---

### 6. **Health Check**

**Endpoint**: `GET /health`

**Purpose**: Check API server status

**Success Response** (200 OK):
```json
{
  "status": "ok",
  "env": "development"
}
```

---

## Request/Response Examples

### Example 1: Complete Authentication Flow (JavaScript/Fetch)

```javascript
// 1. Register
async function register(name, email, password) {
  const response = await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  
  if (!response.ok) throw new Error('Registration failed');
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', data.tokens.access_token);
  localStorage.setItem('refresh_token', data.tokens.refresh_token);
  
  return data.user;
}

// 2. Login
async function login(email, password) {
  const response = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', data.tokens.access_token);
  localStorage.setItem('refresh_token', data.tokens.refresh_token);
  
  return data.user;
}

// 3. Get current user
async function getCurrentUser() {
  const accessToken = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/api/v1/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshAccessToken();
      return getCurrentUser(); // Retry
    }
    throw new Error('Failed to get current user');
  }
  
  return await response.json();
}

// 4. Refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  
  if (!response.ok) {
    // Refresh token expired, redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    return;
  }
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
}

// 5. Logout
async function logout() {
  const accessToken = localStorage.getItem('access_token');
  
  await fetch('http://localhost:8000/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
```

### Example 2: Using Axios with Interceptors (React)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| **200** | OK | Request succeeded |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid request data (validation error) |
| **401** | Unauthorized | Missing/invalid token or credentials |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Email already registered |
| **500** | Server Error | Internal server error |

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Scenarios

#### 1. Invalid Email Format
```json
{
  "detail": "Invalid email format"
}
```

#### 2. Password Too Short
```json
{
  "detail": "Password must be at least 8 characters"
}
```

#### 3. Email Already Registered
```json
{
  "detail": "Email already registered"
}
```

#### 4. Invalid Credentials
```json
{
  "detail": "Invalid credentials"
}
```

#### 5. Invalid/Expired Token
```json
{
  "detail": "Could not validate credentials"
}
```

### Error Handling Strategy

```javascript
async function handleAPICall(apiFunction, context = {}) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.error('Session expired');
      window.location.href = '/login';
    } else if (error.response?.status === 400) {
      // Validation error
      console.error('Validation error:', error.response.data.detail);
      return { error: error.response.data.detail };
    } else if (error.response?.status === 409) {
      // Conflict
      console.error('Conflict:', error.response.data.detail);
      return { error: error.response.data.detail };
    } else {
      // Other errors
      console.error('API Error:', error.message);
      return { error: 'An unexpected error occurred' };
    }
  }
}
```

---

## Token Management

### Token Storage Strategy

**Recommended**: Use localStorage for access_token (short-lived) and refresh_token (longer-lived)

```javascript
// Store tokens after login/register
localStorage.setItem('access_token', tokens.access_token);
localStorage.setItem('refresh_token', tokens.refresh_token);

// Retrieve tokens
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

// Clear tokens on logout
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### Token Expiration Handling

**Access Token**: 15 minutes
- Expires after 15 minutes of being issued
- Use refresh token to get a new one

**Refresh Token**: 7 days
- Expires after 7 days
- User must log in again after expiration

### Automatic Token Refresh

```javascript
// Implement automatic refresh before expiration
function decodeToken(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function setupAutoRefresh() {
  setInterval(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const decoded = decodeToken(accessToken);
      const expiresIn = (decoded.exp * 1000) - Date.now();
      
      // Refresh if token expires in less than 2 minutes
      if (expiresIn < 120000) {
        refreshAccessToken();
      }
    }
  }, 60000); // Check every minute
}
```

---

## Implementation Guide

### Step 1: Setup Environment Variables

Create `.env.local` in your frontend project:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
```

### Step 2: Create API Service Module

```javascript
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Add request interceptor for token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
        return apiClient(error.config);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Step 3: Create Auth Service

```javascript
// services/authService.js
import apiClient from '../api/client';

export const authService = {
  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    const { tokens, user } = response.data;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    return user;
  },

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    const { tokens, user } = response.data;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    return user;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
```

### Step 4: Implement Authentication in React

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        const user = await authService.getCurrentUser();
        setUser(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    checkAuth,
  };
}
```

---

## Security Considerations

### ✅ Best Practices

- ✅ Always use HTTPS in production
- ✅ Store tokens securely (localStorage or sessionStorage)
- ✅ Validate email format before submission
- ✅ Enforce strong password requirements (min 8 chars)
- ✅ Implement automatic token refresh before expiration
- ✅ Handle 401 errors by redirecting to login
- ✅ Clear tokens on logout
- ✅ Use CORS headers properly
- ✅ Implement rate limiting on frontend (throttle requests)
- ✅ Keep API base URL as environment variable

### ⚠️ Security Headers

The backend includes:
- ✅ CORS enabled
- ✅ Bearer token authentication
- ✅ Password hashing (bcrypt)
- ✅ JWT token expiration

### 🔒 Production Checklist

- [ ] Change SECRET_KEY in production
- [ ] Use HTTPS only
- [ ] Set ALLOWED_ORIGINS to your frontend domain
- [ ] Enable Rate Limiting
- [ ] Monitor token refresh patterns
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Enable audit logging
- [ ] Regular security updates

---

## Support & Troubleshooting

### Common Issues

**Q: "Invalid credentials" error on login**
- A: Verify email and password are correct

**Q: "Could not validate credentials" on authenticated requests**
- A: Access token expired, refresh using refresh token

**Q: CORS error when calling API**
- A: Ensure frontend URL is in ALLOWED_ORIGINS environment variable

**Q: Tokens not persisting after page reload**
- A: Check localStorage settings, ensure cookies not disabled

### API Documentation
- **Swagger**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Health Check
```bash
curl http://localhost:8000/health
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-28 | Initial release - Auth endpoints |

---

**Last Updated**: 2026-04-28  
**Maintainer**: Backend Team  
**Status**: ✅ Production Ready
