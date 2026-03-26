# Media Analytics Dashboard

Publisher Dashboard สำหรับ AE ใน Digital Agency — ดึงข้อมูลจาก GA4 จริง พร้อม AI วิเคราะห์ audience profile และสรุปผลรายเดือน

---

## Features

- **Real-time GA4 Data** — ดึงข้อมูลจาก Google Analytics 4 Data API โดยตรง
- **Audience Demographics** — City, Country, Gender, Age, Interests, Language
- **3 Key Media Metrics** — Total Pageviews, Unique Users, Est. PV/Article
- **Pageviews Trend** — กราฟ trend 7–90 วันล่าสุด
- **Top Articles** — บทความที่มี pageviews สูงสุด
- **Realtime Users** — จำนวนคนออนไลน์ขณะนี้ (อัปเดตทุก 30 วินาที)
- **AI Analysis** — วิเคราะห์ audience และสรุปผลด้วย Claude AI ใน 2 โหมด
  - **Pitch โฆษณา** — สรุป audience profile พร้อม pitch line สำหรับคุยกับแบรนด์
  - **Monthly Report** — สรุปผลงานประจำเดือนพร้อม talking points

---

## วิธีใช้งาน

### 1. ขอ Access Token

วิธีเร็วที่สุดสำหรับทดสอบ:

1. ไปที่ [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Step 1: เลือก **Google Analytics Data API v1beta** → เลือก `https://www.googleapis.com/auth/analytics.readonly`
3. กด **Authorize APIs** → login Google account ที่มีสิทธิ์เข้า GA4
4. Step 2: กด **Exchange authorization code for tokens**
5. Copy `access_token` (มีอายุ 1 ชั่วโมง)

### 2. หา GA4 Property ID

1. เปิด [analytics.google.com](https://analytics.google.com)
2. ไปที่ **Admin** → **Property Settings**
3. Copy **Property ID** (ตัวเลข เช่น `123456789`)

### 3. เปิด Dashboard

1. เปิดไฟล์ `media-dashboard-light.html` ในเบราว์เซอร์
2. กรอก Property ID, ชื่อเว็บ, จำนวนบทความ/วัน, และ Access Token
3. กด **เชื่อมต่อ →**

---

## Est. PV / Article คำนวณยังไง

```
Est. PV/Article = Total Pageviews ÷ (จำนวนวันในช่วง × บทความที่ publish/วัน)
```

**ตัวอย่าง:** ช่วง 30 วัน, publish 15 บทความ/วัน, Pageviews รวม 900,000

```
Est. PV/Article = 900,000 ÷ (30 × 15) = 2,000 views/บทความ
```

---

## โครงสร้างไฟล์

```
media-dashboard-light.html   ← ไฟล์เดียว ใช้งานได้เลย ไม่ต้อง install อะไร
README.md                    ← เอกสารนี้
ae-ga4-advisor.skill         ← Claude Skill สำหรับ AE วิเคราะห์ GA4
ae-agency-dashboard.jsx      ← Dashboard version React (สำหรับ developer)
```

---

## GA4 Metrics ที่ใช้

| Metric | GA4 Field | หมายความว่า |
|--------|-----------|-------------|
| Total Pageviews | `screenPageViews` | จำนวนหน้าที่ถูกดูทั้งหมด |
| Unique Users | `activeUsers` | จำนวนคนที่เข้ามาจริง ไม่นับซ้ำ |
| Sessions | `sessions` | จำนวนการเข้าเยี่ยมชม |
| Bounce Rate | `bounceRate` | สัดส่วนคนที่เข้ามาแล้วออกทันที |
| Avg. Duration | `averageSessionDuration` | ระยะเวลาเฉลี่ยต่อ session |
| Realtime Users | `activeUsers` (Realtime) | คนออนไลน์ขณะนี้ |

| Dimension | GA4 Field | หมายความว่า |
|-----------|-----------|-------------|
| City | `city` | เมืองของผู้ใช้ |
| Country | `country` | ประเทศของผู้ใช้ |
| Gender | `userGender` | เพศ |
| Age | `userAgeBracket` | ช่วงอายุ |
| Interests | `interestCategory` | ความสนใจ |
| Language | `language` | ภาษาของเบราว์เซอร์ |
| Top Pages | `pagePath` | URL บทความ |

---

## การเชื่อมต่อ GA4 แบบ Production

ไฟล์นี้ใช้ **Access Token โดยตรง** เหมาะสำหรับทดสอบ  
สำหรับใช้งานจริงในทีม แนะนำให้ทำ OAuth2 flow หรือ Service Account:

### OAuth2 (แนะนำ — AE login เอง)

```
Google Cloud Console
→ APIs & Services → Credentials
→ Create OAuth 2.0 Client ID (Web Application)
→ ใส่ Authorized JavaScript Origins และ Redirect URIs
```

### Service Account (สำหรับ automated report)

```
Google Cloud Console
→ IAM & Admin → Service Accounts → Create
→ ดาวน์โหลด JSON key
→ เพิ่ม service account email ใน GA4 Admin → Property Access Management
→ ให้สิทธิ์ Viewer
```

> ⚠️ อย่าเก็บ Service Account key ไว้ใน frontend หรือ commit ขึ้น Git

---

## Requirements

- เบราว์เซอร์ที่รองรับ ES2020+ (Chrome, Firefox, Safari, Edge รุ่นใหม่)
- GA4 Property ที่มีสิทธิ์ Viewer ขึ้นไป
- Access Token ที่ยังไม่หมดอายุ (มีอายุ 1 ชั่วโมง)
- Internet connection (ดึงข้อมูล GA4 API และ Claude API)

---

## Troubleshooting

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| `403 Forbidden` | Token หมดอายุหรือไม่มีสิทธิ์ | ขอ token ใหม่จาก OAuth Playground |
| `400 Bad Request` | Property ID ผิด | ตรวจสอบ Property ID ใน GA4 Admin |
| ข้อมูล Demographics ไม่แสดง | GA4 ยังไม่เก็บ demographic data | เปิด Google Signals ใน GA4 Admin |
| Interests ว่างเปล่า | ต้องการ traffic เพียงพอ | ข้อมูลจะแสดงเมื่อมี users เพียงพอ |
| AI ไม่วิเคราะห์ | Claude API error | ตรวจสอบ network และลองกด "วิเคราะห์ใหม่" |

---

## Claude Skill

ติดตั้ง `ae-ga4-advisor.skill` ใน Claude.ai เพื่อให้ Claude ช่วยวิเคราะห์ GA4 data ได้ทันทีเมื่อ AE วาง metrics มาถาม

**Trigger เมื่อพูดถึง:**
- ตัวเลข GA4 เช่น sessions, bounce rate, conversion
- "ทำ report เดือนนี้", "สรุปผลให้ลูกค้า"
- "วางแผน campaign เดือนหน้า"
- "ต่อสัญญา", "pitch ลูกค้า"

---

*สร้างโดย Claude · AE Analytics Dashboard Project*
