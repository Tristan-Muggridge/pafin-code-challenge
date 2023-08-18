import { Router } from "express";
import controller from "../controllers/user";

const router = Router();

router.route('/')
    .get(controller.getAll)
    .post(controller.create)

router.route('/:id')
    .get(controller.getOne)
    .put(controller.update)
    .delete(controller.delete)

export default router;