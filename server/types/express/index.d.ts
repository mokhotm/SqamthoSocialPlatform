// @ts-nocheck
// Only used for type augmentation, not runtime import
import type { User } from '../../../shared/schema.js';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id'>;
    }
  }
}

export {};
