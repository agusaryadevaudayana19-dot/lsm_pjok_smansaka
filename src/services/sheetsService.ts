import { getGoogleAccessToken } from './firebaseAuth';

export interface SheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: string[];
}

export const REQUIRED_SHEETS = [
  'USERS',
  'ADMIN',
  'GURU',
  'MURID',
  'KELAS',
  'MATERI',
  'TUGAS',
  'PENGUMPULAN',
  'QUIZ',
  'SOAL',
  'JAWABAN',
  'PRESENSI',
  'NILAI',
  'JURNAL',
  'NOTIFIKASI',
  'SETTING',
];

export const createPJOKSpreadsheet = async (title: string = 'LMS_PJOK_DATABASE_2026'): Promise<SheetMetadata> => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('Belum terhubung dengan akun Google. Silakan klik Sambungkan Google.');
  }

  // Create new Spreadsheet with the sheets
  const sheetsConfig = REQUIRED_SHEETS.map((sheetTitle) => ({
    properties: { title: sheetTitle },
  }));

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: sheetsConfig,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membuat Google Spreadsheet: ${response.statusText} (${errorText})`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    sheets: REQUIRED_SHEETS,
  };
};

export const syncAllDataToSpreadsheet = async (
  spreadsheetId: string,
  allData: Record<string, any[]>
): Promise<{ success: boolean; updatedSheets: number }> => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('Akses token Google tidak tersedia');
  }

  // Prepare batch value data
  const dataPayload: Array<{ range: string; values: any[][] }> = [];

  for (const sheetName of REQUIRED_SHEETS) {
    const records = allData[sheetName] || [];
    if (records.length === 0) {
      dataPayload.push({
        range: `${sheetName}!A1:Z1`,
        values: [['ID', 'DATA_KOSONG', 'TIMESTAMP']],
      });
      continue;
    }

    // Extract headers
    const sample = records[0];
    const headers = Object.keys(sample);
    const rows = records.map((item) =>
      headers.map((key) => {
        const val = item[key];
        if (typeof val === 'object' && val !== null) {
          return JSON.stringify(val);
        }
        return val !== undefined && val !== null ? String(val) : '';
      })
    );

    dataPayload.push({
      range: `${sheetName}!A1`,
      values: [headers, ...rows],
    });
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataPayload,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal sinkronisasi data: ${errText}`);
  }

  return { success: true, updatedSheets: dataPayload.length };
};

export const fetchSheetData = async (
  spreadsheetId: string,
  sheetName: string
): Promise<any[]> => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('Akses token Google tidak tersedia');
  }

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z500`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Gagal membaca sheet ${sheetName}: ${res.statusText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0];
  const items = rows.slice(1).map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((h: string, idx: number) => {
      const val = row[idx] ?? '';
      try {
        if (val.startsWith('{') || val.startsWith('[')) {
          obj[h] = JSON.parse(val);
        } else {
          obj[h] = val;
        }
      } catch {
        obj[h] = val;
      }
    });
    return obj;
  });

  return items;
};
