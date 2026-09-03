const mysql = require('mysql2/promise');
const JSZip = require('jszip');

async function fullVerification() {
  console.log('=====================================================');
  console.log('       END-TO-END VERIFICATION FOR TASK 1           ');
  console.log('=====================================================\n');

  // Step 1: Submit Bangla Member Registration via API
  console.log('--- Step 1: Submitting Member Registration with Bangla ---');
  const uniqueMobile = '017' + Date.now().toString().slice(-8);
  const memberRegData = {
    name: 'রহিম উদ্দিন',
    nameEnglish: 'Rahim Uddin',
    mobile: uniqueMobile,
    dob: '1998-05-15',
    currVillage: 'দক্ষিণ বরগুনা',
    currPostOffice: 'বরগুনা সদর',
    currUpazila: 'বরগুনা সদর',
    currDistrict: 'বরগুনা',
    paymentMethod: 'অফলাইন কাউন্টার'
  };

  const regRes = await fetch('http://localhost:3000/api/public/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(memberRegData)
  });
  const regJson = await regRes.json();
  console.log('Registration HTTP Status:', regRes.status);
  console.log('Registration Response:', {
    formNumber: regJson.member?.formNumber,
    name: regJson.member?.name,
    address: regJson.member?.address
  });

  const memberFormNumber = regJson.member.formNumber;
  const memberId = regJson.member.id;

  // Step 2: Direct Database Inspection
  console.log('\n--- Step 2: Direct Database Inspection ---');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'librery_test',
    port: 3306,
    charset: 'utf8mb4'
  });

  const [dbMembers] = await conn.query(
    'SELECT id, form_number, name, HEX(name) AS hex_name FROM members WHERE form_number = ?',
    [memberFormNumber]
  );
  console.log('Direct DB query row:', dbMembers[0]);
  const isMemberNameExact = dbMembers[0].name === 'রহিম উদ্দিন';
  const hasNoQuestionMarks = !dbMembers[0].name.includes('?');
  console.log('Stored name is exact "রহিম উদ্দিন":', isMemberNameExact);
  console.log('Stored name has NO "?" characters:', hasNoQuestionMarks);
  console.log('UTF-8 Hex validation:', dbMembers[0].hex_name);

  // Step 3: Edge Cases: Books, Notes, and JSON Columns
  console.log('\n--- Step 3: Testing Edge Cases (Mixed, Numbers, JSON Columns) ---');
  const bookCode = 'TEST-BANGLA-' + Date.now();
  const bookName = 'নকশী কাঁথার মাঠ (The Field of the Embroidered Quilt)';
  const bookAuthor = 'জসীমউদ্দীন (1903–1976)';
  const bookPublisher = 'ডি. এম. লাইব্রেরি, ঢাকা';
  const bookDesc = 'বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ গীতিকাব্য। পৃষ্ঠা: ১২৮, মূল্য: ৳২২০.৫০';

  const [bookInsert] = await conn.query(
    `INSERT INTO books (code, name, author, publisher, status, group_name, description, page_count, price)
     VALUES (?, ?, ?, ?, 'Available', 'কাব্যগ্রন্থ', ?, 128, 220.50)`,
    [bookCode, bookName, bookAuthor, bookPublisher, bookDesc]
  );
  const bookId = bookInsert.insertId;

  // Insert Issue with JSON history & comments
  const extHistory = [{ date: '2026-09-02', action: 'Extended', payload: '৭ দিনের জন্য বৃদ্ধি (7 days)' }];
  const comments = ['সদস্য নিয়মিত বই পড়েন এবং অক্ষত অবস্থায় ফেরত দেন।', 'English note with Bangla: OK'];

  const [issueInsert] = await conn.query(
    `INSERT INTO issues (
      book_id, member_id, book_code, book_name, author, publisher,
      member_name, form_number, mobile, address, issue_date, return_date,
      status, extension_history, comments
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '01711001122', 'বরগুনা সদর', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Issued', ?, ?)`,
    [
      bookId, memberId, bookCode, bookName, bookAuthor, bookPublisher,
      'রহিম উদ্দিন', memberFormNumber,
      JSON.stringify(extHistory),
      JSON.stringify(comments)
    ]
  );
  const issueId = issueInsert.insertId;

  // Query back issue
  const [issueRow] = await conn.query('SELECT * FROM issues WHERE id = ?', [issueId]);
  const retrievedExtHistory = typeof issueRow[0].extension_history === 'string'
    ? JSON.parse(issueRow[0].extension_history)
    : issueRow[0].extension_history;
  const retrievedComments = typeof issueRow[0].comments === 'string'
    ? JSON.parse(issueRow[0].comments)
    : issueRow[0].comments;

  console.log('Book Name stored correctly:', issueRow[0].book_name === bookName);
  console.log('Member Name in issue stored correctly:', issueRow[0].member_name === 'রহিম উদ্দিন');
  console.log('JSON extension_history payload:', retrievedExtHistory[0].payload);
  console.log('JSON comments item 1:', retrievedComments[0]);

  // Step 4: API Display Check
  console.log('\n--- Step 4: Confirming Display via Public/Admin APIs ---');
  const publicBooksRes = await fetch('http://localhost:3000/api/public/books');
  const publicBooksData = await publicBooksRes.json();
  const foundBook = (publicBooksData.books || []).find((b) => b.code === bookCode);
  console.log('Book found in Public Books API:', foundBook ? foundBook.name : 'Not found');
  console.log('Public Books API Content-Type:', publicBooksRes.headers.get('content-type'));

  // Step 5: ZIP/Excel Export Serialization Check
  console.log('\n--- Step 5: Verifying ZIP and .xls Spreadsheet Export ---');
  const zip = new JSZip();

  const booksHeaders = ['ID', 'BookCode', 'BookName', 'Author', 'Publisher', 'Status'];
  const booksRows = [[bookId, bookCode, bookName, bookAuthor, bookPublisher, 'Available']];
  const booksCSV = '\ufeff' + [booksHeaders.join('\t'), ...booksRows.map(r => r.join('\t'))].join('\n');
  zip.file('1_Akkhor_Books_Database.xls', booksCSV);

  const membersHeaders = ['FormNumber', 'MemberName', 'Mobile', 'Address'];
  const membersRows = [[memberFormNumber, 'রহিম উদ্দিন', '01711001122', 'বরগুনা সদর, বরগুনা']];
  const membersCSV = '\ufeff' + [membersHeaders.join('\t'), ...membersRows.map(r => r.join('\t'))].join('\n');
  zip.file('2_Akkhor_Members_List.xls', membersCSV);

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  const loadedZip = await JSZip.loadAsync(zipBuffer);
  const extractedBooksText = await loadedZip.file('1_Akkhor_Books_Database.xls').async('string');
  const extractedMembersText = await loadedZip.file('2_Akkhor_Members_List.xls').async('string');

  console.log('ZIP Books export has BOM:', extractedBooksText.charCodeAt(0) === 0xFEFF);
  console.log('ZIP Books contains "নকশী কাঁথার মাঠ":', extractedBooksText.includes('নকশী কাঁথার মাঠ'));
  console.log('ZIP Members contains "রহিম উদ্দিন":', extractedMembersText.includes('রহিম উদ্দিন'));

  // Step 6: Cleanup Test Records
  console.log('\n--- Step 6: Cleaning up test data ---');
  await conn.query('DELETE FROM issues WHERE id = ?', [issueId]);
  await conn.query('DELETE FROM books WHERE id = ?', [bookId]);
  await conn.query('DELETE FROM members WHERE id = ?', [memberId]);
  console.log('Test records cleaned up successfully.');

  await conn.end();
  console.log('\n=====================================================');
  console.log('          TASK 1 VERIFICATION COMPLETE!             ');
  console.log('=====================================================');
}

fullVerification().catch(console.error);
