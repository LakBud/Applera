import User from '../../models/User.js';

type ClerkUserInput = {
  clerkId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
};

export async function findOrCreateUser(input: ClerkUserInput) {
  return User.findOneAndUpdate(
    { clerkId: input.clerkId },
    {
      $setOnInsert: {
        clerkId: input.clerkId,
        email: input.email ?? '',
        firstName: input.firstName ?? '',
        lastName: input.lastName ?? '',
        imageUrl: input.imageUrl ?? '',
      },
    },
    {
      new: true,
      upsert: true,
    },
  );
}
