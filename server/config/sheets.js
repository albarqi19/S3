import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

export const sheets = google.sheets({ version: 'v4', auth });
export const spreadsheetId = process.env.GOOGLE_SHEETS_ID;