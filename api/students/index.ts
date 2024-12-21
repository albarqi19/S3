import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SHEETS_CONFIG } from '../../src/config/sheets.config';

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

async function fetchSheetData(range: string) {
  try {
    const sheetName = range.split('!')[0];
    const rangeNotation = range.split('!')[1];
    const formattedRange = `${encodeURIComponent(sheetName)}!${rangeNotation}`;
    
    const url = new URL(`${BASE_URL}/${SHEETS_CONFIG.spreadsheetId}/values/${formattedRange}`);
    url.searchParams.append('key', SHEETS_CONFIG.apiKey);
    url.searchParams.append('majorDimension', 'ROWS');
    
    console.log('Fetching sheet data:', {
      sheetName,
      rangeNotation,
      formattedRange,
      url: url.toString().replace(SHEETS_CONFIG.apiKey, '***')
    });
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: url.toString().replace(SHEETS_CONFIG.apiKey, '***')
      });
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', {
      range,
      rowCount: data.values?.length || 0,
      hasData: !!data.values
    });

    return data.values || [];
  } catch (error) {
    console.error('Sheet fetch error:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      console.log('Starting GET request for students');
      
      const data = await fetchSheetData(SHEETS_CONFIG.ranges.students);
      console.log('Successfully fetched students data:', {
        rowCount: data.length
      });

      // تخطي الصف الأول (عناوين الأعمدة)
      const students = data.slice(1).map(row => ({
        id: row[0]?.toString() || '',
        studentName: row[1]?.toString() || '',
        level: row[2]?.toString() || '',
        classNumber: row[3]?.toString() || '',
        violations: row[4]?.toString() || '',
        parts: row[5]?.toString() || '',
        points: parseInt(row[6]?.toString() || '0'),
        phone: row[7]?.toString() || ''
      })).filter(student => student.id); // إرجاع فقط الطلاب الذين لديهم معرف

      return res.status(200).json(students);
    }

    if (req.method === 'POST') {
      const newStudent = req.body;
      console.log('Adding new student:', newStudent);
      
      // Get current data first
      const data = await fetchSheetData(SHEETS_CONFIG.ranges.students);
      const newRowIndex = data.length + 1; // +1 because we start from A1
      
      // Append the new student
      const appendUrl = new URL(`${BASE_URL}/${SHEETS_CONFIG.spreadsheetId}/values/Students!A${newRowIndex}:H${newRowIndex}:append`);
      appendUrl.searchParams.append('key', SHEETS_CONFIG.apiKey);
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
      
      return res.status(200).json({
        id: newStudent.id,
        studentName: newStudent.studentName,
        level: newStudent.level,
        classNumber: newStudent.classNumber,
        violations: newStudent.violations || '',
        parts: newStudent.parts || '',
        points: newStudent.points || 0,
        phone: newStudent.phone || ''
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
