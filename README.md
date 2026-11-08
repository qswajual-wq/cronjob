# cronjob

Tạo 2 job trên [cron-job.org](https://cron-job.org), chạy **thứ 2 – thứ 6** (múi giờ `Asia/Ho_Chi_Minh`):

| Giờ | Lệnh |
|---|---|
| 08:51 | `curl -X POST "https://api-services.hostless.app/crm/checkin?device=Desktop"` |
| 18:00 | `curl -X POST "https://api-services.hostless.app/crm/checkout?device=Desktop"` |

## Cách dùng

1. Lấy API key tại cron-job.org → *Settings* → *API*.
2. `cp .env.example .env` rồi điền `CRONJOB_KEY=...`
3. Chạy (Node ≥ 20.6):

   ```
   node --env-file=.env create-job.mjs
   ```

Chạy lại script sẽ cập nhật job cũ (theo title) thay vì tạo trùng.

## Xem lịch sử chạy

Double-click `history.bat` (hoặc `node --env-file=.env history.mjs`) để xem lịch sử chạy gần nhất và lần chạy kế tiếp của toàn bộ cronjob trên tài khoản.

## Thông báo lỗi qua email

Cả 2 job đều bật thông báo email (gửi về email của tài khoản cron-job.org) khi:
- một lần chạy bị lỗi,
- job chạy thành công trở lại sau khi lỗi,
- job bị cron-job.org tự động tắt do lỗi liên tục.
