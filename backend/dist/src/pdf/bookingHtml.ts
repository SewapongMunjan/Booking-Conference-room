// backend/src/pdf/bookingHtml.ts
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

function fontToDataUri(p: string) {
  const abs = path.resolve(p);
  const buf = fs.readFileSync(abs);
  const b64 = buf.toString("base64");
  return `data:font/ttf;base64,${b64}`;
}

const sarabunRegular = fontToDataUri("assets/fonts/Sarabun-Regular.ttf");
const sarabunBold = fontToDataUri("assets/fonts/Sarabun-Bold.ttf");

export type BookingPdfData = {
  code: string; // เลข/โค้ดการจอง
  roomName: string;
  organizer: string;
  department?: string;
  dateStart: Date | string;
  dateEnd: Date | string;
  attendees?: { name: string; email?: string }[];
  equipments?: string[]; // projector, mic ฯลฯ
  agenda?: string;
  notes?: string;
};

export function renderBookingHtml(b: BookingPdfData) {
  const start = dayjs(b.dateStart);
  const end = dayjs(b.dateEnd);

  const attendeesHtml = (b.attendees?.length
    ? b.attendees.map((a, i) => `
        <tr>
          <td class="cell center">${i + 1}</td>
          <td class="cell">${a.name}</td>
          <td class="cell">${a.email ?? "-"}</td>
        </tr>`).join("")
    : `<tr><td class="cell center" colspan="3">-</td></tr>`
  );

  const equipHtml = (b.equipments?.length ? b.equipments.join(", ") : "-");

  return `
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @font-face {
    font-family: 'Sarabun';
    src: url('${sarabunRegular}') format('truetype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Sarabun';
    src: url('${sarabunBold}') format('truetype');
    font-weight: 700;
    font-style: normal;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Sarabun', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    margin: 0; padding: 24px; font-size: 12pt; color: #111;
  }
  .title { font-size: 18pt; font-weight: 700; margin-bottom: 8px; }
  .subtitle { color: #666; margin-bottom: 16px; }
  .section { margin-top: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .label { font-weight: 700; }
  .value { margin-left: 6px; }
  .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .cell, .th {
    border: 1px solid #ccc; padding: 6px 8px; vertical-align: top;
  }
  .th { background: #f3f4f6; font-weight: 700; }
  .center { text-align: center; }
  .muted { color: #666; }
  .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
</style>
</head>
<body>
  <div class="title">แบบฟอร์มการจองห้องประชุม</div>
  <div class="subtitle">รหัสการจอง: <b>${b.code}</b></div>

  <div class="section grid">
    <div class="box">
      <div><span class="label">ห้อง:</span><span class="value">${b.roomName}</span></div>
      <div><span class="label">ผู้จอง:</span><span class="value">${b.organizer}</span></div>
      <div><span class="label">หน่วยงาน:</span><span class="value">${b.department ?? "-"}</span></div>
    </div>
    <div class="box">
      <div><span class="label">วันที่-เวลาเริ่ม:</span><span class="value">
        ${start.format("D MMM BBBB เวลา HH:mm")}</span></div>
      <div><span class="label">วันที่-เวลาสิ้นสุด:</span><span class="value">
        ${end.format("D MMM BBBB เวลา HH:mm")}</span></div>
      <div><span class="label">ระยะเวลา:</span><span class="value">
        ${end.diff(start, "minute")} นาที</span></div>
    </div>
  </div>

  <div class="section">
    <div class="label">วาระประชุม / Agenda</div>
    <div class="box">${(b.agenda || "-").replace(/\n/g, "<br/>")}</div>
  </div>

  <div class="section">
    <div class="label">อุปกรณ์ที่ต้องการ</div>
    <div class="box">${equipHtml}</div>
  </div>

  <div class="section">
    <div class="label">ผู้เข้าร่วมประชุม</div>
    <table class="table">
      <thead>
        <tr>
          <th class="th center" style="width:60px;">#</th>
          <th class="th">ชื่อ</th>
          <th class="th" style="width:35%;">อีเมล</th>
        </tr>
      </thead>
      <tbody>
        ${attendeesHtml}
      </tbody>
    </table>
    <div class="muted">รวม ${b.attendees?.length ?? 0} คน</div>
  </div>

  <div class="section">
    <div class="label">หมายเหตุ</div>
    <div class="box">${(b.notes || "-").replace(/\n/g, "<br/>")}</div>
  </div>
</body>
</html>
`;
}
