# 🔐 Hướng dẫn Bảo mật Google Sheets Integration

## ⚠️ Rủi ro khi Public Script URL

### Các mối đe dọa:
1. **Spam Attacks**: Bot có thể gửi hàng nghìn request giả
2. **Data Pollution**: Dữ liệu bẩn làm ô nhiễm sheet
3. **Resource Abuse**: Vượt quota Google Apps Script 
4. **No Access Control**: Không kiểm soát được ai truy cập

## 🛡️ Giải pháp Bảo mật Đã Triển khai

### 1. **Server-side Protection (Google Apps Script)** ✅ 

**Honeypot Field**: Hidden field để detect bot
```html
<!-- Bot sẽ tự động fill field này -->
<input type="text" name="website_url" style="display:none">
```

**Rate Limiting**: Giới hạn 3 request/phút per IP
```javascript
MAX_REQUESTS_PER_MINUTE: 3
```

**Input Validation**: 
- Tên tối đa 100 ký tự
- Chặn script injection
- Validate attendance values

**XSS Prevention**: Loại bỏ các thẻ HTML nguy hiểm
```javascript
/<script/i, /javascript:/i, /onclick/i
```

### 2. **Client-side Protection** ✅

**Rate Limiting**: 2 lần submit tối đa trong 5 phút
**Input Sanitization**: Clean data trước khi gửi  
**Bot Detection**: Kiểm tra honeypot field
**Error Handling**: Graceful degradation

## 🔒 Các Cách Ẩn URL (Từ Cơ bản → Nâng cao)

### **Cách 1: Obfuscation (Cơ bản - Không an toàn 100%)**

```javascript
// Thay vì hardcode URL
const parts = [
  'https://script.google.com/macros/s/',
  'AKfycby...',  // Script ID
  '/exec'
];
const GOOGLE_SHEETS_URL = parts.join('');
```

⚠️ **Lưu ý**: Vẫn có thể reverse engineer

### **Cách 2: Environment Variables (Cho Server deployment)**

```javascript
// Chỉ work với server-side rendering
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SCRIPT_URL;
```

❌ **Không áp dụng được**: Static website không có server

### **Cách 3: Proxy Server (Tốt nhất)**

Tạo API middleware:
```
Website → Your API Server → Google Sheets
```

**Ưu điểm**:
- URL Google Sheets hoàn toàn ẩn
- Kiểm soát authentication
- Thêm nhiều layer security

**Nhược điểm**: 
- Cần setup server
- Chi phí hosting
- Phức tạp hơn

### **Cách 4: Netlify/Vercel Functions**

```javascript
// netlify/functions/rsvp.js
exports.handler = async (event, context) => {
  const HIDDEN_URL = process.env.GOOGLE_SCRIPT_URL;
  
  // Forward request to Google Sheets
  const response = await fetch(HIDDEN_URL, {
    method: 'POST',
    body: event.body
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

## 🎯 Khuyến nghị cho Wedding Website

### **Phương án hiện tại (Đủ tốt)**: ✅ Recommended
- Server-side validation mạnh
- Multiple security layers  
- Rate limiting  
- Honeypot protection
- Cost-effective (free)

### **Khi nào cần upgrade**:
- Website có > 1000 users/day
- Cần enterprise-level security
- Có budget cho server hosting

## 📊 Monitoring & Analytics

### **Theo dõi trong Google Sheets**:
1. **IP Address**: Detect suspicious activity
2. **User Agent**: Identify bot patterns
3. **Timestamp**: Analyze traffic patterns
4. **Rate**: Track submission frequency

### **Red Flags cần warning**:
- Nhiều submissions từ cùng IP
- User Agent suspicious (bot patterns)  
- Honeypot field được điền
- Tên có script tags

## 🚨 Response Plan khi bị Attack

### **Bước 1: Immediate Response**
```javascript
// Trong Google Apps Script, tạm disable public access
function doPost(e) {
  return createErrorResponse('Service temporarily unavailable', 503);
}
```

### **Bước 2: Analysis**
- Check Google Apps Script execution logs
- Analyze pattern trong Sheet data  
- Identify source of attack

### **Bước 3: Mitigation** 
- Tăng rate limiting
- Thêm CAPTCHA (nếu cần)
- Blacklist suspicious IPs
- Enable manual review

## 🎯 Best Practices Tổng kết

1. **✅ Đã làm**: Multiple security layers
2. **✅ Đã làm**: Input validation & sanitization  
3. **✅ Đã làm**: Rate limiting client & server
4. **✅ Đã làm**: Bot detection với honeypot
5. **✅ Đã làm**: Error handling graceful
6. **⭐ Bonus**: Monitor & alert system
7. **🔮 Future**: Consider proxy nếu scale

## 💡 Kết luận

**Cho wedding website**: Current solution đủ mạnh và cost-effective.

**URL có thể public nhưng được bảo vệ tốt** bởi multiple security layers.

**Trade-off hợp lý**: Đơn giản deploy vs Perfect security.