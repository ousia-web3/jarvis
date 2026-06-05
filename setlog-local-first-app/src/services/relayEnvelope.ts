import * as Crypto from "expo-crypto";

import type { LocalClip, RelayEnvelope } from "../types";

export async function createRelayEnvelope(
  clip: LocalClip,
  ttlHours = 48,
): Promise<RelayEnvelope> {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  const assetIdHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${clip.assetId}:${clip.createdAt}:${expiresAt}`,
  );

  return {
    id: Crypto.randomUUID(),
    clipId: clip.id,
    assetIdHash,
    expiresAt,
    ttlHours,
    state: "client_side_manifest_only",
  };
}
