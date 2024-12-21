import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sheets, spreadsheetId } from '../config/sheets';
import type { Student } from '../types/student';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    switch (req.method) {
      case 'GET':
        try {
          console.log('Fetching students data...');
          
          const range = 'Students Data!A2:H';
          console.log('Fetching range:', range);
          
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            valueRenderOption: 'UNFORMATTED_VALUE',
            dateTimeRenderOption: 'FORMATTED_STRING'
          });
          
          if (!response.data.values) {
            console.log('No data found');
            return res.status(200).json([]);
          }
          
          const rows = response.data.values;
          const students = rows.map((row: any[]) => ({
            id: String(row[0] || ''),
            studentName: String(row[1] || ''),
            level: String(row[2] || ''),
            classNumber: String(row[3] || ''),
            violations: String(row[4] || ''),
            parts: String(row[5] || ''),
            points: Number(row[6] || 0),
            phone: String(row[7] || '')
          }));

          console.log(`Successfully fetched ${students.length} students`);
          return res.status(200).json(students);
        } catch (error: any) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
          });
          throw error;
        }
        break;

      case 'POST':
        try {
          const newStudent = req.body as Student;
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
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API Error:', {
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
