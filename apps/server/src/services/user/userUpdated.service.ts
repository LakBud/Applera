import User from '../../models/User.js';
import { BadRequestError } from '../../utils/errors/badRequest.error.js';

import type { UserJSON } from '@clerk/express';

export async function handleUserUpdated(user: UserJSON) {
  if (!user.id) {
    throw new BadRequestError('Missing user id');
  }

  await User.updateOne(
    { clerkId: user.id },
    {
      $set: {
        email: user.email_addresses?.[0]?.email_address ?? '',
        username: user.username ?? '',
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        imageUrl: user.image_url ?? '',
      },
    },
  );
}
