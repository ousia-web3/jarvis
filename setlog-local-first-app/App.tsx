import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ClipRow } from "./src/components/ClipRow";
import { PillButton } from "./src/components/PillButton";
import { SectionTitle } from "./src/components/SectionTitle";
import { APP_DISPLAY_NAME, CAPTURE_DURATIONS, MOODS } from "./src/constants";
import { countTodayClips, initializeLocalIndex, insertClip, listRecentClips } from "./src/data/localIndex";
import { saveClipToGallery } from "./src/services/galleryStorage";
import { createRelayEnvelope } from "./src/services/relayEnvelope";
import { colors, radii } from "./src/theme/colors";
import type { CaptureDuration, LocalClip, Mood, RelayEnvelope } from "./src/types";

type Tab = "capture" | "library" | "commerce";

export default function App() {
  const cameraRef = useRef<CameraView | null>(null);
  const [tab, setTab] = useState<Tab>("capture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [duration, setDuration] = useState<CaptureDuration>(3);
  const [mood, setMood] = useState<Mood>("clear");
  const [caption, setCaption] = useState("");
  const [productTag, setProductTag] = useState("");
  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [clips, setClips] = useState<LocalClip[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [lastEnvelope, setLastEnvelope] = useState<RelayEnvelope | null>(null);
  const [statusMessage, setStatusMessage] = useState("Local index readying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({
    writeOnly: false,
    granularPermissions: ["video"],
  });

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        await initializeLocalIndex();
        const [recent, count] = await Promise.all([listRecentClips(), countTodayClips()]);

        if (active) {
          setClips(recent);
          setTodayCount(count);
          setStatusMessage("Local index online");
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Local index failed");
        }
      }
    }

    boot();

    return () => {
      active = false;
    };
  }, []);

  const permissionsGranted = Boolean(cameraPermission?.granted && mediaPermission?.granted);

  const currentSlotLabel = useMemo(() => {
    const hour = String(new Date().getHours()).padStart(2, "0");
    return `${hour}:00 slot`;
  }, [todayCount]);

  async function ensurePermissions() {
    const nextCamera = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
    const nextMedia = mediaPermission?.granted ? mediaPermission : await requestMediaPermission();

    if (!nextCamera.granted || !nextMedia.granted) {
      throw new Error("Camera and gallery permission are required for local capture.");
    }
  }

  async function refreshLibrary() {
    const [recent, count] = await Promise.all([listRecentClips(), countTodayClips()]);
    setClips(recent);
    setTodayCount(count);
  }

  async function recordSlot() {
    if (recording) {
      cameraRef.current?.stopRecording();
      return;
    }

    setErrorMessage(null);
    setLastEnvelope(null);

    try {
      await ensurePermissions();

      if (!cameraRef.current || !cameraReady) {
        throw new Error("Camera is not ready yet.");
      }

      setRecording(true);
      setStatusMessage(`Recording ${duration}s slot`);

      const video = await cameraRef.current.recordAsync({
        maxDuration: duration,
      });

      if (!video?.uri) {
        throw new Error("Recording returned no local file.");
      }

      setStatusMessage("Saving to phone gallery");
      const savedAsset = await saveClipToGallery(video.uri);
      const clip = await insertClip({
        assetId: savedAsset.assetId,
        cacheUri: video.uri,
        albumTitle: savedAsset.albumTitle,
        durationSeconds: duration,
        caption,
        mood,
        productTag: productTag || null,
      });
      const envelope = await createRelayEnvelope(clip);

      setCaption("");
      setProductTag("");
      setLastEnvelope(envelope);
      await refreshLibrary();
      setStatusMessage(`Saved to ${savedAsset.albumTitle}`);
      setTab("library");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Recording failed");
      setStatusMessage("Capture paused");
    } finally {
      setRecording(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>{APP_DISPLAY_NAME}</Text>
          <Text style={styles.headerMeta}>{currentSlotLabel} / {todayCount} saved today</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText} numberOfLines={1}>{statusMessage}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Capture" value="capture" tab={tab} setTab={setTab} />
        <TabButton label="Library" value="library" tab={tab} setTab={setTab} />
        <TabButton label="Commerce" value="commerce" tab={tab} setTab={setTab} />
      </View>

      {tab === "capture" ? (
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
          <View style={styles.cameraShell}>
            {permissionsGranted ? (
              <CameraView
                ref={cameraRef}
                active={tab === "capture"}
                facing={facing}
                mode="video"
                mute
                onCameraReady={() => setCameraReady(true)}
                style={StyleSheet.absoluteFill}
                videoQuality="720p"
              />
            ) : (
              <View style={styles.permissionPanel}>
                <Text style={styles.permissionTitle}>Camera + gallery</Text>
                <Text style={styles.permissionCopy}>Local clips stay on this phone first.</Text>
                <Pressable style={styles.primaryButton} onPress={ensurePermissions}>
                  <Text style={styles.primaryButtonText}>Grant access</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.cameraOverlay}>
              <View style={styles.overlayBar}>
                <Text style={styles.overlayText}>{duration}s</Text>
                <Pressable style={styles.flipButton} onPress={() => setFacing(value => (value === "back" ? "front" : "back"))}>
                  <Text style={styles.flipText}>Flip</Text>
                </Pressable>
              </View>
              {recording ? <ActivityIndicator color={colors.paper} /> : null}
            </View>
          </View>

          <View style={styles.panel}>
            <SectionTitle eyebrow="Now" title="Slot metadata" />
            <View style={styles.controlGroup}>
              {CAPTURE_DURATIONS.map(value => (
                <PillButton
                  key={value}
                  label={`${value}s`}
                  onSelect={setDuration}
                  selectedValue={duration}
                  value={value}
                />
              ))}
            </View>
            <View style={styles.controlGroup}>
              {MOODS.map(item => (
                <PillButton
                  key={item.value}
                  label={item.label}
                  onSelect={setMood}
                  selectedValue={mood}
                  value={item.value}
                />
              ))}
            </View>
            <TextInput
              onChangeText={setCaption}
              placeholder="Caption"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={caption}
            />
            <TextInput
              onChangeText={setProductTag}
              placeholder="Product tag"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={productTag}
            />
            <Pressable style={[styles.recordButton, recording && styles.stopButton]} onPress={recordSlot}>
              <Text style={styles.recordButtonText}>{recording ? "Stop" : "Record slot"}</Text>
            </Pressable>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
        </ScrollView>
      ) : null}

      {tab === "library" ? (
        <View style={styles.screenFlex}>
          <SectionTitle eyebrow="Phone gallery" title="Local log index" />
          {lastEnvelope ? (
            <View style={styles.relayPanel}>
              <Text style={styles.relayTitle}>Relay manifest staged</Text>
              <Text style={styles.relayCopy}>TTL {lastEnvelope.ttlHours}h / expires {lastEnvelope.expiresAt.slice(0, 16)}</Text>
            </View>
          ) : null}
          <FlatList
            contentContainerStyle={styles.list}
            data={clips}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.empty}>No local clips yet.</Text>}
            renderItem={({ item }) => <ClipRow clip={item} />}
          />
        </View>
      ) : null}

      {tab === "commerce" ? (
        <ScrollView contentContainerStyle={styles.screen}>
          <SectionTitle eyebrow="Revenue" title="Ads and shop hooks" />
          <View style={styles.revenueGrid}>
            <RevenueTile title="Sponsored frames" value="Context only" tone="mint" />
            <RevenueTile title="Product tags" value="User selected" tone="sky" />
            <RevenueTile title="Seller console" value="Cloud metadata" tone="amber" />
            <RevenueTile title="Raw video targeting" value="Blocked" tone="coral" />
          </View>
          <View style={styles.policyPanel}>
            <Text style={styles.policyTitle}>Storage boundary</Text>
            <Text style={styles.policyCopy}>
              Raw clips and completed logs are saved to the phone gallery. Cloud services hold rooms,
              campaigns, products, click events, reports, and short-lived encrypted relay pointers.
            </Text>
          </View>
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

type TabButtonProps = {
  label: string;
  value: Tab;
  tab: Tab;
  setTab: (value: Tab) => void;
};

function TabButton({ label, value, tab, setTab }: TabButtonProps) {
  const selected = value === tab;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={() => setTab(value)}
      style={[styles.tabButton, selected && styles.tabSelected]}
    >
      <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{label}</Text>
    </Pressable>
  );
}

type RevenueTileProps = {
  title: string;
  value: string;
  tone: "mint" | "sky" | "amber" | "coral";
};

function RevenueTile({ title, value, tone }: RevenueTileProps) {
  const backgroundByTone = {
    mint: colors.mint,
    sky: colors.sky,
    amber: colors.amber,
    coral: colors.coral,
  };

  return (
    <View style={[styles.revenueTile, { backgroundColor: backgroundByTone[tone] }]}>
      <Text style={styles.revenueTitle}>{title}</Text>
      <Text style={styles.revenueValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 12,
  },
  brand: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "900",
  },
  headerMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderWidth: 1,
    maxWidth: 152,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusText: {
    color: colors.moss,
    fontSize: 11,
    fontWeight: "800",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  tabButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  tabSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  tabText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  tabTextSelected: {
    color: colors.paper,
  },
  screen: {
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  screenFlex: {
    flex: 1,
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  cameraShell: {
    aspectRatio: 9 / 13,
    backgroundColor: colors.night,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  cameraOverlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    justifyContent: "space-between",
    padding: 14,
  },
  overlayBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overlayText: {
    backgroundColor: "rgba(24,34,31,0.68)",
    borderRadius: radii.sm,
    color: colors.paper,
    fontSize: 14,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  flipButton: {
    backgroundColor: "rgba(247,250,244,0.86)",
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  permissionPanel: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  permissionTitle: {
    color: colors.paper,
    fontSize: 22,
    fontWeight: "900",
  },
  permissionCopy: {
    color: colors.sky,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  controlGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  primaryButton: {
    backgroundColor: colors.mint,
    borderRadius: radii.sm,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  recordButton: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: radii.sm,
    minHeight: 52,
    justifyContent: "center",
  },
  stopButton: {
    backgroundColor: colors.night,
  },
  recordButtonText: {
    color: colors.paper,
    fontSize: 16,
    fontWeight: "900",
  },
  error: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
  },
  relayPanel: {
    backgroundColor: colors.night,
    borderRadius: radii.md,
    gap: 4,
    padding: 14,
  },
  relayTitle: {
    color: colors.paper,
    fontSize: 15,
    fontWeight: "900",
  },
  relayCopy: {
    color: colors.sky,
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 22,
    textAlign: "center",
  },
  revenueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  revenueTile: {
    borderRadius: radii.md,
    minHeight: 96,
    padding: 12,
    width: "48%",
  },
  revenueTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  revenueValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },
  policyPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  policyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  policyCopy: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
});
