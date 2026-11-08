# cronjob

Tạo job trên [cron-job.org](https://cron-job.org) gọi:

```
curl -X POST "https://api-services.hostless.app/crm/checkin?device=Desktop"
```

lúc **08:51 sáng, thứ 2 – thứ 6** (múi giờ `Asia/Ho_Chi_Minh`).

## Cách dùng

1. Lấy API key tại cron-job.org → *Settings* → *API*.
2. `cp .env.example .env` rồi điền `CRONJOB_KEY=...`
3. Chạy (Node ≥ 20.6):

   ```
   node --env-file=.env create-job.mjs
   ```

Chạy lại script sẽ cập nhật job cũ (theo title) thay vì tạo trùng.
