import { Webhook } from 'svix';

import { BadRequestError } from '../utils/errors/badRequest.error.js';

import type { WebhookEvent } from '@clerk/express';

export function verifyWebhook(
  secret: string,
  payload: string | Buffer,
  headers: {
    'svix-id': string;
    'svix-timestamp': string;
    'svix-signature': string;
  },
): WebhookEvent {
  const wh = new Webhook(secret);

  try {
    return wh.verify(payload, headers) as WebhookEvent;
  } catch {
    throw new BadRequestError('Invalid webhook signature');
  }
}
