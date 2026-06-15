# TikTok DM — Nhảy tới video reaction gần nhất

**Ngôn ngữ:** [English](README.md) · **Tiếng Việt**

Chrome extension (Manifest V3) chạy **client-side** trên `tiktok.com/messages`. Bấm 1 nút → tự cuộn tới **video gần nhất mà bạn đã thả reaction** (video người kia gửi cho bạn), đưa vào giữa màn hình và làm nổi bật. Không gọi API, không gửi dữ liệu ra ngoài.

## Cài đặt (Load unpacked)
1. Mở `chrome://extensions`.
2. Bật **Developer mode** (góc trên phải).
3. Bấm **Load unpacked** → chọn thư mục này.

## Cách dùng
1. Mở `https://www.tiktok.com/messages` và vào một cuộc trò chuyện.
2. Panel nổi hiện ở góc dưới phải:
   - **⤴ Video reaction gần nhất** — bấm để nhảy tới video gần nhất bạn đã reaction.
   - **Chỉ video** (mặc định bật) — bỏ tick để tính cả tin text/ảnh có reaction.
   - Khi đang chạy có dòng tiến trình + nút **Huỷ**.

## Hoạt động thế nào
- "Reaction của bạn" = badge reaction nằm trên tin **người kia gửi** (incoming). Đúng cho chat 1-1.
- Mở hội thoại là đang ở đáy (mới nhất). Extension cuộn **lên**, nạp dần tin cũ, và dừng ở **tin incoming có reaction đầu tiên gặp từ dưới lên** = cái gần nhất.
- Vì DOM không chứa link video, extension chỉ cuộn + highlight; bạn tự bấm vào video để xem.

## Cấu trúc
- `manifest.json` — khai báo MV3.
- `src/dom-selectors.js` — toàn bộ selector + điều kiện nhận diện (sửa ở đây nếu TikTok đổi DOM).
- `src/finder.js` — thuật toán cuộn-lên & quét.
- `src/ui-panel.js` — panel nổi, toggle, tiến trình/huỷ, highlight, toast.
- `src/content-script.js` — mount/unmount panel theo điều hướng SPA.
- `styles.css` — style panel + highlight.

## Lưu ý
- Selector dựa trên cấu trúc TikTok tháng 6/2026; nếu TikTok đổi DOM thì sửa `src/dom-selectors.js` (đã có `console.warn` khi selector không khớp).
- Thuần client-side trên tài khoản của chính bạn (chỉ cuộn/đọc DOM, không tự gửi/thả reaction) → rủi ro thấp, nhưng vẫn là tự động hoá nhẹ trên web TikTok.
