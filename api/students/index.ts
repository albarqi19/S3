import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = 'AIzaSyBOXnnT1F-h9s1FP3063BQ_-TXSw14z_Kg';
const SPREADSHEET_ID = '1JVHUXf23kQ0ZVu8Hc1g-sqrMCUwHufw4Bj4KKGyd_j4';

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
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${formattedRange}?key=${API_KEY}&majorDimension=ROWS`;

      console.log('Fetching sheet data:', {
        sheetName,
        rangeNotation: range,
        formattedRange,
        url: url.replace(API_KEY, '***')
      });

      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', {
        range: data.range,
        rowCount: data.values?.length,
        hasData: !!data.values
      });

      if (!data.values) {
        return res.status(200).json([]);
      }

      const students = data.values.map((row: any[]) => ({
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
      try {
        const newStudent = req.body;
        console.log('Adding new student:', newStudent);
        
        const sheetName = 'Students Data';
        const range = 'A2:H';
        const formattedRange = `${encodeURIComponent(sheetName)}!${range}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${formattedRange}?key=${API_KEY}&majorDimension=ROWS`;

        console.log('Fetching sheet data:', {
          sheetName,
          rangeNotation: range,
          formattedRange,
          url: url.replace(API_KEY, '***')
        });

        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', {
          range: data.range,
          rowCount: data.values?.length,
          hasData: !!data.values
        });

        if (!data.values) {
          throw new Error('No data found in the sheet');
        }

        const rows = data.values;
        const newRowIndex = rows.length + 1;
        
        // Add new student
        const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${formattedRange}:append?key=${API_KEY}&majorDimension=ROWS`;
        const appendResponse = await fetch(appendUrl, {
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

        console.log('Append response status:', appendResponse.status);
        console.log('Append response headers:', Object.fromEntries(appendResponse.headers.entries()));

        if (!appendResponse.ok) {
          throw new Error(`HTTP error! status: ${appendResponse.status}`);
        }

        return res.status(200).json(newStudent);
      } catch (error: any) {
        console.error('Error adding student:', {
          message: error.message,
          stack: error.stack
        });
        throw error;
      }
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
