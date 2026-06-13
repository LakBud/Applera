import express from 'express';

import { handleClerkWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Raw body needed for Svix signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
