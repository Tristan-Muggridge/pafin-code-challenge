import { Router } from "express";
import AuthController from "../controllers/auth";
import getDB from "../database/getDB";
import settings from "../appSettings";

const controller = AuthController(getDB());
const router = Router();

router.post('/login', controller.login);

// only meant for testing
settings.environment !== 'production' && router.post('/create-admin-user', controller.TEST_ONLY_create_admin_user);

export default router;