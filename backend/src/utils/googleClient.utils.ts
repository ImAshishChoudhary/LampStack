import fs from 'fs';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

let googleClient: OAuth2Client;
let GOOGLE_CLIENT_ID: string = '';

try {
  const credsPath = path.join(__dirname, '../../google-creds.json');
  
  if (fs.existsSync(credsPath)) {
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    googleClient = new OAuth2Client(
      creds.web.client_id,
      creds.web.client_secret,
      process.env.REDIRECT_URI
    );
    GOOGLE_CLIENT_ID = creds.web.client_id;
  } else {
    googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    console.warn('[WARN] google-creds.json not found, using environment variables for OAuth');
  }
} catch (error) {
  console.error('[ERROR] Failed to initialize Google OAuth client:', error);
  googleClient = new OAuth2Client();
}

export { googleClient, GOOGLE_CLIENT_ID };
