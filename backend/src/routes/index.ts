import { isNotetaker } from '@/middleware/auth.ts';

router.get('/note-taker/dashboard', auth, isNotetaker, (req, res) => {
  res.json({ message: "Welcome to NoteTaker Dashboard" });
});