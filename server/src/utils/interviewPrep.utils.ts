import { Types } from 'mongoose';

export function isPopulatedOrThrow<T extends { _id: Types.ObjectId }>(
  value: T | Types.ObjectId | null | undefined,
  message: string,
): asserts value is T {
  if (!value || value instanceof Types.ObjectId) {
    throw new Error(message);
  }
}
