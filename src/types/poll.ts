import { z } from 'zod';

export const PollSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string(),
  options: z.string().array().min(2),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
});
export type Poll = z.infer<typeof PollSchema>;

export const VoteSchema = z.object({
  id: z.string().uuid().optional(),
  pollId: z.string().uuid(),
  userId: z.string(),
  optionIndex: z.number().int().min(0),
  createdAt: z.string().datetime().optional(),
});
export type Vote = z.infer<typeof VoteSchema>;

export const CreatePollSchema = PollSchema.omit({ id: true, createdAt: true });
export type CreatePollPayload = z.infer<typeof CreatePollSchema>;

export const CastVoteSchema = z.object({
  optionIndex: z.number().int().min(0),
});
export type CastVotePayload = z.infer<typeof CastVoteSchema>;