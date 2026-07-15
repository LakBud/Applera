import type { UserJSON } from '@clerk/express';

export function getPrimaryEmail(user: UserJSON): string | undefined {
  return user.email_addresses?.find((email) => email.id === user.primary_email_address_id)
    ?.email_address;
}
