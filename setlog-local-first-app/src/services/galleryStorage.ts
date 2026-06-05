import { Album, Asset } from "expo-media-library";

import { DAY_SLOT_ALBUM } from "../constants";
import type { SavedGalleryAsset } from "../types";

export async function saveClipToGallery(localUri: string): Promise<SavedGalleryAsset> {
  let album = await Album.get(DAY_SLOT_ALBUM);
  const asset = await Asset.create(localUri, album ?? undefined);

  if (!album) {
    album = await Album.create(DAY_SLOT_ALBUM, [asset], true);
  }

  return {
    assetId: asset.id,
    albumTitle: await album.getTitle(),
    filename: await asset.getFilename().catch(() => null),
    durationMs: await asset.getDuration().catch(() => null),
  };
}
