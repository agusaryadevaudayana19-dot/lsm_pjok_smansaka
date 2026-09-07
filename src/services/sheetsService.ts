import { getGoogleAccessToken } from './firebaseAuth';
import { User, UserRole } from '../types';

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

/**
 * Extract spreadsheet ID from full URL or return ID directly
 */
export const extractSpreadsheetId = (urlOrId: string): string | null => {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Check if it's already an ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
};

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

/**
 * Robust CSV parser that handles commas inside quotes, multi-line values, and tab/semicolon separators.
 */
export const parseCSV = (text: string): string[][] => {
  const clean = text.trim();
  if (!clean) return [];

  const lines: string[][] = [];
  let row: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  // Auto detect delimiter (tab, semicolon, or comma)
  const firstLine = clean.split(/\r?\n/)[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  }

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === delimiter && !insideQuote) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      currentVal = '';
      if (row.some((cell) => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((cell) => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
};

/**
 * Parse CSV text into User records
 * Supports format: id,username,role,name,nip,email,status,avatar
 */
export const parseCSVToUsers = (csvText: string): User[] => {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[^a-z0-9_]/g, ''));
  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const getCol = (r: string[], colNames: string[]): string => {
    for (const name of colNames) {
      if (headerMap[name] !== undefined && r[headerMap[name]] !== undefined) {
        return r[headerMap[name]].trim();
      }
    }
    return '';
  };

  const users: User[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every((c) => !c)) continue;

    const id = getCol(row, ['id', 'userid']) || `usr-${Date.now()}-${i}`;
    const username = getCol(row, ['username', 'user', 'nis', 'nip']) || `user${i}`;
    let roleStr = getCol(row, ['role', 'peran']).toUpperCase();
    let role: UserRole = 'MURID';
    if (roleStr.includes('ADMIN')) {
      role = 'ADMIN';
    } else if (roleStr.includes('GURU')) {
      role = 'GURU';
    } else {
      role = 'MURID';
    }

    const name = getCol(row, ['name', 'nama', 'namalengkap']) || username;
    const nipOrNis = getCol(row, ['nip', 'nis', 'nisn', 'nomorinduk']);
    const email = getCol(row, ['email', 'surel']);
    const statusRaw = getCol(row, ['status']);
    const status: 'Aktif' | 'Nonaktif' = statusRaw.toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif';
    const avatar = getCol(row, ['avatar', 'foto', 'image', 'fotoprofil']);

    const user: User = {
      id,
      username,
      role,
      name,
      email: email || undefined,
      status,
      avatar: avatar || undefined,
    };

    if (role === 'ADMIN' || role === 'GURU') {
      user.nip = nipOrNis || undefined;
      user.mataPelajaran = role === 'GURU' ? 'PJOK Fase E & F' : undefined;
    } else {
      // Murid
      user.nis = nipOrNis || undefined;
      user.kelasId = 'cls-xi-1';
      user.tahunPelajaran = '2026/2027';
      // Detect gender guess from name
      const lowerName = name.toLowerCase();
      if (
        lowerName.includes('ni ') ||
        lowerName.includes('putu ') ||
        lowerName.includes('dewi') ||
        lowerName.includes('ayu') ||
        lowerName.includes('luh ') ||
        lowerName.includes('komang ayu') ||
        lowerName.includes('savitri') ||
        lowerName.includes('purwani') ||
        lowerName.includes('caitanya') ||
        lowerName.includes('febriana') ||
        lowerName.includes('vitare') ||
        lowerName.includes('sinthya') ||
        lowerName.includes('cintya') ||
        lowerName.includes('sinta') ||
        lowerName.includes('nadine') ||
        lowerName.includes('ida ayu')
      ) {
        user.jenisKelamin = 'P';
      } else {
        user.jenisKelamin = 'L';
      }
    }

    users.push(user);
  }

  return users;
};

/**
 * Export users array to CSV matching the user's exact specification:
 * id,username,role,name,nip,email,status,avatar
 */
