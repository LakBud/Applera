import User from '../../models/User.js';

import type { UserJSON } from '@clerk/express';

export async function handleUserCreated(user: UserJSON) {
  await User.findOneAndUpdate(
    { clerkId: user.id },
    {
      $setOnInsert: {
        clerkId: user.id,
        email: user.email_addresses[0]?.email_address ?? '',
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
