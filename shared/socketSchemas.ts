import { z } from "zod";

/* ========= Shared primitives ========= */

export const zId = z.string().min(1);
export const zUserRef = z.object({ id: zId, name: z.string().min(1) });
export const zStatus = z.enum(["idle", "busy"]);
export const zDecision = z.enum(["accept", "reject"]);
export const zResultPair = z.enum(["match", "notMatch"]);
export const zEndReason = z.enum(["allFound", "exit", "timeout"]);
export const zCardState = z.enum(["down", "open", "found"]);

/* ========= Error payload ========= */

export const zError = z.object({
  code: z.enum([
    "UNAUTH", // chưa/không hợp lệ auth
    "INVALID", // payload sai schema hoặc state
    "MATCH_NOT_FOUND", // không tồn tại trận
    "NOT_IN_MATCH", // không thuộc trận
    "NOT_YOUR_TURN", // không phải lượt
    "CARD_ALREADY_OPEN", // lá đã mở cố định
    "BUFFER_FULL", // đã lật đủ 2 lá
    "NEED_TWO_FLIPS", // chưa đủ 2 lá để Send
    "INVITE_NOT_FOUND", // không thấy lời mời
    "REJECTED", // bị từ chối
    "RATE_LIMITED", // bị giới hạn tần suất
    "INTERNAL", // lỗi hệ thống
  ]),
  message: z.string(),
});
export type ErrorPayload = z.infer<typeof zError>;

/* ========= Client -> Server ========= */

// 1) auth:token
export const zC2SAuthToken = z.object({
  token: z.string().min(10),
});

// 2) presence:list
export const zC2SPresenceList = z.object({}).strict();

// 3) invite:send
export const zC2SInviteSend = z.object({
  toUserId: zId,
});

// 4) invite:cancel
export const zC2SInviteCancel = z.object({
  inviteId: zId,
});

// 5) invite:respond
export const zC2SInviteRespond = z.object({
  inviteId: zId,
  decision: zDecision,
});

// 6) match:join
export const zC2SMatchJoin = z.object({
  matchId: zId,
});

// 7) match:flip
export const zC2SMatchFlip = z.object({
  matchId: zId,
  cardIndex: z.number().int().nonnegative(),
});

// 8) match:sendPair
export const zC2SMatchSendPair = z.object({
  matchId: zId,
});

// 9) match:exit
export const zC2SMatchExit = z.object({
  matchId: zId,
});

// 10) match:replay:vote
export const zC2SReplayVote = z.object({
  matchId: zId,
  agree: z.boolean(),
});

// 11) chat:send
export const zC2SChatSend = z.object({
  matchId: zId,
  message: z.string().min(1).max(500),
});

/* ========= Server -> Client ========= */

// 1) presence:update
export const zS2CPresenceUpdate = z.object({
  users: z.array(
    z.object({
      id: zId,
      name: z.string().min(1),
      totalPoints: z.number().int().nonnegative(),
      status: zStatus,
    })
  ),
});

// 2) invite:received
export const zS2CInviteReceived = z.object({
  inviteId: zId,
  fromUser: zUserRef,
});

// 3) invite:canceled
export const zS2CInviteCanceled = z.object({
  inviteId: zId,
});

// 4) invite:result
export const zS2CInviteResult = z.object({
  inviteId: zId,
  status: z.enum(["accepted", "rejected"]),
});

// 5) match:state
export const zS2CMatchState = z.object({
  matchId: zId,
  boardSize: z.number().int().positive(), // 16 | 36, v.v.
  cards: z.array(
    z.object({
      idx: z.number().int().nonnegative(),
      state: zCardState,
    })
  ),
  scores: z.object({
    p1: z.number().int().nonnegative(),
    p2: z.number().int().nonnegative(),
  }),
  turnUserId: zId,
  openedPairs: z.array(
    z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])
  ),
  historyId: z.string().optional(),
});

// 6) match:flip:ack
export const zS2CFlipAck = z.object({
  matchId: zId,
  byUserId: zId,
  cardIndex: z.number().int().nonnegative(),
});

// 7) match:pair:result
export const zS2CPairResult = z.object({
  matchId: zId,
  result: zResultPair,
  pair: z.tuple([
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
  ]),
});

// 8) match:turn:update
export const zS2CTurnUpdate = z.object({
  matchId: zId,
  userId: zId,
  deadlineTs: z.number().int().nonnegative(), // epoch ms
});

// 9) match:timer:tick
export const zS2CTimerTick = z.object({
  matchId: zId,
  remainingMs: z.number().int().nonnegative(),
});

// 10) match:end
export const zS2CMatchEnd = z.object({
  matchId: zId,
  winnerId: zId.nullable(),
  scores: z.object({
    p1: z.number().int().nonnegative(),
    p2: z.number().int().nonnegative(),
  }),
  reason: zEndReason,
});

// 11) match:replay:status
export const zS2CReplayStatus = z.object({
  matchId: zId,
  votes: z.object({
    p1: z.boolean(),
    p2: z.boolean(),
  }),
  ready: z.boolean(),
});

// 12) chat:message
export const zS2CChatMessage = z.object({
  matchId: zId,
  fromUser: zUserRef,
  text: z.string().min(1).max(500),
  ts: z.number().int().nonnegative(),
});
