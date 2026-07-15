import type { Identity } from './schemas/identity.schemas.js';
import type { Request } from 'express';

export interface IdentifiedRequest extends Request {
  identity: Identity;
}

export interface UserRequest extends Request {
  identity: Extract<Identity, { type: 'user' }>;
}
