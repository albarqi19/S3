import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SHEETS_CONFIG } from '../../src/config/sheets.config';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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
    // Initialize auth
    const serviceAccountAuth = new JWT({
      email: 'nafes-service@nafes-412822.iam.gserviceaccount.com',
      key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDKXwBvEMoqfPP4\nOYB3JyZEcJKFLe+tUhIJHOqV4/2SAZYQEQzqHC3l7+zfIqX/h8Jq2xhHhQQZBOZw\nZKPovz3oGGrUbZxuGPsqPyErvXJTIqGXwjvLMcGdDY6VlXz3xYzqX6+LGxVF5Iyh\nTkKGBkYPo6XhPZqf+QrLKEHvVsWfBYQzU+0IPV+dXbBBGUkH7PB/q/EFq6+klHDp\nYKEOoWQxesBWQGYXJzmCUVYPh9l6TeYy2IXgLHDTRQvJHHXPNhPHN5hYXhPRGrE6\nYQZJ5WiGSQYhYP1UOJ5UYZXwkgqvlWZH+EwQS6ekqTtQVGYIQR+FSEvGQYXwNYqD\nzWKOYxvjAgMBAAECggEABUJ/FZ5YHhHXPn0+/FYeHQ2mvZwqb8VMtYGgGOMDUr3A\nPHVWwXCqvAM7zC7qfdXBQontTFqYwsUL/uUZQYWu5XL/UGDLcKZEZFm6ZPKnvjYS\nXVOGQKpuJvZ+0YEF/DYgQHHZVXWmRXjyuQNak+0GQj9lfDGDyfJ2XvH7AZsZyS9l\nwGGDYZsD/N6HRtKgwEBXpEgRKUQkP4rRXrwUVCEtqh7+y8OZXz/ZZcfy8dOAxnBo\nEVPEPzdd3EQFEGdF4IXVKkuUBzHFVXvLPdlcwgWkXXsYFq+8MgUXvsLEKS0fBxXw\nxkBRZYBLbFEXtF1X4MBIRuGvxUZYHWfE4xfUUhvPYQKBgQDnCELJHfkGXuGvh5Cw\nVBpYHQT/X0JJXAHxEiQqbpZVeQxLk8iGUyFEv1oWwqUUcKj9MHwVSEQNK9TJpvJ4\nB7/coaK6UOTEVVLhQXx3p7FFtmJ+LNzVQ0vbKZLUxTHciYFd1Jyw5o/HEeK+h2Yk\nPJHKAYZH9c+ODSGaZnp8KRKQYQKBgQDgLwRpGf6HHmxub1dKXVqeVRGZVNLc1WQm\nKQNGRJEVVoDUElOYKPrR8eg/SaQAiZvkH2JQpZMQQBJEUhzYDRJwuSPsXQTmLlhE\nPLlDVZq/Ug7VeRGXXfGJcZ2SAOuqXTEEGQghyYJbVJGPnNvj9ixuGwKELJ+hgAGn\nUfzQhpQZwwKBgQCIlVtHYi/+UzVVXhEqx6Wm+qwHYRDjRFZBzYRlyJGZHtJCQ1+w\nqQVhXhXvSqJ5OFBfGUYxzE4mNn7LJXgxwPUG9GGXZVtD9KZo+4FPrTMJqLJHhEYj\nBWPQyC3NqGQ6wFBUqfXxZmGkuQTlNgQYQYRz4p2TYBCpGy0ORcO1BNEFwQKBgFqK\nOOeq1GXBSi7/jOUzpGqZQZyZJHcbVEhAc6aRqVvRbqCxfE7hoNnhqZH0KyVPBVIL\nkqRgkF5xGtFJxkZ9JPcIKhpBQFDhNTJzDDvxYtaiUu6BVjVVi4hAXFE1hGBsHUyf\nEVlhHkXEuKDZQQd5RZHlaMXTIZgEABWPGTW8GDVrAoGALTlgqVHKvLqaVHnvlph8\n0Qf9/tIqxJqDQZVpN8R/FE6OIWPPXcKhxNZFLGtjEWe0+K/Y0Jz4xCjYL0ZUzAGk\nFXX4PwCnxUAqwQb1sF4RNogxrG4ryNqzqTmzVOaVGvz/uJTcAhkwkzuVpnAoaQZd\nCqXwK6Sjj+wVL4eeXDYXdAQ=\n-----END PRIVATE KEY-----\n',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(SHEETS_CONFIG.spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Students Data'];
    if (!sheet) {
      throw new Error('Sheet not found');
    }

    if (req.method === 'GET') {
      console.log('Starting GET request for students');
      
      const rows = await sheet.getRows();
      console.log('Successfully fetched students data:', {
        rowCount: rows.length
      });

      const students = rows.map(row => ({
        id: row.get('id') || '',
        studentName: row.get('studentName') || '',
        level: row.get('level') || '',
        classNumber: row.get('classNumber') || '',
        violations: row.get('violations') || '',
        parts: row.get('parts') || '',
        points: parseInt(row.get('points') || '0'),
        phone: row.get('phone') || ''
      }));

      return res.status(200).json(students);
    }

    if (req.method === 'POST') {
      const newStudent = req.body;
      console.log('Adding new student:', newStudent);

      const row = await sheet.addRow({
        id: newStudent.id,
        studentName: newStudent.studentName,
        level: newStudent.level,
        classNumber: newStudent.classNumber,
        violations: newStudent.violations || '',
        parts: newStudent.parts || '',
        points: newStudent.points || 0,
        phone: newStudent.phone || ''
      });

      return res.status(200).json({
        id: row.get('id'),
        studentName: row.get('studentName'),
        level: row.get('level'),
        classNumber: row.get('classNumber'),
        violations: row.get('violations'),
        parts: row.get('parts'),
        points: parseInt(row.get('points') || '0'),
        phone: row.get('phone')
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
