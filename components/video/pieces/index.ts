import type { Piece } from '../piece';
import { contact } from './contact';

/** Every piece the factory can render (lotes V1–V5 add theirs here). */
export const PIECES = { contact } satisfies Record<string, Piece>;
export type PieceId = keyof typeof PIECES;

export const isPieceId = (value: unknown): value is PieceId => typeof value === 'string' && value in PIECES;
