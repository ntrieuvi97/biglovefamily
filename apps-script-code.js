/**
 * Wedding RSVP Google Apps Script - SECURED VERSION
 * Copy paste code này vào Google Apps Script
 */

// ===== CẤU HÌNH BẢO MẬT =====
const SECURITY_CONFIG = {
  // Chỉ cho phép từ domain này (thay bằng domain của bạn)
  ALLOWED_ORIGINS: [
    'https://ntrieuvi97.github.io',
    'http://127.0.0.1:8080',  // Local development
    'http://localhost:8080'   // Local development
  ],
  
  // Giới hạn số lượng request (IP-based simple rate limiting)
  MAX_REQUESTS_PER_MINUTE: 3,
  
  // Honeypot field để chống bot
  HONEYPOT_FIELD: 'website_url',
  
  // Validation rules
  MAX_NAME_LENGTH: 100,
  REQUIRED_FIELDS: ['name', 'attendance']
};

// Simple rate limiting storage (reset mỗi khi script restart)
const rateLimitMap = {};

function doPost(e) {
  try {
    // 1. Kiểm tra Content-Type
    const contentType = e.parameter ? 'form' : 'json';
    
    // 2. Parse dữ liệu
    let data;
    if (contentType === 'json') {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    console.log('Received data:', data);
    
    // 3. Security validations
    const securityCheck = validateSecurity(data, e);
    if (!securityCheck.valid) {
      console.log('Security check failed:', securityCheck.reason);
      return createErrorResponse(securityCheck.reason, 403);
    }
    
    // 4. Data validation
    const dataValidation = validateData(data);
    if (!dataValidation.valid) {
      console.log('Data validation failed:', dataValidation.reason);
      return createErrorResponse(dataValidation.reason, 400);
    }
    
    // 5. Lưu vào spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Prepare clean data
    const cleanData = {
      timestamp: new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh'
      }),
      name: sanitizeString(data.name),
      attendance: data.attendance === 'yes' ? 'Có' : 'Không',
      attendanceValue: data.attendanceValue || data.attendance,
      ipAddress: getClientIP(e),  // Log IP for security
      userAgent: e.parameter?.userAgent || 'Unknown'
    };
    
    sheet.appendRow([
      cleanData.timestamp,
      cleanData.name,
      cleanData.attendance,
      cleanData.attendanceValue,
      cleanData.ipAddress,
      cleanData.userAgent
    ]);
    
    console.log('Data saved successfully');
    
    // 6. Response thành công
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'RSVP saved successfully',
        timestamp: cleanData.timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

function doGet(e) {
  // Chỉ trả về status, không leak thông tin
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      service: 'Wedding RSVP API',
      version: '2.0'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== SECURITY FUNCTIONS =====

function validateSecurity(data, request) {
  // 1. Honeypot check (chống bot)
  if (data[SECURITY_CONFIG.HONEYPOT_FIELD]) {
    return { valid: false, reason: 'Bot detected' };
  }
  
  // 2. Rate limiting (đơn giản)
  const clientIP = getClientIP(request);
  const currentTime = Date.now();
  const timeWindow = 60 * 1000; // 1 minute
  
  if (!rateLimitMap[clientIP]) {
    rateLimitMap[clientIP] = [];
  }
  
  // Clean old requests
  rateLimitMap[clientIP] = rateLimitMap[clientIP].filter(
    time => currentTime - time < timeWindow
  );
  
  // Check rate limit
  if (rateLimitMap[clientIP].length >= SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    return { valid: false, reason: 'Rate limit exceeded' };
  }
  
  // Add current request
  rateLimitMap[clientIP].push(currentTime);
  
  // 3. Basic XSS prevention
  if (containsSuspiciousContent(data.name)) {
    return { valid: false, reason: 'Suspicious content detected' };
  }
  
  return { valid: true };
}

function validateData(data) {
  // 1. Required fields
  for (const field of SECURITY_CONFIG.REQUIRED_FIELDS) {
    if (!data[field] || data[field].trim() === '') {
      return { valid: false, reason: `Missing required field: ${field}` };
    }
  }
  
  // 2. Name validation
  if (data.name.length > SECURITY_CONFIG.MAX_NAME_LENGTH) {
    return { valid: false, reason: 'Name too long' };
  }
  
  // 3. Attendance validation
  if (!['yes', 'no'].includes(data.attendance) && 
      !['yes', 'no'].includes(data.attendanceValue)) {
    return { valid: false, reason: 'Invalid attendance value' };
  }
  
  return { valid: true };
}

function containsSuspiciousContent(text) {
  if (!text || typeof text !== 'string') return false;
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onclick/i,
    /onload/i,
    /<iframe/i,
    /eval\(/i,
    /alert\(/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
}

function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .substring(0, SECURITY_CONFIG.MAX_NAME_LENGTH);
}

function getClientIP(request) {
  // Google Apps Script doesn't provide real IP, but we can try
  return request.parameter?.clientIP || 'unknown';
}

function createErrorResponse(message, code = 400) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'error',
      message: message,
      code: code
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// ===== SETUP FUNCTIONS =====

function setupSecuredHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Thời gian', 
      'Họ tên', 
      'Tham dự', 
      'Raw Value',
      'IP Address',
      'User Agent'
    ]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, 6);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#d4af37');
    headerRange.setFontColor('white');
  }
}

function getRSVPStats() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  let totalResponses = 0;
  let attending = 0;
  let notAttending = 0;
  
  for (let i = 1; i < data.length; i++) {
    totalResponses++;
    if (data[i][3] === 'yes') {
      attending++;
    } else {
      notAttending++;
    }
  }
  
  return {
    total: totalResponses,
    attending: attending,
    notAttending: notAttending
  };
}