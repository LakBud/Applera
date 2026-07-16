import User from '../../models/User.js';
import { getPrimaryEmail } from '../../utils/user/getPrimaryEmail.utils.js';

import type { UserJSON } from '@clerk/express';

export async function handleUserCreated(user: UserJSON) {
  const primaryEmail = getPrimaryEmail(user);

  await User.findOneAndUpdate(
    { clerkId: user.id },
    {
      $setOnInsert: {
        clerkId: user.id,
        email: primaryEmail ?? '',
        username: user.username ?? '',
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        imageUrl: user.image_url ?? '',
        pinnedCVCount: 0,
      },
    },
    {
      upsert: true,
    },
  );

  console.log(`[webhook] Created user: ${user.id}`);
}