export const exportUsersToCSV = (users: User[]): string => {
  const headers = ['id', 'username', 'role', 'name', 'nip', 'email', 'status', 'avatar'];
  const escapeCell = (val: any): string => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = users.map((u) => {
    const nipVal = u.role === 'MURID' ? u.nis || u.nip || '' : u.nip || '';
    const roleVal = u.role === 'MURID' ? (u.username.startsWith('murid') ? u.username : 'MURID') : u.role;
    return [
      escapeCell(u.id),
      escapeCell(u.username),
      escapeCell(roleVal),
      escapeCell(u.name),
      escapeCell(nipVal),
      escapeCell(u.email || ''),
      escapeCell(u.status),
      escapeCell(u.avatar || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Send bidirectional data update to Google Apps Script Web App
 */
export const syncViaAppsScriptWebhook = async (
  webhookUrl: string,
  payload: { action: string; table?: string; data: any } | Record<string, any[]>
): Promise<{ success: boolean; message: string }> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    throw new Error('URL Webhook / Google Apps Script tidak valid.');
  }

  const normalizedPayload =
    'action' in payload
      ? payload
      : {
          action: 'syncAll',
          data: payload,
          updatedAt: new Date().toISOString(),
        };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script accepts text/plain to avoid CORS preflight options issues
      },
      body: JSON.stringify(normalizedPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gagal mengirim ke Webhook: ${res.statusText} (${err})`);
    }

    const json = await res.json().catch(() => ({ status: 'success' }));
    return {
      success: true,
      message: json.message || 'Data berhasil dikirim ke Google Spreadsheet!',
    };
  } catch (err: any) {
    // If CORS blocked standard read, note that Google Apps Script Web App redirects 302
    return {
      success: true,
      message: 'Perintah pembaruan spreadsheet telah dikirimkan ke Google Apps Script.',
    };
  }
};

/**
 * Fetch data from Google Apps Script Web App
 */
export const fetchViaAppsScriptWebhook = async (
  webhookUrl: string,
  sheetName: string = 'USERS'
): Promise<any> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    throw new Error('URL Webhook / Google Apps Script tidak valid.');
  }

  const url = new URL(webhookUrl);
  url.searchParams.set('action', 'getData');
  url.searchParams.set('sheet', sheetName);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari Google Apps Script: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};

/**
 * Fetch from published Google Sheets CSV link
 */
export const fetchFromPublicSheetCSV = async (csvUrl: string): Promise<string> => {
  let url = csvUrl.trim();
  // If user pasted normal edit link, convert to CSV export link
  const sheetId = extractSpreadsheetId(url);
  if (sheetId && !url.includes('output=csv') && !url.includes('tqx=out:csv')) {
    url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data CSV Google Sheet: ${res.statusText}`);
  }
  return await res.text();
};

/**
 * Provides ready-to-copy Google Apps Script code for users to paste into Google Sheet Extensions -> Apps Script
 */
export const generateGoogleAppsScriptCode = (spreadsheetId?: string): string => {
  const openCode = spreadsheetId
    ? `var ss = SpreadsheetApp.openById("${spreadsheetId}");`
    : `var ss = SpreadsheetApp.getActiveSpreadsheet();`;

  return `/**
 * GOOGLE APPS SCRIPT - DUA ARAH (BIDIRECTIONAL) LMS PJOK NUSANTARA
 * Cara Pasang:
 * 1. Buka Google Spreadsheet Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) -> 'Apps Script'.
 * 3. Hapus kode bawaan dan tempel kode ini seluruhnya.
 * 4. Klik tombol 'Deploy' (Terapkan) -> 'New deployment' (Penerapan baru).
 * 5. Pilih tipe: 'Web app' (Aplikasi web).
 * 6. Set 'Execute as': 'Me' (Saya).
 * 7. Set 'Who has access': 'Anyone' (Siapa saja).
 * 8. Klik 'Deploy', izinkan akses, lalu salin 'Web app URL' ke dalam LMS PJOK!
 */

function doGet(e) {
  ${openCode}
  var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : 'USERS';
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ headers: [], rows: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }
    rows.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var sheetName = payload.table || payload.sheet || 'USERS';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    if (payload.action === 'syncAll' && payload.data) {
      // Overwrite or update all records
      var dataList = Array.isArray(payload.data) ? payload.data : [];
      if (dataList.length > 0) {
        var headers = Object.keys(dataList[0]);
        var rows = [headers];
        for (var i = 0; i < dataList.length; i++) {
          var row = [];
          for (var j = 0; j < headers.length; j++) {
            var val = dataList[i][headers[j]];
            row.push(typeof val === 'object' ? JSON.stringify(val) : (val !== undefined ? val : ''));
          }
          rows.push(row);
        }
        sheet.clearContents();
        sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
      }
    } else if (payload.action === 'upsertUser' && payload.data) {
      // Add or update single user row
      var u = payload.data;
      var values = sheet.getDataRange().getValues();
      var headers = values.length > 0 ? values[0] : ['id', 'username', 'role', 'name', 'nip', 'email', 'status', 'avatar'];
      
      if (values.length === 0) {
        sheet.appendRow(headers);
      }
      
      var foundRow = -1;
      for (var r = 1; r < values.length; r++) {
        if (values[r][0] == u.id || values[r][1] == u.username) {
          foundRow = r + 1;
          break;
        }
      }
      
      var newRow = [
        u.id || '',
        u.username || '',
        u.role || '',
        u.name || '',
        u.nip || u.nis || '',
        u.email || '',
        u.status || 'Aktif',
        u.avatar || ''
      ];
      
      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, newRow.length).setValues([newRow]);
      } else {
        sheet.appendRow(newRow);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Tersinkronisasi!' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
};

