import { Router, Request, Response } from "express";
import * as db from "../prisma"; // รองรับทั้ง export แบบ named/default
const prisma = (db as any).prisma || (db as any).default || (db as any);

const router = Router();

/**
 * GET /api/issues
 * query: page, pageSize, sort
 */
router.get('/api/issues', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1))
    const pageSize = Math.max(1, Number(req.query.pageSize || 50))
    const sort = String(req.query.sort || '-createdAt')

    const orderBy: any = {}
    if (sort.startsWith('-')) orderBy[sort.slice(1)] = 'desc'
    else orderBy[sort] = 'asc'

    const items = await prisma.issue.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        room: true
      }
    })
    const total = await prisma.issue.count()
    return res.json({ items, total, page, pageSize })
  } catch (err) {
    console.error('GET /api/issues error', err)
    return res.status(500).json({ error: 'cannot load issues' })
  }
})

/**
 * POST /api/issues
 * body: issueType, subject, description, priority, roomId (optional), reporterId (optional)
 */
router.post('/api/issues', async (req: Request, res: Response) => {
  try {
    const { issueType, subject, description, priority, roomId, reporterId: bodyReporterId } = req.body ?? {}

    if (!issueType || !subject || !description) {
      return res.status(400).json({ error: 'issueType, subject and description are required' })
    }

    // resolve reporter id (from auth or body or fallback to first user)
    let reporterId = Number((req as any).user?.sub ?? bodyReporterId ?? 0)
    if (!reporterId || Number.isNaN(reporterId)) {
      const first = await prisma.user.findFirst({ select: { id: true } })
      if (first) reporterId = first.id
    }
    if (!reporterId) return res.status(400).json({ error: 'reporterId required (authenticate or provide reporterId)' })

    // validate optional roomId
    let validRoomId: number | undefined = undefined
    if (roomId !== undefined && roomId !== null && String(roomId).trim() !== '') {
      const idNum = Number(roomId)
      if (Number.isNaN(idNum)) return res.status(400).json({ error: 'roomId must be a number' })
      const room = await prisma.room.findUnique({ where: { id: idNum } })
      if (!room) return res.status(400).json({ error: 'roomId not found' })
      validRoomId = idNum
    }

    const data: any = {
      reporterId,
      issueType,
      subject,
      description,
      priority: priority ?? 'MEDIUM'
    }
    if (validRoomId) data.roomId = validRoomId

    const issue = await prisma.issue.create({
      data,
      include: { reporter: { select: { id: true, fullName: true, email: true } }, room: true }
    })

    return res.json({ issue })
  } catch (err: any) {
    console.error('POST /api/issues error:', err && err.stack ? err.stack : err)
    if (err?.code === 'P2003') {
      return res.status(400).json({ error: 'Foreign key constraint failed (invalid reporterId or roomId)' })
    }
    return res.status(500).json({ error: err?.message || 'Internal Server Error' })
  }
})

export default router