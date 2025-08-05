import express from 'express';
import {
  getAdminStats,
  getAllAppointments,
  updateAppointmentStatus,
  signupAdmin,
  adminlogin,
  getAdminName,
  getAdminConnectId
} from '../controller/adminController.js';
import { adminAuthMiddleware } from '../middleware/authmiddleware.js'

const router = express.Router();

router.post('/signup', signupAdmin)
router.post('/login', adminlogin);
router.get('/me', adminAuthMiddleware, getAdminName);
router.get('/stats', getAdminStats);
router.get('/appointments', getAllAppointments);
router.put('/appointments/status', updateAppointmentStatus);

router.get('/get/connect-id', adminAuthMiddleware, getAdminConnectId)

export default router;