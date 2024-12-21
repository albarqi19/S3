import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "kedma-439@sonic-momentum-292409.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCz4MeFaHIpDGZl\nVBwPeehblFoCz2fyRzOO9v6nHVPioy2wGI1/h0tsDuicCNLXxwhtITZ8mdaSOULn\nyEKh38fhc81dYjfv9LQfWmaXDgVWcttAXAldxRCDg8Aj6YIew7BsRm51GnXCgkGb\nNc419UvzhiBtxeTrYhn/LmyZ7pbx/M1GAaAYphRoxqk90Ki6VMXGqcLpS8sKRBTa\nrmSxkF0ZeOuubhoO8wcD1ITtKygvpKRCjKOrcvn5"
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

export const sheets = google.sheets({ version: 'v4', auth });
export const spreadsheetId = "1JVHUXf23kQ0ZVu8Hc1g-sqrMCUwHufw4Bj4KKGyd_j4";