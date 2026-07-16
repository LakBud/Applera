import Application from '../../models/Application.js';
import {
  clearUserCache,
  deleteUserCloudinaryAssets,
  deleteUserRecords,
} from './userDeleted.helpers.service.js';

export async function handleUserDeleted(clerkId: string) {
  console.log(`[webhook] Deleting all data for user: ${clerkId}`);

  try {
    const applicationIds = await getApplicationIds(clerkId);

    await deleteUserCloudinaryAssets(clerkId);
    await clearUserCache(clerkId, applicationIds);
    await deleteUserRecords(clerkId, applicationIds);

    console.log(`[webhook] Successfully deleted all data for user: ${clerkId}`);
  } catch (err) {
    console.error(`[webhook] Failed to fully delete data for user ${clerkId}:`, err);
  }
}

async function getApplicationIds(clerkId: string) {
  const applications = await Application.find({
    ownerId: clerkId,
  }).select('_id');

  return applications.map((a) => a._id);
}
