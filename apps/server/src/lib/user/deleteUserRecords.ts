import { Types } from 'mongoose';

import Application from '../../models/Application.js';
import CV from '../../models/CV.js';
import InterviewPrep from '../../models/InterviewPrep.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';

export async function deleteUserRecords(clerkId: string, applicationIds: Types.ObjectId[]) {
  await Promise.all([
    InterviewPrep.deleteMany({
      application: { $in: applicationIds },
    }),
    Application.deleteMany({ ownerId: clerkId }),
    CV.deleteMany({ ownerId: clerkId }),
    Job.deleteMany({ ownerId: clerkId }),
    User.deleteOne({ clerkId }),
  ]);
}
