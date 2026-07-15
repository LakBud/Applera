import { Webhook } from 'svix';

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

  return wh.verify(payload, headers) as WebhookEvent;
}
