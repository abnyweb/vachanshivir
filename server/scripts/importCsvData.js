import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function runImport() {
  const dumpDir = path.join(__dirname, '../imports/dump');
  if (!fs.existsSync(dumpDir)) {
    fs.mkdirSync(dumpDir, { recursive: true });
  }

  const filesMap = [
    { src: 'd:/PROJECTS/RUNNING PROJECTS/FY 26-27/aipc-2023-2026-09-11.csv', year: '2023' },
    { src: 'd:/PROJECTS/RUNNING PROJECTS/FY 26-27/aipc-2023-sep-2026-09-11.csv', year: '2023' },
    { src: 'd:/PROJECTS/RUNNING PROJECTS/FY 26-27/aipc-2024-2-2026-09-11.csv', year: '2024' },
    { src: 'd:/PROJECTS/RUNNING PROJECTS/FY 26-27/aipc-2024-2026-09-11.csv', year: '2024' },
    { src: 'd:/PROJECTS/RUNNING PROJECTS/FY 26-27/aipc-2026-2026-09-11.csv', year: '2026' }
  ];

  let totalRecords = 0;
  const allRegistrations = [];
  const allAttendees = [];

  // Copy files to dump directory if they exist
  filesMap.forEach((item) => {
    if (fs.existsSync(item.src)) {
      const filename = path.basename(item.src);
      const dest = path.join(dumpDir, filename);
      fs.copyFileSync(item.src, dest);
      console.log(`[Import] Copied ${filename} -> server/imports/dump/`);
    }
  });

  // Read all CSV files in server/imports/dump/
  const filesInDump = fs.readdirSync(dumpDir).filter((f) => f.endsWith('.csv') || f.endsWith('.xlsx'));

  filesInDump.forEach((file) => {
    const filePath = path.join(dumpDir, file);
    if (!file.endsWith('.csv')) return; // handled via CSV

    let year = '2026';
    if (file.includes('2023')) year = '2023';
    else if (file.includes('2024')) year = '2024';

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    const header = parseCSVLine(lines[0].replace(/^\uFEFF/, ''));

    for (let i = 1; i < lines.length; i++) {
      const vals = parseCSVLine(lines[i]);
      if (vals.length < 5) continue;

      const row = {};
      header.forEach((h, idx) => {
        const cleanKey = h.replace(/^"|"$/g, '').trim();
        row[cleanKey] = (vals[idx] || '').replace(/^"|"$/g, '').trim();
      });

      const firstName = row['Name (First)'] || '';
      const lastName = row['Name (Last)'] || '';
      const fullName = `${firstName} ${lastName}`.trim() || row['Name'] || 'Delegate';
      const email = row['Email'] || '';
      const phone = row['Phone'] || '';

      if (!email && !phone && !firstName && !lastName) continue;

      const entryId = row['Entry Id'] || `${year}_${i}`;
      const regId = `reg_${year}_${entryId}`;
      const attId = `att_${year}_${entryId}`;
      const reference = `#AIPC${year}-${String(entryId).padStart(5, '0')}`;

      const rawPayStatus = (row['Payment Status'] || '').toLowerCase();
      const hasTxn = Boolean(row['Transaction Id'] && row['Transaction Id'].length > 2);
      const isPaid = rawPayStatus === 'paid' || hasTxn || parseFloat(row['Payment Amount'] || row['Total'] || '0') > 0;
      const paymentStatus = isPaid ? 'paid' : 'pending';

      const amountPaid = parseFloat(row['Payment Amount'] || row['Total'] || row['Payment amount'] || '0') || 0;

      const regRecord = {
        id: regId,
        reference,
        eventId: `aipc-${year}`,
        year,
        edition: `AIPC ${year}`,
        firstName,
        lastName,
        name: fullName,
        email,
        phone,
        age: row['Age'] ? parseInt(row['Age'], 10) : undefined,
        gender: row['Gender'] || '',
        streetAddress: row['Address (Street Address)'] || '',
        addressLine2: row['Address (Address Line 2)'] || '',
        city: row['Address (City)'] || '',
        state: row['Address (State / Province)'] || '',
        pincode: row['Address (ZIP / Postal Code)'] || '',
        country: row['Address (Country)'] || 'India',
        churchName: row['Church Name'] || '',
        organisation: row['Church Name'] || '',
        denomination: row['Church Denomination'] || '',
        role: row['Role'] || 'Delegate',
        accommodationType: row['Accommodation Type'] || '',
        categoryId: `cat_${(row['Accommodation Type'] || 'regular').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        paymentStatus,
        total: amountPaid,
        totalAmount: amountPaid,
        amountPaid,
        transactionId: row['Transaction Id'] || '',
        entryDate: row['Entry Date'] || row['Registration Date'] || `${year}-01-01`,
        dateUpdated: row['Date Updated'] || '',
        sourceUrl: row['Source Url'] || '',
        status: isPaid ? 'CONFIRMED' : 'PENDING'
      };

      const attRecord = {
        id: attId,
        reference,
        registrationId: regId,
        eventId: `aipc-${year}`,
        year,
        edition: `AIPC ${year}`,
        name: fullName,
        firstName,
        lastName,
        email,
        phone,
        age: regRecord.age,
        gender: regRecord.gender,
        city: regRecord.city,
        state: regRecord.state,
        pincode: regRecord.pincode,
        country: regRecord.country,
        churchName: regRecord.churchName,
        organisation: regRecord.churchName,
        denomination: regRecord.denomination,
        role: regRecord.role,
        categoryId: regRecord.categoryId,
        paymentStatus,
        attendanceIntention: isPaid ? 'ATTENDING' : 'NOT_VERIFIED',
        checkInStatus: 'not-checked-in',
        whatsappStatus: isPaid ? 'ADDED' : 'NOT_ADDED',
        registeredAt: regRecord.entryDate
      };

      allRegistrations.push(regRecord);
      allAttendees.push(attRecord);
      totalRecords++;
    }
  });

  console.log(`[Import] Processed ${totalRecords} historical records across all dump files.`);

  // Update server/data/db.json
  const dbPath = path.join(__dirname, '../data/db.json');
  let currentDb = { registrations: [], attendees: [], events: [] };
  if (fs.existsSync(dbPath)) {
    try {
      currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      console.error('Error reading current db.json:', e);
    }
  }

  // Deduplicate existing records by ID or reference
  const regMap = new Map();
  (currentDb.registrations || []).forEach((r) => regMap.set(r.id, r));
  allRegistrations.forEach((r) => regMap.set(r.id, r));

  const attMap = new Map();
  (currentDb.attendees || []).forEach((a) => attMap.set(a.id, a));
  allAttendees.forEach((a) => attMap.set(a.id, a));

  currentDb.registrations = Array.from(regMap.values());
  currentDb.attendees = Array.from(attMap.values());

  fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf8');
  console.log(`[Import] Successfully saved ${currentDb.registrations.length} registrations and ${currentDb.attendees.length} attendees to db.json`);

  return { registrationsCount: currentDb.registrations.length, attendeesCount: currentDb.attendees.length };
}

runImport();
