// prisma/seed.ts
import { PrismaClient, ServiceCategory, RoomStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/** รหัสผ่านเริ่มต้นตามตำแหน่งงาน เช่น "IT Support" -> "ITSupport@123" */
function getDefaultPasswordByPosition(positionName: string): string {
  return positionName.replace(/\s+/g, "") + "@123";
}

async function main() {
  console.log("🌱 Start seeding...");

  // ========== 1) Departments ==========
  const [itDept, hkDept, ntDept, opsDept, salesDept, hrDept, finDept] =
    await Promise.all([
      prisma.department.upsert({
        where: { name: "IT" }, update: {}, create: { name: "IT" },
      }),
      prisma.department.upsert({
        where: { name: "Housekeeping" }, update: {}, create: { name: "Housekeeping" },
      }),
      prisma.department.upsert({
        where: { name: "NoteTaking" }, update: {}, create: { name: "NoteTaking" },
      }),
      prisma.department.upsert({
        where: { name: "Operations" }, update: {}, create: { name: "Operations" },
      }),
      prisma.department.upsert({
        where: { name: "Sales" }, update: {}, create: { name: "Sales" },
      }),
      prisma.department.upsert({
        where: { name: "HR" }, update: {}, create: { name: "HR" },
      }),
      prisma.department.upsert({
        where: { name: "Finance" }, update: {}, create: { name: "Finance" },
      }),
    ]);

  // ========== 2) Positions (รวม role + flags) ==========
  const positionsData = [
    // IT
    { name: "Admin",                 isAdmin: true,  isNoteManager: false, isNoteTaker: false, departmentId: itDept.id, description: "System administrator" },
    { name: "IT Manager",            isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: itDept.id },
    { name: "IT Support",            isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: itDept.id },
    { name: "System Engineer",       isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: itDept.id },
    { name: "Network Engineer",      isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: itDept.id },
    { name: "Audio-Visual Specialist", isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: itDept.id },

    // Housekeeping
    { name: "Housekeeping Manager",  isAdmin: false, isNoteManager: false, isNoteTaker: false, isHousekeepingLead: true, departmentId: hkDept.id },
    { name: "Barista",               isAdmin: false, isNoteManager: false, isNoteTaker: false, isHousekeeper: true,    departmentId: hkDept.id },
    { name: "Cleaning Staff",        isAdmin: false, isNoteManager: false, isNoteTaker: false, isHousekeeper: true,    departmentId: hkDept.id },
    { name: "Logistics Staff",       isAdmin: false, isNoteManager: false, isNoteTaker: false, isHousekeeper: true,    departmentId: hkDept.id },

    // NoteTaking
    { name: "NoteTaking Manager",    isAdmin: false, isNoteManager: true,  isNoteTaker: false, departmentId: ntDept.id },
    { name: "NoteTaker",             isAdmin: false, isNoteManager: false, isNoteTaker: true,  departmentId: ntDept.id },
    { name: "Backup NoteTaker",      isAdmin: false, isNoteManager: false, isNoteTaker: true,  departmentId: ntDept.id },

    // Operations
    { name: "Operations Manager",    isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: opsDept.id },
    { name: "Operations Staff",      isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: opsDept.id },

    // Sales
    { name: "Sales Manager",         isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: salesDept.id },
    { name: "Sales Executive",       isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: salesDept.id },
    { name: "Sales Coordinator",     isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: salesDept.id },

    // HR
    { name: "HR Manager",            isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: hrDept.id },
    { name: "HR Officer",            isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: hrDept.id },
    { name: "HR Development Specialist", isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: hrDept.id },

    // Finance
    { name: "Finance Manager",       isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: finDept.id },
    { name: "Accountant",            isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: finDept.id },
    { name: "Financial Analyst",     isAdmin: false, isNoteManager: false, isNoteTaker: false, departmentId: finDept.id },
  ] as const;

  const positionMap: Record<string, number> = {};
  for (const p of positionsData) {
    const pos = await prisma.position.upsert({
      where: { name: p.name },
      update: {
        isAdmin:            p.isAdmin ?? false,
        isNoteManager:      p.isNoteManager ?? false,
        isNoteTaker:        p.isNoteTaker ?? false,
        isHousekeeper:      (p as any).isHousekeeper ?? false,
        isHousekeepingLead: (p as any).isHousekeepingLead ?? false,
        departmentId:       p.departmentId ?? null,
        description:        (p as any).description ?? null,
      },
      create: {
        name:               p.name,
        isAdmin:            p.isAdmin ?? false,
        isNoteManager:      p.isNoteManager ?? false,
        isNoteTaker:        p.isNoteTaker ?? false,
        isHousekeeper:      (p as any).isHousekeeper ?? false,
        isHousekeepingLead: (p as any).isHousekeepingLead ?? false,
        departmentId:       p.departmentId ?? null,
        description:        (p as any).description ?? null,
      },
    });
    positionMap[p.name] = pos.id;
  }

  // ========== 3) Users (รหัสผ่านตามตำแหน่ง) ==========
  const usersData = [
    // Admin
    { username: "admin", fullName: "System Admin", email: "admin@corp.local", position: "Admin" },

    // Managers
    { username: "mgr_it",   fullName: "Mint IT Manager",   email: "mint.it@corp.local",   position: "IT Manager" },
    { username: "mgr_ops",  fullName: "Napat Ops Manager", email: "napat.ops@corp.local", position: "Operations Manager" },
    { username: "mgr_sales",fullName: "Prae Sales Manager",email: "prae.sales@corp.local",position: "Sales Manager" },
    { username: "mgr_hr",   fullName: "Korn HR Manager",   email: "korn.hr@corp.local",   position: "HR Manager" },
    { username: "mgr_fin",  fullName: "Ann Finance Manager",email: "ann.fin@corp.local",  position: "Finance Manager" },

    // IT members
    { username: "it_support1", fullName: "Ball IT Support",      email: "ball.it1@corp.local", position: "IT Support" },
    { username: "sys_eng1",    fullName: "Jane System Engineer", email: "jane.se@corp.local",  position: "System Engineer" },
    { username: "net_eng1",    fullName: "Golf Network Engineer",email: "golf.ne@corp.local",  position: "Network Engineer" },
    { username: "av_spec1",    fullName: "Aum AV Specialist",    email: "aum.av@corp.local",   position: "Audio-Visual Specialist" },

    // Ops / Sales / HR / Finance Staff
    { username: "ops1",        fullName: "Som Ops Staff",        email: "som.ops@corp.local",  position: "Operations Staff" },
    { username: "sales_exec1", fullName: "Game Sales Exec",      email: "game.sales@corp.local",position: "Sales Executive" },
    { username: "sales_coord1",fullName: "Fern Sales Coord",     email: "fern.sales@corp.local",position: "Sales Coordinator" },
    { username: "hr_off1",     fullName: "Prim HR Officer",      email: "prim.hr@corp.local",  position: "HR Officer" },
    { username: "acct1",       fullName: "Beam Accountant",      email: "beam.fin@corp.local", position: "Accountant" },
    { username: "fa1",         fullName: "Boss Financial Analyst",email: "boss.fa@corp.local", position: "Financial Analyst" },

    // Housekeeping Team
    { username: "hk_mgr",   fullName: "Tuk Housekeeping Manager", email: "tuk.hk@corp.local",  position: "Housekeeping Manager" },
    { username: "barista1", fullName: "Nam Barista",              email: "nam.barista@corp.local", position: "Barista" },
    { username: "clean1",   fullName: "Dao Cleaning Staff",       email: "dao.clean@corp.local",   position: "Cleaning Staff" },
    { username: "logi1",    fullName: "Ken Logistics",            email: "ken.logi@corp.local",    position: "Logistics Staff" },

    // NoteTaking team
    { username: "nt_mgr",   fullName: "Pan NoteTaking Manager",   email: "pan.nt@corp.local",   position: "NoteTaking Manager" },
    { username: "note1",    fullName: "Fon Note Taker",           email: "fon.note@corp.local", position: "NoteTaker" },
    { username: "note2",    fullName: "Jame Note Taker",          email: "jame.note@corp.local",position: "NoteTaker" },
    { username: "note3",    fullName: "Beam Note Taker",          email: "beam.note@corp.local",position: "NoteTaker" },
    { username: "note4",    fullName: "View Note Taker",          email: "view.note@corp.local",position: "NoteTaker" },
    { username: "note5",    fullName: "Ice Backup NT",            email: "ice.bnt@corp.local",  position: "Backup NoteTaker" },
    { username: "note6",    fullName: "Ohm Backup NT",            email: "ohm.bnt@corp.local",  position: "Backup NoteTaker" },
  ] as const;

  for (const u of usersData) {
    const plain = getDefaultPasswordByPosition(u.position);
    const passwordHash = await bcrypt.hash(plain, 10);

    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        fullName: u.fullName,
        email: u.email,
        positionId: positionMap[u.position],
      },
      create: {
        username: u.username,
        passwordHash,
        fullName: u.fullName,
        email: u.email,
        positionId: positionMap[u.position],
      },
    });

    console.log(`👤 ${u.username} (pos: ${u.position}) → default password: ${plain}`);
  }

  // Helper
  const getUserId = async (username: string) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error(`User not found: ${username}`);
    return user.id;
  };

  // ========== 4) Meeting Rooms (30/50/100 อย่างละ 10 ห้อง) ==========
  const roomSizes = [30, 50, 100] as const;
  const letters = "ABCDEFGHIJ".split(""); // 10 ห้อง
  for (const cap of roomSizes) {
    for (const L of letters) {
      const roomName = `Room-${cap}${L}`;
      await prisma.meetingRoom.upsert({
        where: { roomName },
        update: { capacity: cap, status: RoomStatus.AVAILABLE },
        create: { roomName, capacity: cap, status: RoomStatus.AVAILABLE },
      });
    }
  }

  // ========== 5) Services ==========
  await Promise.all([
    prisma.service.upsert({
      where: { name: "Projector" },
      update: { departmentId: itDept.id, requiresApproval: true },
      create: {
        name: "Projector",
        category: ServiceCategory.IT,
        departmentId: itDept.id,
        requiresApproval: true,
      },
    }),
    prisma.service.upsert({
      where: { name: "Sound System" },
      update: { departmentId: itDept.id, requiresApproval: true },
      create: {
        name: "Sound System",
        category: ServiceCategory.IT,
        departmentId: itDept.id,
        requiresApproval: true,
      },
    }),
    prisma.service.upsert({
      where: { name: "Coffee & Drinks" },
      update: { departmentId: hkDept.id, requiresApproval: false },
      create: {
        name: "Coffee & Drinks",
        category: ServiceCategory.HOUSEKEEPING,
        departmentId: hkDept.id,
        requiresApproval: false,
      },
    }),
    prisma.service.upsert({
      where: { name: "Meeting Minutes" },
      update: { departmentId: ntDept.id, requiresApproval: false },
      create: {
        name: "Meeting Minutes",
        category: ServiceCategory.NOTETAKING,
        departmentId: ntDept.id,
        requiresApproval: false,
      },
    }),
  ]);

  // ========== 6) NoteTaker Queue (NoteTaker + Backup NoteTaker) ==========
  const noteUsernames = usersData
    .filter(u => /NoteTaker/i.test(u.position)) // ทั้ง NoteTaker และ Backup NoteTaker
    .map(u => u.username);

  let orderNo = 1;
  for (const uname of noteUsernames) {
    const uid = await getUserId(uname);
    await prisma.noteTakerQueue.upsert({
      where: { userId: uid },
      update: { orderNo, isActive: true },
      create: { userId: uid, orderNo, isActive: true },
    });
    orderNo++;
  }

  console.log("✅ Seeding completed successfully!");
}

// ใช้ async IIFE เพื่อ flow ปลอดภัย
(async () => {
  try {
    await main();
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
