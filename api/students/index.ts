import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: "sonic-momentum-292409",
    private_key_id: "b2a4d9c5c8d9e6f3a2b1c4d5e6f3a2b1c4d5e6f3",
    client_email: "kedma-439@sonic-momentum-292409.iam.gserviceaccount.com",
    client_id: "123456789012345678901",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/kedma-439%40sonic-momentum-292409.iam.gserviceaccount.com",
    private_key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCz4MeFaHIpDGZl
VBwPeehblFoCz2fyRzOO9v6nHVPioy2wGI1/h0tsDuicCNLXxwhtITZ8mdaSOULn
yEKh38fhc81dYjfv9LQfWmaXDgVWcttAXAldxRCDg8Aj6YIew7BsRm51GnXCgkGb
Nc419UvzhiBtxeTrYhn/LmyZ7pbx/M1GAaAYphRoxqk90Ki6VMXGqcLpS8sKRBTa
rmSxkF0ZeOuubhoO8wcD1ITtKygvpKRCjKOrcvn5
-----END PRIVATE KEY-----`
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = "1JVHUXf23kQ0ZVu8Hc1g-sqrMCUwHufw4Bj4KKGyd_j4";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('Starting GET request');
      
      try {
        console.log('Attempting to fetch data from Google Sheets');
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Students Data!A2:H',
          valueRenderOption: 'FORMATTED_VALUE',
          dateTimeRenderOption: 'FORMATTED_STRING'
        });

        console.log('Google Sheets response received:', {
          status: response.status,
          hasData: !!response.data,
          rowCount: response.data.values?.length || 0
        });

        const rows = response.data.values || [];
        const students = rows.map(row => ({
          id: row[0]?.toString() || '',
          studentName: row[1]?.toString() || '',
          level: row[2]?.toString() || '',
          classNumber: row[3]?.toString() || '',
          violations: row[4]?.toString() || '',
          parts: row[5]?.toString() || '',
          points: parseInt(row[6]?.toString() || '0'),
          phone: row[7]?.toString() || ''
        }));

        console.log('Data processed successfully');
        return res.status(200).json(students);
      } catch (error: any) {
        console.error('Error in GET request:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        throw error;
      }
    }

    if (req.method === 'POST') {
      try {
        const newStudent = req.body;
        console.log('Adding new student:', newStudent);
        
        const range = 'Students Data!A2:H';
        
        // Get current data
        const currentData = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range
        });
        
        const rows = currentData.data.values || [];
        const newRowIndex = rows.length + 2;
        
        // Add new student
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Students Data!A${newRowIndex}:H${newRowIndex}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              newStudent.id,
              newStudent.studentName,
              newStudent.level,
              newStudent.classNumber,
              newStudent.violations || '',
              newStudent.parts || '',
              newStudent.points || 0,
              newStudent.phone || ''
            ]]
          }
        });
        
        return res.status(200).json(newStudent);
      } catch (error: any) {
        console.error('Error adding student:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        throw error;
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Fatal API Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
