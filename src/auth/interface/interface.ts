import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

export interface ITokens {
  accessJwt: string;
  refreshJwt: string;
}

export interface IDataDefaultUser {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
}
