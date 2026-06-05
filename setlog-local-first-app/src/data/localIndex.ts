import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";

import type { CaptureDuration, LocalClip, Mood } from "../types";
import { DEFAULT_ROOM_ID } from "../constants";
import { toDayKey, toSlotKey } from "../utils/date";

type ClipRow = {
  id: string;
  asset_id: string;
  cache_uri: string | null;
  album_title: string;
  room_id: string;
  day_key: string;
  slot_key: string;
  duration_seconds: number;
  caption: string;
  mood: Mood;
  product_tag: string | null;
  storage_mode: "gallery" | "private_vault";
  relay_state: "local_only" | "relay_ready" | "relay_sent";
  created_at: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("dayslot-local-index.db");
  }

  return dbPromise;
}

export async function initializeLocalIndex() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY NOT NULL,
      asset_id TEXT NOT NULL UNIQUE,
      cache_uri TEXT,
      album_title TEXT NOT NULL,
      room_id TEXT NOT NULL,
      day_key TEXT NOT NULL,
      slot_key TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      mood TEXT NOT NULL,
      product_tag TEXT,
      storage_mode TEXT NOT NULL,
      relay_state TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_clips_day_key ON clips(day_key);
    CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at);
  `);
}

export async function insertClip(input: {
  assetId: string;
  cacheUri: string | null;
  albumTitle: string;
  durationSeconds: CaptureDuration;
  caption: string;
  mood: Mood;
  productTag: string | null;
}) {
  const db = await getDatabase();
  const now = new Date();
  const clip: LocalClip = {
    id: Crypto.randomUUID(),
    assetId: input.assetId,
    cacheUri: input.cacheUri,
    albumTitle: input.albumTitle,
    roomId: DEFAULT_ROOM_ID,
    dayKey: toDayKey(now),
    slotKey: toSlotKey(now),
    durationSeconds: input.durationSeconds,
    caption: input.caption.trim(),
    mood: input.mood,
    productTag: input.productTag?.trim() || null,
    storageMode: "gallery",
    relayState: "local_only",
    createdAt: now.toISOString(),
  };

  await db.runAsync(
    `INSERT OR REPLACE INTO clips (
      id,
      asset_id,
      cache_uri,
      album_title,
      room_id,
      day_key,
      slot_key,
      duration_seconds,
      caption,
      mood,
      product_tag,
      storage_mode,
      relay_state,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    clip.id,
    clip.assetId,
    clip.cacheUri,
    clip.albumTitle,
    clip.roomId,
    clip.dayKey,
    clip.slotKey,
    clip.durationSeconds,
    clip.caption,
    clip.mood,
    clip.productTag,
    clip.storageMode,
    clip.relayState,
    clip.createdAt,
  );

  return clip;
}

export async function listRecentClips(limit = 12) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ClipRow>(
    `SELECT * FROM clips ORDER BY created_at DESC LIMIT ?`,
    limit,
  );

  return rows.map(rowToClip);
}

export async function countTodayClips() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM clips WHERE day_key = ?`,
    toDayKey(),
  );

  return row?.count ?? 0;
}

function rowToClip(row: ClipRow): LocalClip {
  return {
    id: row.id,
    assetId: row.asset_id,
    cacheUri: row.cache_uri,
    albumTitle: row.album_title,
    roomId: row.room_id,
    dayKey: row.day_key,
    slotKey: row.slot_key,
    durationSeconds: row.duration_seconds as CaptureDuration,
    caption: row.caption,
    mood: row.mood,
    productTag: row.product_tag,
    storageMode: row.storage_mode,
    relayState: row.relay_state,
    createdAt: row.created_at,
  };
}
