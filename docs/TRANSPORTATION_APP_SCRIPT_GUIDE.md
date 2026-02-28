# Hướng Dẫn Thiết Lập Google App Script cho Xác Nhận Phương Tiện

## Tổng Quan
Google App Script này sẽ nhận dữ liệu từ trang `transportation.html` và lưu trữ vào Google Sheets.

## Bước 1: Tạo Google Sheet Mới

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một spreadsheet mới (hoặc sử dụng spreadsheet RSVP hiện tại)
3. Tạo một sheet tab mới tên **"Transportation"** (hoặc thêm cột vào sheet RSVP hiện tại)

### Cấu Trúc Columns (nếu tạo sheet riêng):
```
A: Timestamp
B: Name (Tên)
C: Transportation (Phương tiện)
D: User Agent
E: Screen Resolution
```

## Bước 2: Tạo Google App Script File

1. Từ Google Sheet của bạn, vào **Extensions** → **Apps Script**
2. Xóa code mặc định và thay thế bằng đoạn code dưới đây:

```javascript
// Google Sheets ID - THAY ĐỔI GIẢI PHÁP TẠI ĐÂY
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Tìm trong URL của Google Sheet

/**
 * Hàm chính để nhận POST request từ form
 */
function doPost(e) {
  try {
    // Parse dữ liệu JSON
    const payload = JSON.parse(e.postData.contents);
    
    // Kiểm tra loại event
    if (payload.eventType === 'transportation') {
      return handleTransportation(payload);
    } else {
      // Mặc định: RSVP
      return handleRSVP(payload);
    }
  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý dữ liệu Xác Nhận Phương Tiện
 */
function handleTransportation(data) {
  try {
    // Lấy Google Sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName('Transportation');
    
    if (!sheet) {
      throw new Error('Sheet "Transportation" không tồn tại');
    }
    
    // Server-side validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tên không hợp lệ');
    }
    
    if (!['self', 'group'].includes(data.transportationValue)) {
      throw new Error('Lựa chọn phương tiện không hợp lệ');
    }
    
    // Kiểm tra trùng lặp (nếu cần)
    const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
    const isDuplicate = values.flat().includes(data.name);
    
    if (isDuplicate) {
      // Cập nhật dòng hiện tại thay vì thêm mới
      const row = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues()
        .flat().indexOf(data.name) + 2;
      sheet.getRange(row, 1).setValue(data.timestamp);
      sheet.getRange(row, 3).setValue(data.transportation);
      sheet.getRange(row, 4).setValue(data.userAgent || 'Unknown');
      sheet.getRange(row, 5).setValue(data.screenResolution || 'Unknown');
    } else {
      // Thêm hàng mới
      sheet.appendRow([
        data.timestamp,
        data.name,
        data.transportation,
        data.userAgent || 'Unknown',
        data.screenResolution || 'Unknown'
      ]);
    }
    
    // Tự động resize columns
    sheet.autoResizeColumns(1, 5);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Dữ liệu đã được lưu thành công'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Transportation Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý dữ liệu RSVP (nếu lưu trong cùng file)
 */
function handleRSVP(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName('RSVP') || SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    
    if (!sheet) {
      throw new Error('Sheet RSVP không tồn tại');
    }
    
    // Server-side validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tên không hợp lệ');
    }
    
    if (!['yes', 'no'].includes(data.attendanceValue)) {
      throw new Error('Lựa chọn dự tính không hợp lệ');
    }
    
    // Append new row
    sheet.appendRow([
      data.timestamp,
      data.name,
      data.attendance,
      data.userAgent || 'Unknown',
      data.screenResolution || 'Unknown'
    ]);
    
    sheet.autoResizeColumns(1, 5);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'RSVP đã được ghi nhận'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('RSVP Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test hàm (chạy từ Apps Script Editor)
 */
function testTransportation() {
  const testData = {
    name: 'Test Người Dùng',
    transportation: 'Tôi sẽ tự di chuyển (tự túc)',
    transportationValue: 'self',
    timestamp: new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh'
    }),
    userAgent: 'Test Browser',
    screenResolution: '1920x1080',
    eventType: 'transportation'
  };
  
  const result = handleTransportation(testData);
  Logger.log(result.getContent());
}
```

## Bước 3: Lấy Spreadsheet ID

1. Mở Google Sheet của bạn
2. URL sẽ có dạng: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`
3. Copy `YOUR_SPREADSHEET_ID` (phần dài giữa `/d/` và `/edit`)
4. Dán vào dòng `const SPREADSHEET_ID = '...';` trong code

## Bước 4: Deploy Google App Script

1. Trong Apps Script Editor, click **Deploy** → **New deployment**
2. Chọn loại: **Web app**
3. Nhập **Description**: "Transportation Confirmation"
4. **Execute as**: Chọn tài khoản Google của bạn
5. **Who has access**: "Anyone" (để form có thể gửi data)
6. Click **Deploy**
7. Copy **Deployment ID** (URL sẽ hiển thị)

## Bước 5: Cập Nhật URL trong HTML

1. Mở `transportation.html`
2. Tìm dòng:
   ```javascript
   const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzcbcfeRq1_Q6OjcxC14k_vIOm7yaCOqx-XcKYrmTsjVZejTDJkUbATSFy3KYvfzSmc/exec';
   ```

3. Thay thế URL bằng URL của deployment mới:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

## Bước 6: Tạo Sheet "Transportation" (nếu chưa có)

1. Mở Google Sheet của bạn
2. Click dấu `+` để thêm sheet mới
3. Đặt tên: **Transportation**
4. Thêm headers:
   - A1: Timestamp
   - B1: Name
   - C1: Transportation
   - D1: User Agent
   - E1: Screen Resolution

## Kiểm Tra Hoạt Động

1. Mở `transportation.html` trong browser
2. Điền form test
3. Click "Xác Nhận Lựa Chọn"
4. Kiểm tra Google Sheet - dữ liệu mới phải xuất hiện

## Ghi Chú Bảo Mật

- ✅ Server-side validation trong Apps Script
- ✅ Honeypot field để chống bot (client-side)
- ✅ Rate limiting (client-side)
- ✅ Sanitization để chống XSS
- ✅ CORS không cần vì dùng `mode: 'no-cors'`

## Xử Lý Lỗi

Nếu gặp lỗi:

```
"Sheet Transportation không tồn tại"
→ Tạo sheet mới tên "Transportation"

"Dữ liệu không hợp lệ"
→ Kiểm tra format dữ liệu gửi đi

"Không có quyền truy cập"
→ Kiểm tra permissions trong Deploy (phải là "Anyone")
```

## Tùy Chỉnh Thêm

Nếu muốn lưu thông tin xác nhận phương tiện vào cùng sheet RSVP:

1. Thay đổi dòng trong script:
   ```javascript
   const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
     .getSheetByName('RSVP'); // Sử dụng sheet RSVP
   ```

2. Thêm cột mới trong RSVP:
   - Cột F: Transportation (Phương tiện)

---

**Hoàn tất!** Bây giờ form của bạn sẽ gửi dữ liệu vào Google Sheets khi người dùng xác nhận. 🎉
