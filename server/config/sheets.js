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
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCz4MeFaHIpDGZl\nVBwPeehblFoCz2fyRzOO9v6nHVPioy2wGI1/h0tsDuicCNLXxwhtITZ8mdaSOULn\nyEKh38fhc81dYjfv9LQfWmaXDgVWcttAXAldxRCDg8Aj6YIew7BsRm51GnXCgkGb\nNc419UvzhiBtxeTrYhn/LmyZ7pbx/M1GAaAYphRoxqk90Ki6VMXGqcLpS8sKRBTa\nrmSxkF0ZeOuubhoO8wcD1ITtKygvpKRCjKOrcvn5"
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

export const sheets = google.sheets({ version: 'v4', auth });
export const spreadsheetId = "1JVHUXf23kQ0ZVu8Hc1g-sqrMCUwHufw4Bj4KKGyd_j4";