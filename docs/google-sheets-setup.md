# Hướng dẫn tích hợp Google Sheets cho RSVP

## Bước 1: Tạo Google Sheets

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một spreadsheet mới
3. Đặt tên cho sheet: "Wedding RSVP"
4. Tạo header cho các cột:
   - A1: "Thời gian"
   - B1: "Họ tên" 
   - C1: "Tham dự"

## Bước 2: Tạo Google Apps Script

1. Trong Google Sheet, vào **Extensions > Apps Script**
2. Xóa code mặc định và paste code sau:

```javascript
function doPost(e) {
  try {
    // Lấy spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parse dữ liệu từ request
    const data = JSON.parse(e.postData.contents);
    
    // Thêm dữ liệu vào sheet
    sheet.appendRow([
      data.timestamp,
      data.name,
      data.attendance
    ]);
    
    // Trả về response thành công
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Trả về lỗi
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Wedding RSVP API is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## Bước 3: Deploy Apps Script

1. Click **Deploy > New deployment**
2. Trong **Type**, chọn **Web app**
3. **Execute as**: Me
4. **Who has access**: Anyone
5. Click **Deploy**
6. **Authorize** quyền truy cập
7. Copy **Web app URL** (sẽ có dạng: `https://script.google.com/macros/s/ABC123.../exec`)

## Bước 4: Cập nhật URL trong website

Trong file `index.html`, tìm dòng:
```javascript
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

Thay thế `YOUR_SCRIPT_ID` bằng URL bạn vừa copy.

## Bước 5: Test thử nghiệm

1. Mở website của bạn
2. Điền form RSVP và submit
3. Kiểm tra Google Sheets xem dữ liệu có được thêm vào không

## Lưu ý bảo mật

- Web app này được set public để nhận data
- Chỉ cho phép ghi data, không đọc
- Có thể thêm validation và security nếu cần

## Troubleshooting

### Lỗi CORS
- Sử dụng `mode: 'no-cors'` trong fetch request (đã có trong code)

### Lỗi Permission
- Đảm bảo đã authorize đầy đủ quyền trong Apps Script

### Không nhận được data
- Kiểm tra Console của browser để xem lỗi
- Kiểm tra Execution transcript trong Apps Script

## Demo Data Structure

Dữ liệu sẽ được lưu trong Google Sheets với format:

| Thời gian | Họ tên | Tham dự |
|-----------|--------|---------|
| 25/02/2026 14:30:15 | Nguyễn Văn A | Có |
| 25/02/2026 15:45:22 | Trần Thị B | Không |

## Tính năng bổ sung có thể thêm

1. **Email notification**: Gửi email khi có RSVP mới
2. **Data validation**: Kiểm tra duplicate, validate input
3. **Dashboard**: Tạo dashboard thống kê RSVP
4. **Export**: Xuất danh sách khách mời