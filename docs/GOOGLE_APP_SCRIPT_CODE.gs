// ============================================================
// GOOGLE APP SCRIPT - Transportation & RSVP Data Handler
// ============================================================
// CÁCH SỬ DỤNG:
// 1. Mở Google Sheet của bạn
// 2. Vào Extensions → Apps Script
// 3. Xóa code mặc định
// 4. Copy toàn bộ đoạn code này vào
// 5. Thay thế SPREADSHEET_ID ở dòng dưới đây
// 6. Deploy theo hướng dẫn trong tài liệu
// ============================================================

// ⚙️ CẤU HÌNH - THAY ĐỔI GIÁ TRỊ NÀY
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // ← THAY THÀNH ID CỦA BẠN (Tìm trong URL Google Sheet)
const TRANSPORTATION_SHEET = 'Transportation'; // Tên sheet cho dữ liệu phương tiện
const RSVP_SHEET = 'RSVP'; // Tên sheet cho RSVP

/**
 * Hàm Main - Xử lý tất cả POST requests từ form
 * @param {Object} e - Event object từ Google Apps Script
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    // Log để debug
    Logger.log('=== POST Request Received ===');
    Logger.log('Raw Content: ' + e.postData.contents);
    
    // Parse dữ liệu JSON
    const payload = JSON.parse(e.postData.contents);
    Logger.log('Parsed Payload: ' + JSON.stringify(payload));
    
    // Kiểm tra loại event
    if (payload.eventType === 'transportation') {
      Logger.log('Processing: Transportation Request');
      return handleTransportation(payload);
    } else {
      // Mặc định: RSVP
      Logger.log('Processing: RSVP Request');
      return handleRSVP(payload);
    }
  } catch (error) {
    Logger.log('❌ MAIN ERROR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Server Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý dữ liệu Xác Nhận Phương Tiện
 * @param {Object} data - Dữ liệu từ form
 */
function handleTransportation(data) {
  try {
    Logger.log('--- Transportation Handler Started ---');
    
    // 1. Lấy Spreadsheet và Sheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(TRANSPORTATION_SHEET);
    
    // Nếu sheet chưa tồn tại, tạo mới
    if (!sheet) {
      Logger.log('Sheet không tồn tại, tạo mới...');
      sheet = spreadsheet.insertSheet(TRANSPORTATION_SHEET);
      sheet.appendRow(['Timestamp', 'Name', 'Transportation', 'User Agent', 'Screen Resolution']);
    }
    
    Logger.log('Sheet: ' + sheet.getName());
    
    // 2. Server-side Validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Tên không hợp lệ hoặc rỗng');
    }
    
    if (data.name.length > 100) {
      throw new Error('Tên quá dài (tối đa 100 ký tự)');
    }
    
    // Kiểm tra XSS patterns
    if (/<[^>]*script/i.test(data.name) || /javascript:/i.test(data.name)) {
      throw new Error('Dữ liệu không hợp lệ (chứa script)');
    }
    
    if (!['self', 'group'].includes(data.transportationValue)) {
      throw new Error('Lựa chọn phương tiện không hợp lệ (giá trị: ' + data.transportationValue + ')');
    }
    
    Logger.log('✅ Validation passed');
    
    // 3. Kiểm tra trùng lặp và cập nhật hoặc thêm mới
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    let isDuplicate = false;
    let duplicateRow = -1;
    
    // Tìm dòng trùng lặp (bỏ qua header row 0)
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] && values[i][1].toString().trim().toLowerCase() === 
          data.name.toString().trim().toLowerCase()) {
        isDuplicate = true;
        duplicateRow = i + 1; // Apps Script dùng 1-based indexing
        Logger.log('Duplicate found at row: ' + duplicateRow);
        break;
      }
    }
    
    // 4. Cập nhật hoặc thêm dữ liệu
    if (isDuplicate) {
      Logger.log('Cập nhật hàng ' + duplicateRow);
      sheet.getRange(duplicateRow, 1).setValue(data.timestamp);
      sheet.getRange(duplicateRow, 3).setValue(data.transportation);
      sheet.getRange(duplicateRow, 4).setValue(data.userAgent || 'Unknown');
      sheet.getRange(duplicateRow, 5).setValue(data.screenResolution || 'Unknown');
    } else {
      Logger.log('Thêm hàng mới');
      sheet.appendRow([
        data.timestamp || new Date(),
        data.name,
        data.transportation || 'Unknown',
        data.userAgent || 'Unknown',
        data.screenResolution || 'Unknown'
      ]);
    }
    
    // 5. Auto-resize columns
    sheet.autoResizeColumns(1, 5);
    
    Logger.log('✅ Transportation data saved successfully');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Dữ liệu phương tiện đã được lưu thành công',
      isDuplicate: isDuplicate,
      timestamp: data.timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ TRANSPORTATION ERROR: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Lỗi lưu dữ liệu: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý dữ liệu RSVP (Xác nhận tham dự)
 * @param {Object} data - Dữ liệu từ form
 */
