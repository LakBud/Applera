import { Request, Response } from 'express';
import { Webhook } from 'svix';
import CV from '../models/CV.js';
import Application from '../models/Application.js';
import InterviewPrep from '../models/InterviewPrep.js';
import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';
import { CLERK_WEBHOOK_SECRET } from '../config/env.js';
import { deleteCache, deleteCachePattern } from '../lib/cache.js';

export async function handleClerkWebhook(req: Request, res: Response) {
  // Verify signature
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: any;

  try {
    event = wh.verify(req.body, {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string,
    });
  } catch (err) {
    console.error('[webhook] Invalid signature', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  if (event.type === 'user.deleted') {
    await handleUserDeleted(event.data.id);
  }

  res.json({ received: true });
}

async function handleUserDeleted(clerkId: string) {
  console.log(`[webhook] Deleting all data for user: ${clerkId}`);

  try {
    // 1. Collect all Cloudinary public IDs from CVs
    const cvs = await CV.find({
      ownerId: clerkId,
      cloudinaryPublicId: { $exists: true, $ne: null },
    });
    const cloudinaryIds = cvs.map((cv) => cv.cloudinaryPublicId).filter(Boolean) as string[];

    // 2. Delete Cloudinary assets in parallel
    if (cloudinaryIds.length > 0) {
      await Promise.allSettled(
        cloudinaryIds.map((id) => cloudinary.uploader.destroy(id, { resource_type: 'image' })),
      );
      console.log(`[webhook] Deleted ${cloudinaryIds.length} Cloudinary assets`);
    }

    // 3. Get application IDs to clean up InterviewPreps
    const applications = await Application.find({ ownerId: clerkId }).select('_id');
    const applicationIds = applications.map((a) => a._id);

    // cache cleanup
    await Promise.allSettled([
      deleteCachePattern(`cv:hash:${clerkId}:*`),
      deleteCachePattern(`cvs:${clerkId}:*`),
      deleteCachePattern(`usage:${clerkId}`),
      deleteCachePattern(`rl:*:user:${clerkId}`),
      ...applicationIds.map((id) => deleteCache(`interview:${id}`)),
      ...applicationIds.map((id) => deleteCachePattern(`application:*${id}*`)),
    ]);

    // 4. Delete all DB records
    await Promise.all([
      InterviewPrep.deleteMany({ application: { $in: applicationIds } }),
      Application.deleteMany({ ownerId: clerkId }),
      CV.deleteMany({ ownerId: clerkId }),
      User.deleteOne({ clerkId }),
      deleteCachePattern(`*${clerkId}*`),
    ]);

    console.log(`[webhook] Successfully deleted all data for user: ${clerkId}`);
  } catch (err) {
    // Log but don't throw — Clerk already deleted the auth account,
    // so we can't block or retry via a 500 response here.
    // Consider a dead-letter queue or alert for manual cleanup.
    console.error(`[webhook] Failed to fully delete data for user ${clerkId}:`, err);
  }
}
