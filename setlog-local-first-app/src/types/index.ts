export type CaptureDuration = 2 | 3 | 4;

export type Mood = "clear" | "busy" | "social" | "focus";

export type StorageMode = "gallery" | "private_vault";

export type RelayState = "local_only" | "relay_ready" | "relay_sent";

export type LocalClip = {
  id: string;
  assetId: string;
  cacheUri: string | null;
  albumTitle: string;
  roomId: string;
  dayKey: string;
  slotKey: string;
  durationSeconds: CaptureDuration;
  caption: string;
  mood: Mood;
  productTag: string | null;
  storageMode: StorageMode;
  relayState: RelayState;
  createdAt: string;
};

export type SavedGalleryAsset = {
  assetId: string;
  albumTitle: string;
  filename: string | null;
  durationMs: number | null;
};

export type RelayEnvelope = {
  id: string;
  clipId: string;
  assetIdHash: string;
  expiresAt: string;
  ttlHours: number;
  state: "client_side_manifest_only";
};
