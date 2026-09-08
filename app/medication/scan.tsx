import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, FlatList, TextInput, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { CameraIllustration, ScanIllustration } from '@components/ui/EmptyIllustrations';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useOCR } from '@hooks/useOCR';
import { ParsedMedication } from '@utils/ocrParser';
import { useOCRQueue } from '@store/ocrQueueStore';

import { AppText } from '@components/ui/AppText';

const { width: SCREEN_W } = Dimensions.get('window');
const FRAME_W = SCREEN_W * 0.82;
const FRAME_H = FRAME_W * 1.41; // A4 portrait ratio

type Screen = 'camera' | 'processing' | 'results';

interface EditableMed extends ParsedMedication {
  included: boolean;
  editedName: string;
  editedDosage: string;
}

export default function ScanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setOCRQueue = useOCRQueue((s) => s.setQueue);
  const [permission, requestPermission] = useCameraPermissions();
  const { runOCR, pickFromGallery, isProcessing, medications, error, reset } = useOCR();
  const cameraRef = useRef<CameraView>(null);

  const [screen, setScreen] = useState<Screen>('camera');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [editableMeds, setEditableMeds] = useState<EditableMed[]>([]);

  // ── Permission not yet determined ──────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  // ── Permission denied ──────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <ScreenContainer>
        <EmptyState
          illustration={<CameraIllustration />}
          title={t('medication.scan.cameraRequired')}
          description={t('medication.scan.cameraDescription')}
          actionLabel={t('medication.scan.allowCamera')}
          onAction={requestPermission}
        />
        <Button
          label={t('medication.scan.addManually')}
          variant="ghost"
          onPress={() => router.back()}
          style={styles.mt}
        />
      </ScreenContainer>
    );
  }

  // ── Capture ────────────────────────────────────────────────────────────────
  async function handleCapture() {
    if (!cameraRef.current) return;
    setScreen('processing');
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1.0 });
      await runOCR(photo.uri);
    } catch {
      setScreen('camera');
    }
  }

  // ── After OCR ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (medications !== null && !isProcessing) {
      const editable: EditableMed[] = medications.map((m) => ({
        ...m,
        included: true,
        editedName: m.name,
        editedDosage: m.dosage,
      }));
      setEditableMeds(editable);
      setScreen('results');
    }
  }, [medications, isProcessing]);

  function updateMed(index: number, patch: Partial<EditableMed>) {
    setEditableMeds((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function handleConfirm() {
    const selected = editableMeds.filter((m) => m.included);
    if (selected.length === 0) {
      router.back();
      return;
    }

    // Queue remaining meds so add screen can cycle through them
    setOCRQueue(
      selected.slice(1).map((m) => ({ name: m.editedName, dosage: m.editedDosage })),
    );

    const first = selected[0];
    router.push({
      pathname: '/(tabs)/add',
      params: { prefillName: first.editedName, prefillUnit: first.editedDosage, prefillQty: '1' },
    });
  }

  function handleRetry() {
    reset();
    setEditableMeds([]);
    setScreen('camera');
  }

  // ── Processing ─────────────────────────────────────────────────────────────
  if (screen === 'processing' || isProcessing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.processingText}>{t('medication.scan.processing')}</AppText>
      </View>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (screen === 'results') {
    const includedCount = editableMeds.filter((m) => m.included).length;
    return (
      <ScreenContainer scrollable>
        <AppText style={styles.title}>{t('medication.scan.detected')}</AppText>

        {error ? (
          <EmptyState
            illustration={<ScanIllustration />}
            title={t('medication.scan.failed')}
            description={error}
            actionLabel={t('common.retry')}
            onAction={handleRetry}
          />
        ) : editableMeds.length === 0 ? (
          <EmptyState
            illustration={<ScanIllustration />}
            title={t('medication.scan.noneDetected')}
            description={t('medication.scan.noneDescription')}
            actionLabel={t('common.retry')}
            onAction={handleRetry}
          />
        ) : (
          <FlatList
            data={editableMeds}
            keyExtractor={(_, i) => String(i)}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={[styles.resultCard, !item.included && styles.resultCardDim]}>
                <TouchableOpacity
                  style={[styles.checkbox, item.included && styles.checkboxActive]}
                  onPress={() => updateMed(index, { included: !item.included })}
                >
                  {item.included && (
                    <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
                  )}
                </TouchableOpacity>

                <View style={styles.resultFields}>
                  <AppText style={styles.fieldLabel}>{t('medication.scan.nameLabel')}</AppText>
                  <TextInput
                    style={styles.fieldInput}
                    value={item.editedName}
                    onChangeText={(v) => updateMed(index, { editedName: v })}
                    editable={item.included}
                  />
                  <AppText style={styles.fieldLabel}>{t('medication.scan.dosageLabel')}</AppText>
                  <TextInput
                    style={styles.fieldInput}
                    value={item.editedDosage}
                    onChangeText={(v) => updateMed(index, { editedDosage: v })}
                    editable={item.included}
                  />
                  {item.frequency ? (
                    <View style={styles.hintRow}>
                      <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                      <AppText style={styles.hint}>{item.frequency}</AppText>
                    </View>
                  ) : null}
                  {item.duration ? (
                    <View style={styles.hintRow}>
                      <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                      <AppText style={styles.hint}>{item.duration}</AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          />
        )}

        <View style={styles.resultActions}>
          <Button
            label={t('medication.scan.approveAndAdd', { count: includedCount })}
            onPress={handleConfirm}
            style={styles.btn}
            disabled={includedCount === 0}
          />
          <Button
            label={t('common.retry')}
            variant="secondary"
            onPress={handleRetry}
            style={styles.btn}
          />
          <Button
            label={t('medication.scan.addManually')}
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </ScreenContainer>
    );
  }

  // ── Camera viewfinder ──────────────────────────────────────────────────────
  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" flash={flash} />

      {/* Dark overlay with transparent frame cutout */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Guide label */}
      <View style={styles.guideContainer}>
        <AppText style={styles.guideText}>{t('medication.scan.alignGuide')}</AppText>
      </View>

      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
          style={styles.iconBtn}
        >
          <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          onPress={async () => {
            setScreen('processing');
            await pickFromGallery();
          }}
          style={styles.iconBtn}
        >
          <Ionicons name="images-outline" size={28} color="#fff" />
          <AppText style={styles.iconLabel}>{t('medication.scan.gallery')}</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCapture} style={styles.captureBtn}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <View style={styles.iconBtn} />
      </View>
    </View>
  );
}

const OVERLAY_COLOR = 'rgba(0,0,0,0.55)';
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  processingText: { marginTop: Spacing.md, fontSize: FontSize.md, color: Colors.textSecondary },
  mt: { marginTop: Spacing.md },

  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  overlayTop: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayMiddle: { flexDirection: 'row', height: FRAME_H },
  overlaySide: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayBottom: { flex: 1, backgroundColor: OVERLAY_COLOR },
  frame: { width: FRAME_W, height: FRAME_H },

  // Frame corners
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#fff' },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },

  guideContainer: { position: 'absolute', top: '55%', left: 0, right: 0, alignItems: 'center' },
  guideText: {
    color: '#fff',
    fontSize: FontSize.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },

  topControls: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
  },

  iconBtn: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56 },
  iconLabel: { color: '#fff', fontSize: FontSize.xs, marginTop: 2 },

  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  // Results
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCardDim: { opacity: 0.4 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  resultFields: { flex: 1 },
  fieldLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs },
  fieldInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.xs,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  hint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  resultActions: { gap: Spacing.sm, marginTop: Spacing.lg },
  btn: { marginBottom: Spacing.xs },
});
