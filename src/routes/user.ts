import { Router } from "express";
import userController from "../controllers/user";

import settings from "../appSettings";
import { memoryDb, prismaDb } from "../database/db";

const router = Router();
const getDb = () => settings.dbType === 'prisma' ? prismaDb : memoryDb;
const controller = userController(getDb());

router.route('/')
    .get(controller.getAll)
    .post(controller.create)

router.route('/:id')
    .get(controller.getOne)
    .patch(controller.update)
    .delete(controller.delete)

export default router;