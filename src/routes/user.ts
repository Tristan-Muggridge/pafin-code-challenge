import { Router } from "express";
import db from "../db";

const router = Router();

router.get('/', async (req, res) => {
    const users = await db.user.findMany();
    res.json(users);
});

export default router;