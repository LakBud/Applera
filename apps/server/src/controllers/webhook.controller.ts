import { CLERK_WEBHOOK_SECRET } from '../config/env.js';
import { verifyWebhook } from '../lib/verifyWebhook.js';
import { handleUserCreated } from '../services/user/userCreated.service.js';
import { handleUserDeleted } from '../services/user/userDeleted.service.js';
import { handleUserUpdated } from '../services/user/userUpdated.service.js';
import { BadRequestError } from '../utils/errors/badRequest.error.js';

import type { Request, Response } from 'express';

export async function handleClerkWebhook(req: Request, res: Response) {
  const event = verifyWebhook(CLERK_WEBHOOK_SECRET, req.body, {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  });

  switch (event.type) {
    case 'user.created':
      await handleUserCreated(event.data);
      break;

    case 'user.updated':
      await handleUserUpdated(event.data);
      break;

    case 'user.deleted':
      if (!event.data.id) {
        throw new BadRequestError('Missing user id');
      }

      await handleUserDeleted(event.data.id);
      break;
  }

  res.json({ received: true });
}
