import { Router } from "express";
import { prisma } from "../prisma";
import { htmlToPdfBuffer } from "../pdf/makePdf";
import { renderBookingHtml, BookingPdfData } from "../pdf/bookingHtml";
// import { auth } from "../middleware/auth"; // ถ้าต้องการล็อกอินก่อนดาวน์โหลด

const router = Router();

/** (A) ดาวน์โหลด PDF เฉพาะรายการเดียว */
router.get("/:id/pdf", /*auth,*/ async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

  const booking = await prisma.booking.findUnique({
  where: { id },
  include: {
    room: true,
    bookedBy: { include: { position: { include: { department: true } } } },
    invites: { include: { user: true } },
    services: { include: { service: true } },
  },
});
if (!booking) return res.status(404).json({ error: "not found" });

  // ←← แมปตรงนี้ให้เข้ากับ schema ของคุณ
  const data: BookingPdfData = {
  code: `BK-${booking.id}`,
  roomName: booking.room?.roomName ?? "-",                     // MeetingRoom.roomName ✅
  organizer: booking.bookedBy?.fullName ??                     // User.fullName ✅
             booking.bookedBy?.username ?? "-",
  department:
    booking.bookedBy?.position?.department?.name ??            // Position -> Department ✅
    booking.bookedBy?.position?.name ??                        // fallback ชื่อ Position
    undefined,
  dateStart: booking.startTime,                                 // ✅ ตาม schema จริง
  dateEnd:   booking.endTime,                                   // ✅ ตาม schema จริง
  attendees: (booking.invites ?? []).map((i) => ({
    name:  i.user?.fullName ?? i.user?.email ?? `user#${i.userId}`,
    email: i.user?.email ?? undefined,
  })),
  equipments: (booking.services ?? []).map((bs) => bs.service?.name ?? "-"),
  agenda: booking.purpose ?? "",                                // ✅ Booking.purpose (optional)                                  // ถ้าไม่มีฟิลด์นี้ให้ลบออก
};



  const html = renderBookingHtml(data);
  const pdf = await htmlToPdfBuffer(html, {
    format: "A4",
    headerHtml: `
      <div style="font-size:12px;width:100%;padding:0 24px;display:flex;align-items:center;justify-content:space-between;">
        <div><b>แบบฟอร์มการจองห้องประชุม</b></div>
        <div>รหัส: ${data.code}</div>
      </div>
    `,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="booking-${data.code}.pdf"`);
  res.send(pdf);
});

/** (B) ดาวน์โหลด PDF รายงานช่วงเวลา (ตารางหลายแถว) */
router.get("/report/range.pdf", /*auth,*/ async (req, res) => {
  const { from, to, roomId } = req.query as { from?: string; to?: string; roomId?: string };

  const where: any = {};
  if (from) where.startTime = { gte: new Date(from) };
  if (to) where.endTime = { ...(where.endTime || {}), lte: new Date(to) };
  if (roomId) where.roomId = Number(roomId);

  const rows = await prisma.booking.findMany({
    where,
    orderBy: [{ startTime: "asc" }],
    include: { room: true, bookedBy: true, services: { include: { service: true } } },
  });

  // สร้าง HTML แบบตารางสรุป
  const tableRows = rows.map((r, idx) => {
    const s = new Date(r.startTime);
    const e = new Date(r.endTime);
    const sv = (r.services ?? []).map(x => x.service?.name).filter(Boolean).join(", ") || "-";
    return `
    <tr>
      <td class="cell center">${idx + 1}</td>
      <td class="cell">${(r as any).code ?? `BK-${r.id}`}</td>
      <td class="cell">${r.room?.roomName ?? "-"}</td>
      <td class="cell">${r.bookedBy?.fullName ?? "-"}</td>
      <td class="cell">${s.toLocaleDateString("th-TH")} ${s.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}
        – ${e.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}</td>
      <td class="cell">${sv}</td>
    </tr>`;
  }).join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { font-family: system-ui, -apple-system, 'Sarabun', 'Segoe UI', Roboto, sans-serif; padding:24px; }
  .title { font-size: 18pt; font-weight: 700; margin-bottom: 8px; }
  .table { width:100%; border-collapse: collapse; }
  .cell, .th { border:1px solid #ccc; padding:6px 8px; }
  .th { background:#f3f4f6; font-weight:700; }
  .center { text-align:center; }
</style></head>
<body>
  <div class="title">สรุปการใช้งานห้องประชุม</div>
  <div style="margin-bottom:12px;">ช่วง: ${from ?? "-"} ถึง ${to ?? "-"}</div>
  <table class="table">
    <thead>
      <tr>
        <th class="th center" style="width:60px;">#</th>
        <th class="th">รหัส</th>
        <th class="th">ห้อง</th>
        <th class="th">ผู้จอง</th>
        <th class="th">เวลา</th>
        <th class="th">บริการ/อุปกรณ์</th>
      </tr>
    </thead>
    <tbody>${tableRows || `<tr><td class="cell center" colspan="6">ไม่มีข้อมูล</td></tr>`}</tbody>
  </table>
</body></html>`;

  const pdf = await htmlToPdfBuffer(html, { format: "A4", landscape: true });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="booking-report.pdf"`);
  res.send(pdf);
});

export default router;
