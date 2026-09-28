import path from 'path';
import * as XLSX from 'xlsx';

const xlsxLib = XLSX.default || XLSX;

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Normalizes email address for matching
 */
export function normalizeEmail(email) {
  if (!email) return '';
  return String(email).trim().toLowerCase();
}

/**
 * Normalizes phone for matching
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

/**
 * Parses numeric amount from currency string
 */
export function parseAmount(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Safely parses Date or Excel serial date into ISO string
 */
export function safeDateIso(val, fallback = new Date().toISOString()) {
  if (!val) return fallback;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString();
  }
  if (typeof val === 'number') {
    const date = new Date((val - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return fallback;
}

/**
 * Reads workbook file from path or buffer
 */
export function readWorkbook(filePathOrBuffer) {
  if (Buffer.isBuffer(filePathOrBuffer)) {
    return xlsxLib.read(filePathOrBuffer, { type: 'buffer', cellDates: true });
  }
  return xlsxLib.readFile(filePathOrBuffer, { cellDates: true });
}

/**
 * Executes Dry-Run validation on AIPC 2026 Registration workbook
 */
export function runDryRun(filePathOrBuffer, db = { registrations: [], crmContacts: [] }) {
  const workbook = readWorkbook(filePathOrBuffer);
  const regSheet = workbook.Sheets['Registration'];
  if (!regSheet) {
    throw new Error('Workbook missing required "Registration" worksheet.');
  }

  const rawRows = xlsxLib.utils.sheet_to_json(regSheet, { raw: false, defval: '' });
  const totalSourceRows = rawRows.length;

  const paymentBreakdown = {
    expectedDone: 393,
    actualDone: 0,
    expectedPending: 135,
    actualPending: 0,
    matches: false,
  };

  const accommodationBreakdown = {
    expectedQuadruple: 482,
    actualQuadruple: 0,
    expectedTriple: 26,
    actualTriple: 0,
    expectedDouble: 18,
    actualDouble: 0,
    expectedDayScholar: 2,
    actualDayScholar: 0,
    matches: false,
  };

  const emailMap = new Map();
  const duplicateReviews = [];
  const discrepancies = [];
  let existingEntryIdMatches = 0;

  const existingLegacyIds = new Set(
    (db.registrations || [])
      .filter((r) => r.eventId === 'evt-aipc-2026' || r.eventId === 'AIPC2026')
      .map((r) => String(r.legacyEntryId || r.entryId))
  );

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const legacyEntryId = String(row['Entry ID'] || '').trim();
    const status = String(row['Payment Status'] || '').trim();
    const accType = String(row['Accommodation Type'] || '').trim();
    const rawEmail = row['Email'];
    const normEmail = normalizeEmail(rawEmail);
    const rawName = String(row['Name'] || '').trim();
    const churchName = String(row['Church Name'] || '').trim();
    const phone = String(row['Phone'] || '').trim();

    // Payment reconciliation
    if (status.toLowerCase() === 'done' || status.toLowerCase() === 'paid') {
      paymentBreakdown.actualDone++;
    } else if (status.toLowerCase() === 'pending') {
      paymentBreakdown.actualPending++;
    } else {
      discrepancies.push({
        type: 'UNKNOWN_PAYMENT_STATUS',
        rowNumber,
        legacyEntryId,
        field: 'Payment Status',
        message: `Unrecognized payment status: "${status}"`,
      });
    }

    // Accommodation reconciliation
    if (accType.toLowerCase().includes('quadruple')) {
      accommodationBreakdown.actualQuadruple++;
    } else if (accType.toLowerCase().includes('triple')) {
      accommodationBreakdown.actualTriple++;
    } else if (accType.toLowerCase().includes('double')) {
      accommodationBreakdown.actualDouble++;
    } else if (accType.toLowerCase().includes('day scholar')) {
      accommodationBreakdown.actualDayScholar++;
    }

    // Duplicate Entry ID check
    if (existingLegacyIds.has(legacyEntryId)) {
      existingEntryIdMatches++;
    }

    // Duplicate email check
    if (normEmail) {
      if (emailMap.has(normEmail)) {
        const prev = emailMap.get(normEmail);
        duplicateReviews.push({
          id: generateId('dup'),
          legacyEntryId,
          rowNumber,
          email: normEmail,
          name: rawName,
          phone,
          churchName,
          previousMatch: {
            legacyEntryId: prev.legacyEntryId,
            rowNumber: prev.rowNumber,
            name: prev.name,
            email: prev.email,
            churchName: prev.churchName,
          },
          status: 'PENDING_REVIEW',
          notes: 'Shared email address detected during dry-run',
        });
      } else {
        emailMap.set(normEmail, { legacyEntryId, rowNumber, name: rawName, email: normEmail, churchName });
      }
    }

    // Total vs Total.1 check
    const tot1 = row['Total'];
    const tot2 = row['Total.1'] || row['Total_1'];
    if (tot1 !== undefined && tot2 !== undefined && String(tot1).trim() !== String(tot2).trim()) {
      discrepancies.push({
        type: 'FINANCIAL_TOTAL_DISCREPANCY',
        rowNumber,
        legacyEntryId,
        field: 'Total vs Total.1',
        message: `Total ("${tot1}") differs from Total.1 ("${tot2}")`,
      });
    }
  });

  paymentBreakdown.matches =
    paymentBreakdown.actualDone === paymentBreakdown.expectedDone &&
    paymentBreakdown.actualPending === paymentBreakdown.expectedPending;

  accommodationBreakdown.matches =
    accommodationBreakdown.actualQuadruple === accommodationBreakdown.expectedQuadruple &&
    accommodationBreakdown.actualTriple === accommodationBreakdown.expectedTriple &&
    accommodationBreakdown.actualDouble === accommodationBreakdown.expectedDouble &&
    accommodationBreakdown.actualDayScholar === accommodationBreakdown.expectedDayScholar;

  const reconciliationReport = {
    totalSourceRows,
    expectedRegistrations: 528,
    importedRegistrations: totalSourceRows,
    skippedRegistrations: existingEntryIdMatches,
    errorsCount: discrepancies.filter((d) => d.type.includes('ERROR')).length,
    paymentBreakdown,
    accommodationBreakdown,
    crmMetrics: {
      newContactsCreated: totalSourceRows - emailMap.size,
      existingContactsMatched: emailMap.size,
      duplicateEmailsFlagged: duplicateReviews.length,
    },
    discrepancies,
  };

  return {
    reconciliation: reconciliationReport,
    duplicateReviews,
    summarySheetPresent: Boolean(workbook.Sheets['Summary']),
    healthyChurchesCount: workbook.Sheets['Healthy Churches']
      ? xlsxLib.utils.sheet_to_json(workbook.Sheets['Healthy Churches']).length
      : 0,
  };
}

/**
 * Commits AIPC 2026 Registration workbook migration into database state
 */
export function commitMigration(filePathOrBuffer, db, options = {}) {
  const workbook = readWorkbook(filePathOrBuffer);
  const regSheet = workbook.Sheets['Registration'];
  if (!regSheet) {
    throw new Error('Workbook missing "Registration" worksheet.');
  }

  const rawRows = xlsxLib.utils.sheet_to_json(regSheet, { raw: false, defval: '' });
  const batchId = generateId('batch');
  const now = new Date().toISOString();

  // Ensure AIPC 2026 Event Edition
  let aipc2026Event = db.events.find((e) => e.id === 'evt-aipc-2026' || e.year === 2026);
  if (!aipc2026Event) {
    aipc2026Event = {
      id: 'evt-aipc-2026',
      slug: 'aipc-2026',
      name: "ALL INDIA PASTOR'S CONFERENCE",
      edition: '8th Edition',
      year: 2026,
      theme: 'Living as Exiles',
      themeScripture: '1 Peter 1:1',
      themeBlurb: 'Calling pastoring brothers across India to stand fast in gospel hope.',
      tagline: 'A Conference for Indian Churches by Indians.',
      startDate: '2026-09-24',
      endDate: '2026-09-26',
      venueName: 'GCC Hotel & Club',
      venueAddress: 'Mira Road (East), Mumbai – 401107, Maharashtra',
      venueCity: 'Mumbai',
      status: 'published',
    };
    db.events.push(aipc2026Event);
  }

  const importedRegistrations = [];
  const createdOrUpdatedContacts = [];
  let successfulRows = 0;
  let skippedRows = 0;

  // Process rows
  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const legacyEntryId = String(row['Entry ID'] || '').trim();
    if (!legacyEntryId) return;

    // Idempotency check: event_edition_id + legacy_entry_id
    const existingIndex = db.registrations.findIndex(
      (r) => r.eventId === aipc2026Event.id && String(r.legacyEntryId || r.entryId) === legacyEntryId
    );

    const sourceStatus = String(row['Payment Status'] || '').trim();
    const paymentStatus = (sourceStatus.toLowerCase() === 'done' || sourceStatus.toLowerCase() === 'paid')
      ? 'paid'
      : 'pending';

    const rawName = String(row['Name'] || '').trim();
    const nameParts = rawName.split(/\s+/);
    const firstName = nameParts[0] || 'Delegate';
    const lastName = nameParts.slice(1).join(' ') || '';
    const email = String(row['Email'] || '').trim();
    const normEmail = normalizeEmail(email);
    const phone = String(row['Phone'] || '').trim();
    const normPhone = normalizePhone(phone);
    const churchName = String(row['Church Name'] || '').trim();
    const churchDenomination = String(row['Church Denomination'] || '').trim();
    const role = String(row['Role'] || '').trim();

    // CRM Contact deduplication
    let contact = db.crmContacts.find(
      (c) => (normEmail && c.email?.toLowerCase() === normEmail) || (normPhone && normalizePhone(c.phone) === normPhone)
    );

    if (!contact) {
      contact = {
        id: generateId('crm_cnt'),
        firstName,
        lastName,
        fullName: rawName,
        email,
        phone,
        whatsapp: phone,
        age: row['Age'] ? Number(row['Age']) : null,
        gender: String(row['Gender'] || '').toLowerCase(),
        country: String(row['Country'] || 'India').trim(),
        state: String(row['State / Province'] || '').trim(),
        city: String(row['City'] || '').trim(),
        address: [row['Street Address'], row['Address Line 2']].filter(Boolean).join(', '),
        churchName,
        churchDenomination,
        role: role || 'Pastor',
        organisation: churchName,
        designation: role || 'Pastor',
        contactType: 'pastor',
        lifecycle: 'attendee',
        leadSource: 'AIPC 2026 Migration',
        tags: ['AIPC-2026', 'MIGRATED'],
        consent: true,
        notes: String(row['Remarks'] || ''),
        createdAt: now,
        updatedAt: now,
      };
      db.crmContacts.push(contact);
    } else {
      if (!contact.tags.includes('AIPC-2026')) {
        contact.tags.push('AIPC-2026');
      }
      contact.lifecycle = 'repeat-attendee';
      contact.updatedAt = now;
    }
    createdOrUpdatedContacts.push(contact);

    // Map Accommodation Type
    const sourceAcc = String(row['Accommodation Type'] || '').trim();
    let accommodationType = 'QUADRUPLE_SHARING';
    if (sourceAcc.toLowerCase().includes('triple')) accommodationType = 'TRIPLE_SHARING';
    else if (sourceAcc.toLowerCase().includes('double')) accommodationType = 'DOUBLE_SHARING';
    else if (sourceAcc.toLowerCase().includes('day scholar')) accommodationType = 'DAY_SCHOLAR';

    const totalAmount = parseAmount(row['Total']);
    const donationAmount = parseAmount(row['Donation'] || row['Donations']);

    const regRecord = {
      id: existingIndex >= 0 ? db.registrations[existingIndex].id : generateId('reg'),
      reference: `AIPC2026-${String(legacyEntryId).padStart(4, '0')}`,
      legacyEntryId,
      entryId: legacyEntryId,
      sourceSerialNumber: Number(row[' Sl. No.'] || row['Sl. No.'] || rowNumber - 1),
      eventId: aipc2026Event.id,
      contactId: contact.id,
      firstName,
      lastName,
      fullName: rawName,
      email,
      phone,
      age: row['Age'] ? Number(row['Age']) : null,
      gender: String(row['Gender'] || '').toLowerCase(),
      streetAddress: String(row['Street Address'] || ''),
      addressLine2: String(row['Address Line 2'] || ''),
      postalCode: String(row['ZIP / Postal Code'] || ''),
      city: String(row['City'] || ''),
      state: String(row['State / Province'] || ''),
      country: String(row['Country'] || 'India'),
      churchName,
      churchDenomination,
      role,
      attendedPrevious: String(row['Have you attended previous AIPC?'] || ''),
      accommodationType,
      sourceAccommodationType: sourceAcc,
      pricingInfo: String(row['Pricing'] || row['Early Bird Pricing'] || ''),
      paymentStatus,
      sourcePaymentStatus: sourceStatus,
      paymentSource: 'IMPORTED_HISTORICAL',
      legacyTransactionId: String(row['Transaction ID'] || ''),
      amountPaid: paymentStatus === 'paid' ? totalAmount : 0,
      donationAmount,
      sourceDonationValue: String(row['Donation'] || row['Donations'] || ''),
      couponCode: String(row['Coupon'] || ''),
      totalAmount,
      total: totalAmount,
      amount: totalAmount - donationAmount,
      tax: 0,
      currency: 'INR',
      sourceTotal2: String(row['Total.1'] || row['Total_1'] || ''),
      remarks: String(row['Remarks'] || ''),
      registeredAt: safeDateIso(row['Registration Date'], now),
      createdAt: safeDateIso(row['Registration Date'], now),
      importedAt: now,
      importBatchId: batchId,
      sourceData: row, // Raw JSON auditable backup!
    };

    if (existingIndex >= 0) {
      db.registrations[existingIndex] = regRecord;
      skippedRows++;
    } else {
      db.registrations.push(regRecord);
      successfulRows++;
    }
    importedRegistrations.push(regRecord);

    // Sync corresponding Attendee record
    if (!db.attendees) db.attendees = [];
    const attRecord = {
      id: generateId('att'),
      registrationId: regRecord.id,
      contactId: contact.id,
      reference: regRecord.reference,
      legacyEntryId,
      entryId: legacyEntryId,
      eventId: aipc2026Event.id,
      year: '2026',
      edition: '8th Edition',
      name: rawName,
      fullName: rawName,
      email,
      phone,
      age: row['Age'] ? Number(row['Age']) : null,
      gender: String(row['Gender'] || '').toLowerCase(),
      organisation: churchName,
      designation: role || 'Pastor',
      churchName,
      role: role || 'Pastor',
      streetAddress: String(row['Street Address'] || ''),
      city: String(row['City'] || ''),
      state: String(row['State / Province'] || ''),
      country: String(row['Country'] || 'India'),
      postalCode: String(row['ZIP / Postal Code'] || ''),
      categoryId: accommodationType,
      paymentStatus,
      checkInStatus: 'not-arrived',
      checkedInAt: null,
      badgeStatus: 'not-generated',
      roomingStatus: 'unassigned',
      roomId: null,
      attendanceIntention: 'NOT_VERIFIED',
      whatsappStatus: 'NOT_ADDED',
      isDemo: false,
    };

    const existingAttIdx = db.attendees.findIndex(
      (a) => a.registrationId === regRecord.id || String(a.legacyEntryId || a.entryId) === String(legacyEntryId)
    );
    if (existingAttIdx >= 0) {
      db.attendees[existingAttIdx] = { ...db.attendees[existingAttIdx], ...attRecord, id: db.attendees[existingAttIdx].id };
    } else {
      db.attendees.push(attRecord);
    }

    // Sync Event Participation
    if (!db.eventParticipations) db.eventParticipations = [];
    const existingPartIdx = db.eventParticipations.findIndex((p) => p.registrationId === regRecord.id);
    const participationRecord = {
      id: generateId('part'),
      contactId: contact.id,
      eventId: aipc2026Event.id,
      eventYear: 2026,
      eventName: "ALL INDIA PASTOR'S CONFERENCE 2026",
      registrationId: regRecord.id,
      reference: regRecord.reference,
      entryId: legacyEntryId,
      legacyEntryId,
      role: role || 'Pastor',
      categoryName: accommodationType,
      amountPaid: regRecord.amountPaid,
      paymentStatus,
      attended: false,
      checkedInAt: null,
      createdAt: now,
    };
    if (existingPartIdx >= 0) {
      db.eventParticipations[existingPartIdx] = participationRecord;
    } else {
      db.eventParticipations.push(participationRecord);
    }

    // Queue Google Sheets Sync Job
    if (db.syncJobs) {
      db.syncJobs.push({
        id: generateId('sync'),
        target: 'google_sheets',
        action: 'registration_sync',
        payload: {
          batchId,
          legacyEntryId,
          name: rawName,
          email,
          phone,
          churchName,
          paymentStatus,
          totalAmount,
        },
        status: 'pending',
        retryCount: 0,
        createdAt: now,
      });
    }
  });

  // Save Batch Record
  if (!db.migrationBatches) {
    db.migrationBatches = [];
  }
  const dryRunRes = runDryRun(filePathOrBuffer, db);
  const batchRecord = {
    id: batchId,
    batchName: 'AIPC 2026 Registration Migration',
    fileName: options.fileName || 'AIPC 2026 Registration.xlsx',
    sheetName: 'Registration',
    eventId: aipc2026Event.id,
    eventEdition: 'AIPC 2026',
    importedAt: now,
    importedBy: options.importedBy || 'Administrator',
    totalSourceRows: rawRows.length,
    successfulRows,
    failedRows: 0,
    duplicateRows: dryRunRes.duplicateReviews.length,
    status: 'COMMITTED',
    reconciliation: dryRunRes.reconciliation,
    duplicateReviews: dryRunRes.duplicateReviews,
  };
  db.migrationBatches.unshift(batchRecord);

  // Audit Log
  if (db.auditLogs) {
    db.auditLogs.unshift({
      id: generateId('log'),
      action: 'COMMIT_MIGRATION',
      entityType: 'MigrationBatch',
      entityId: batchId,
      details: `Committed AIPC 2026 Registration.xlsx migration (${successfulRows} new, ${skippedRows} updated/skipped)`,
      createdAt: now,
    });
  }

  return {
    batchId,
    totalSourceRows: rawRows.length,
    successfulRows,
    skippedRows,
    importedRegistrationsCount: importedRegistrations.length,
    contactsCount: db.crmContacts.length,
    reconciliation: dryRunRes.reconciliation,
  };
}

