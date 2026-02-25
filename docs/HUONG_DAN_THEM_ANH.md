# 📸 Hướng Dẫn Thêm Ảnh Vào Website

## Thêm ảnh nền cho Hero Section (Phần đầu trang)

### Bước 1: Chuẩn bị ảnh
- Chọn 1 ảnh đẹp của cặp đôi
- Kích thước đề xuất: 1920x1080px (hoặc lớn hơn)
- Đặt tên file: `hero-background.jpg`
- Copy vào thư mục `images/`

### Bước 2: Đã tự động cấu hình!
Code đã được cập nhật tự động. Chỉ cần đặt ảnh vào `images/hero-background.jpg` là xong!

**Nếu muốn dùng ảnh khác hoặc link online**, tìm dòng ~42 trong `index.html`:

```css
background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%),
            url('images/hero-background.jpg') center/cover no-repeat;
```

Thay đổi thành link của bạn:
```css
background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%),
            url('https://i.imgur.com/your-photo.jpg') center/cover no-repeat;
```

### Hiện tại, phần Hero đã có:
- ✅ Chữ "WEDDING" ở trên cùng
- ✅ Tên cặp đôi
- ✅ Ngày cưới
- ✅ Lời cảm ơn bằng tiếng Việt đẹp mắt
- ✅ Hiệu ứng overlay để text dễ đọc trên ảnh
- ✅ Animations mượt mà

---

## Cách 1: Đặt ảnh trong thư mục `images`

### Bước 1: Copy ảnh vào thư mục
1. Đặt các file ảnh của bạn vào thư mục `images/`
2. Đặt tên file đơn giản, ví dụ:
   - `couple1.jpg`
   - `couple2.jpg`
   - `proposal.jpg`
   - `engagement.jpg`
   - v.v...

### Bước 2: Cập nhật code trong `index.html`

Tìm phần Gallery (dòng ~675) và thay thế:

**Từ:**
```html
<div class="gallery-item">
    <div class="gallery-placeholder">📸</div>
</div>
```

**Thành:**
```html
<div class="gallery-item">
    <img src="images/couple1.jpg" alt="Ảnh của chúng tôi" class="gallery-img">
</div>
```

### Ví dụ đầy đủ:
```html
<div class="gallery-grid">
    <div class="gallery-item">
        <img src="images/couple1.jpg" alt="Ảnh 1" class="gallery-img">
    </div>
    <div class="gallery-item">
        <img src="images/couple2.jpg" alt="Ảnh 2" class="gallery-img">
    </div>
    <div class="gallery-item">
        <img src="images/proposal.jpg" alt="Lễ cầu hôn" class="gallery-img">
    </div>
    <div class="gallery-item">
        <img src="images/engagement.jpg" alt="Lễ đính hôn" class="gallery-img">
    </div>
    <div class="gallery-item">
        <img src="images/date1.jpg" alt="Hẹn hò" class="gallery-img">
    </div>
    <div class="gallery-item">
        <img src="images/travel.jpg" alt="Du lịch" class="gallery-img">
    </div>
</div>
```

---

## Cách 2: Dùng link ảnh từ Internet

### Sử dụng Google Photos / Imgur / Dropbox

1. Upload ảnh lên Google Photos hoặc Imgur
2. Lấy link trực tiếp đến ảnh
3. Dùng link đó trong code:

```html
<div class="gallery-item">
    <img src="https://i.imgur.com/abcdef.jpg" alt="Ảnh của chúng tôi" class="gallery-img">
</div>
```

---

## Tối ưu ảnh trước khi upload

Để website load nhanh hơn:
- Resize ảnh xuống kích thước hợp lý (1200px x 1200px cho gallery)
- Dùng tool online như [TinyPNG](https://tinypng.com/) để nén ảnh
- Format đề xuất: JPG (ảnh thường), PNG (ảnh có nền trong suốt)

---

## Sau khi thêm ảnh

Chạy các lệnh sau để deploy lên GitHub Pages:

```bash
git add .
git commit -m "Thêm ảnh cặp đôi vào gallery"
git push origin main
```

Website sẽ tự động cập nhật sau vài phút!

---

## ❓ Cần hỗ trợ?

Nếu gặp vấn đề, hãy:
1. Kiểm tra tên file ảnh có đúng không (phân biệt chữ hoa/thường)
2. Kiểm tra đường dẫn (images/photo.jpg chứ không phải Images/photo.jpg)
3. Kiểm tra format ảnh (.jpg, .jpeg, .png, .gif, .webp đều được)
