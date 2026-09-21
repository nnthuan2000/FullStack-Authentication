import type { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  name?: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