function handleRSVP(data) {
  try {
    Logger.log('--- RSVP Handler Started ---');
    
    // 1. Lấy Sheet RSVP (hoặc sheet đầu tiên nếu không tồn tại)
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(RSVP_SHEET);
    
    if (!sheet) {
      Logger.log('Sheet RSVP không tồn tại, sử dụng sheet đầu tiên');
      sheet = spreadsheet.getSheets()[0];
    }
    
    Logger.log('Sheet: ' + sheet.getName());
    
    // 2. Server-side Validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Tên không hợp lệ hoặc rỗng');
    }
    
    if (data.name.length > 100) {
      throw new Error('Tên quá dài');
    }
    
    // Kiểm tra XSS
    if (/<[^>]*script/i.test(data.name) || /javascript:/i.test(data.name)) {
      throw new Error('Dữ liệu không hợp lệ');
    }
    
    if (!['yes', 'no'].includes(data.attendanceValue)) {
      throw new Error('Dự tính không hợp lệ');
    }
    
    Logger.log('✅ RSVP Validation passed');
    
    // 3. Thêm hàng mới
    sheet.appendRow([
      data.timestamp || new Date(),
      data.name,
      data.attendance || 'Unknown',
      data.userAgent || 'Unknown',
      data.screenResolution || 'Unknown'
    ]);
    
    // 4. Auto-resize
    sheet.autoResizeColumns(1, 5);
    
    Logger.log('✅ RSVP data saved successfully');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'RSVP đã được ghi nhận thành công',
      timestamp: data.timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ RSVP ERROR: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Lỗi RSVP: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * TEST FUNCTION - Chạy từ Apps Script Editor để test
 * Nhấn Run → chọn testTransportation() → Check Execution Log
 */
function testTransportation() {
  const testData = {
    name: 'Nguyễn Văn A',
    transportation: 'Tôi sẽ tự di chuyển (tự túc)',
    transportationValue: 'self',
    timestamp: new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    userAgent: 'Test Browser',
    screenResolution: '1920x1080',
    eventType: 'transportation'
  };
  
  const result = handleTransportation(testData);
  Logger.log('=== TEST RESULT ===');
  Logger.log(result.getContent());
}

function testRSVP() {
  const testData = {
    name: 'Trần Thị B',
    attendance: 'Có',
    attendanceValue: 'yes',
    timestamp: new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    userAgent: 'Test Browser',
    screenResolution: '1920x1080'
  };
  
  const result = handleRSVP(testData);
  Logger.log('=== TEST RESULT ===');
  Logger.log(result.getContent());
}

/**
 * Debug function - Để xem danh sách tất cả sheets
 */
function debugSheets() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = spreadsheet.getSheets();
  
  Logger.log('=== All Sheets ===');
  sheets.forEach((sheet, index) => {
    Logger.log((index + 1) + '. ' + sheet.getName());
  });
}