/**
 * Imports 71 Healthy Churches lead records from workbook into CRM
 */
export function importHealthyChurches(filePathOrBuffer, db) {
  const workbook = readWorkbook(filePathOrBuffer);
  const churchSheet = workbook.Sheets['Healthy Churches'];
  if (!churchSheet) {
    throw new Error('Workbook missing "Healthy Churches" worksheet.');
  }

  const rawRows = xlsxLib.utils.sheet_to_json(churchSheet, { raw: false, defval: '' });
  const now = new Date().toISOString();
  let importedCount = 0;

  if (!db.healthyChurches) {
    db.healthyChurches = [];
  }

  rawRows.forEach((row, idx) => {
    const churchName = String(row['Church'] || '').trim();
    if (!churchName) return;

    const record = {
      id: generateId('hch'),
      serialNumber: Number(row['Sl. No.'] || idx + 1),
      churchName,
      city: String(row['City '] || row['City'] || '').trim(),
      state: String(row['State'] || '').trim(),
      language: String(row['Language'] || '').trim(),
      leadPastor: String(row['Lead Pastor'] || '').trim(),
      callingNotes: String(row['Calling (JG/SS)'] || '').trim(),
      status: 'NEW',
      createdAt: now,
    };

    let company = (db.crmCompanies || []).find((c) => c.name.toLowerCase() === churchName.toLowerCase());
    if (!company) {
      if (!db.crmCompanies) db.crmCompanies = [];
      company = {
        id: generateId('comp'),
        name: churchName,
        city: record.city,
        state: record.state,
        country: 'India',
        notes: `Imported from Healthy Churches sheet. Pastor: ${record.leadPastor}. Calling Notes: ${record.callingNotes}`,
        createdAt: now,
      };
      db.crmCompanies.push(company);
    }

    db.healthyChurches.push(record);
    importedCount++;
  });

  return { importedCount, totalChurches: db.healthyChurches.length };
}
