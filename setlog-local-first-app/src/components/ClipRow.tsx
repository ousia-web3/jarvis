import { StyleSheet, Text, View } from "react-native";

import { colors, radii } from "../theme/colors";
import type { LocalClip } from "../types";
import { toShortTime } from "../utils/date";

type ClipRowProps = {
  clip: LocalClip;
};

export function ClipRow({ clip }: ClipRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.timeBlock}>
        <Text style={styles.time}>{toShortTime(clip.createdAt)}</Text>
        <Text style={styles.duration}>{clip.durationSeconds}s</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.caption} numberOfLines={1}>
          {clip.caption || "Untitled slot"}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {clip.mood} / {clip.albumTitle} / {clip.productTag ?? "no tag"}
        </Text>
      </View>
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  timeBlock: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: radii.sm,
    minWidth: 56,
    paddingVertical: 7,
  },
  time: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  duration: {
    color: colors.moss,
    fontSize: 11,
    fontWeight: "700",
  },
  meta: {
    flex: 1,
    gap: 3,
  },
  caption: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  detail: {
    color: colors.muted,
    fontSize: 12,
  },
  dot: {
    backgroundColor: colors.sky,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
});
