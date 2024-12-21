import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = 'AIzaSyDLnUtcYqHo9bMGafkKyUd4108OzNf9u4U';
const SPREADSHEET_ID = '1JVHUXf23kQ0ZVu8Hc1g-sqrMCUwHufw4Bj4KKGyd_j4';
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

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
      
      const sheetName = 'Students Data';
      const range = 'A2:H';
      const formattedRange = `${encodeURIComponent(sheetName)}!${range}`;
      
      const url = new URL(`${BASE_URL}/${SPREADSHEET_ID}/values/${formattedRange}`);
      url.searchParams.append('key', API_KEY);
      url.searchParams.append('majorDimension', 'ROWS');
      
      console.log('Fetching sheet data:', {
        sheetName,
        rangeNotation: range,
        formattedRange,
        url: url.toString().replace(API_KEY, '***')
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      // طباعة تفاصيل الاستجابة للتشخيص
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: url.toString().replace(API_KEY, '***')
        });
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();
      
      // طباعة البيانات المستلمة للتشخيص
      console.log('Received data:', {
        range: data.range,
        rowCount: data.values?.length,
        hasData: !!data.values
      });

      if (!data.values) {
        return res.status(200).json([]);
      }

      const students = data.values.map(row => ({
        id: row[0]?.toString() || '',
        studentName: row[1]?.toString() || '',
        level: row[2]?.toString() || '',
        classNumber: row[3]?.toString() || '',
        violations: row[4]?.toString() || '',
        parts: row[5]?.toString() || '',
        points: parseInt(row[6]?.toString() || '0'),
        phone: row[7]?.toString() || ''
      }));

      return res.status(200).json(students);
    }

    if (req.method === 'POST') {
      const newStudent = req.body;
      console.log('Adding new student:', newStudent);
      
      const sheetName = 'Students Data';
      const range = 'A2:H';
      const formattedRange = `${encodeURIComponent(sheetName)}!${range}`;
      
      // Get current data first
      const getUrl = new URL(`${BASE_URL}/${SPREADSHEET_ID}/values/${formattedRange}`);
      getUrl.searchParams.append('key', API_KEY);
      getUrl.searchParams.append('majorDimension', 'ROWS');
      
      const getResponse = await fetch(getUrl.toString());
      if (!getResponse.ok) {
        throw new Error(`Failed to get current data: ${getResponse.status}`);
      }
      
      const currentData = await getResponse.json();
      const rows = currentData.values || [];
      const newRowIndex = rows.length + 2; // +2 because we start from A2
      
      // Append the new student
      const appendUrl = new URL(`${BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}!A${newRowIndex}:H${newRowIndex}:append`);
      appendUrl.searchParams.append('key', API_KEY);
      appendUrl.searchParams.append('valueInputOption', 'RAW');
      appendUrl.searchParams.append('insertDataOption', 'INSERT_ROWS');
      
      const appendResponse = await fetch(appendUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
        })
      });
      
      if (!appendResponse.ok) {
        const errorText = await appendResponse.text();
        throw new Error(`Failed to append data: ${appendResponse.status} - ${errorText}`);
      }
      
      return res.status(200).json(newStudent);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
