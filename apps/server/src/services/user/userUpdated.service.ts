import User from '../../models/User.js';
import { BadRequestError } from '../../utils/errors/badRequest.error.js';
import { getPrimaryEmail } from '../../utils/user/getPrimaryEmail.utils.js';

import type { UserJSON } from '@clerk/express';

export async function handleUserUpdated(user: UserJSON) {
  if (!user.id) {
    throw new BadRequestError('Missing user id');
  }

  const primaryEmail = getPrimaryEmail(user);

  await User.updateOne(
    { clerkId: user.id },
    {
      $set: {
        email: primaryEmail ?? '',
        username: user.username ?? '',
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        imageUrl: user.image_url ?? '',
      },
      $setOnInsert: {
        clerkId: user.id,
        pinnedCVCount: 0,
      },
    },
    { upsert: true },
  );
}
