# Google OAuth JWT Backend

A lightweight authentication boilerplate for quickly setting up new projects with Google OAuth integration.

Built on top of the classic stack: Node.js / Express / PostgreSQL / Prisma / TypeScript

Helped me save a lot of time everytime i was struck with a blank project. So I just made it public.

##  Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:arpan-lol Google-Oauth-JWT-Backend.git "my-project"
   cd my-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google OAuth credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Select **Web application** as the application type
   - Configure the OAuth consent screen if prompted
   - Add the following URIs:
     
     **Authorized JavaScript origins:**
     ```
     http://localhost:3002
     http://localhost:3000
     ```
     
     **Authorized redirect URIs:**
     ```
     http://localhost:3002/auth/google/callback
     ```
     
     > **Note**: Add your own origins for production.
     
   - Click **Create** and download the credentials JSON file
   - Save the downloaded file as `google-creds.json` in the root.

## ⚙️ Config

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3002

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth
REDIRECT_URI=http://localhost:3002/auth/google/callback

# Frontend
FRONTEND_REDIRECT=http://localhost:3000/dashboard
```


### Google Console URI Configuration

**For Development (localhost):**

Authorized JavaScript origins:
- `http://localhost:3002` (Backend)
- `http://localhost:3000` (Frontend)

Authorized redirect URIs:
- `http://localhost:3002/auth/google/callback`

**For Production:**

Authorized JavaScript origins:
- `https://api.yourdomain.com` (Backend)
- `https://yourdomain.com` (Frontend)

Authorized redirect URIs:
- `https://api.yourdomain.com/auth/google/callback`

> ⚠️ **Important**: The redirect URI in your `.env` file **must exactly match** one of the authorized redirect URIs in Google Console, including the protocol (`http://` or `https://`)

## => Database Setup

1. **Ensure PostgreSQL is running**

2. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

3. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

## => Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```
Thats it! 

- **GET /auth/google**
  - will initiate the authentication and redirect the user to Google's login page.

- **GET /auth/google/callback?code=<authorization_code>** 
  - will be called by Google after going through the consent screen. 
  - Redirects to frontend with the JWT token( `FRONTEND_REDIRECT?jwt=<token>`) 
  - Store this short lived token in your session

- **POST /auth/refresh**
  - Refreshes an expired JWT token
  - Tokens expire after 12 hours, you may change it.
  - **Request Body**:
    ```json
    {
      "token": "expired-or-valid-jwt-token"
    }
    ```
  - **Response**:
    ```json
    {
      "token": "new-jwt-token"
    }
    ```
  - **Status Codes**:
    - `200`: Token refreshed successfully
    - `400`: Missing token
    - `401`: Invalid token or no refresh token found
    - `500`: Server error

 - ⭐ **GET /auth/me**
    - Retrieves authenticated user information
    - **Authentication**: Required (Bearer token)
    - **Headers**:
      ```
      Authorization: Bearer <jwt-token>
      ```
    - **Response**:
      ```json
      {
        "user": {
          "userId": 1,
          "email": "user@example.com",
          "name": "John Doe",
          "picture": "https://..."
        }
      }
      ```
    - **Status Codes**:
      - `200`: Success
      - `401`: Unauthorized

 - **POST /auth/logout**
    - Logs out user by removing refresh token
    - **Authentication**: Required (Bearer token)
    - **Headers**:
      ```
      Authorization: Bearer <jwt-token>
      ```
    - **Response**:
      ```json
      {
        "message": "Logged out successfully"
      }
      ```
    - **Status Codes**:
      - `200`: Logout successful
      - `401`: Unauthorized
      - `500`: Server error

## 🔐 Authentication Flow

### Initial Login Flow

```
User → GET /auth/google
     → Redirect to Google
     → User approves
     → Google redirects to /auth/google/callback
     → Backend exchanges code for tokens
     → Backend creates/updates user in DB
     → Backend generates JWT
     → Redirect to frontend with JWT
     → Frontend stores JWT
```

### Token Refresh Flow

```
Frontend (expired token) → POST /auth/refresh
                        → Backend verifies expiration
                        → Uses Google refresh token
                        → Generates new JWT
                        → Returns new JWT
```

### Protected Route Access

```
Frontend → GET /auth/me (with JWT in header)
        → Middleware verifies JWT
        → Route handler processes request
        → Returns user data
```

## Adding New Routes

1. Create route handler in `src/routes/`
2. Import and use in `src/index.ts`
3. ⭐**Use `authenticateJWT` middleware for protected routes**

Example:
```typescript
import { authenticateJWT } from '../middleware/authenticate';
import { AuthRequest } from '../types/express';

router.get('/protected', authenticateJWT, (req: AuthRequest, res) => {
  const user = req.user; // User data from JWT
  res.json({ user });
});
```

**Built with ❤️ by [Arpan](https://github.com/arpan-lol)**
