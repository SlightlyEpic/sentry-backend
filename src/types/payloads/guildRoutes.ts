import { Permit, Punishment } from '../db';

export type SetPrefixPayload = { prefix: string };
export type AddPunishmentPayload = Punishment;
export type RemovePunishmentPayload = Punishment;
export type AddPermitPayload = Permit;
export type RemovePermitPayload = { permitName: string };
