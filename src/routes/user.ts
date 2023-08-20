import { Router } from "express";
import userController from "../controllers/user";
import getDB from "../database/getDB";

const router = Router();
const controller = userController(getDB());

router.route('/')
    .get(controller.getAll)
    .post(controller.create)

router.route('/:id')
    .get(controller.getOne)
    .patch(controller.update)
    .delete(controller.delete)

export default router;