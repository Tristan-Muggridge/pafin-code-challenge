import crypto from 'crypto';
export const createHash = (payload: string) => crypto.createHash('sha256').update(payload).digest('hex');