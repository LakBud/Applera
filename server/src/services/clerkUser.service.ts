import User from "../models/User.js";

type ClerkUserInput = {
  clerkId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
};

export async function findOrCreateUser(input: ClerkUserInput) {
  const existing = await User.findOne({ clerkId: input.clerkId });

  if (existing) return existing;

  return User.create({
    clerkId: input.clerkId,
    email: input.email ?? "",
    firstName: input.firstName,
    lastName: input.lastName,
    imageUrl: input.imageUrl,
  });
}
