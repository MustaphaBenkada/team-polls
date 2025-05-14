declare namespace Express {
  export interface Request {
    userId?: string;
    socket: {
      remoteAddress?: string;
    };
  }
} 