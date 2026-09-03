import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@constants/colors';

// Shared wrapper — soft primary circle background
function Wrap({ children }: { children: React.ReactNode }) {
  return <View style={s.wrap}>{children}</View>;
}

// ── 1. Pill capsule — No medications (home + medications list) ────────────────
export function PillIllustration() {
  return (
    <Wrap>
      {/* Outer capsule */}
      <View style={s.capsule}>
        <View style={s.capsuleLeft} />
        <View style={s.capsuleDivider} />
        <View style={s.capsuleRight} />
      </View>
      {/* Small dots below to suggest a schedule */}
      <View style={s.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[s.dot, i === 1 && s.dotActive]} />
        ))}
      </View>
    </Wrap>
  );
}

// ── 2. Calendar — No history ──────────────────────────────────────────────────
export function CalendarIllustration() {
  return (
    <Wrap>
      <View style={s.calendar}>
        {/* Header bar */}
        <View style={s.calendarHeader}>
          <View style={s.calendarPin} />
          <View style={s.calendarPin} />
        </View>
        {/* Grid — 3 rows of 3 dots */}
        {[0, 1, 2].map((row) => (
          <View key={row} style={s.calendarRow}>
            {[0, 1, 2].map((col) => (
              <View
                key={col}
                style={[
                  s.calendarDot,
                  row === 0 && col === 0 && s.calendarDotFilled,
                  row === 0 && col === 1 && s.calendarDotFilled,
                  // rest are empty to suggest "no events"
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </Wrap>
  );
}

// ── 3. Person silhouette — No profiles / no active profile ───────────────────
export function PersonIllustration() {
  return (
    <Wrap>
      {/* Head */}
      <View style={s.personHead} />
      {/* Shoulders */}
      <View style={s.personShoulders} />
    </Wrap>
  );
}

// ── 4. Camera — Camera permission denied ─────────────────────────────────────
export function CameraIllustration() {
  return (
    <Wrap>
      {/* Viewfinder bump */}
      <View style={s.cameraBump} />
      {/* Camera body */}
      <View style={s.cameraBody}>
        {/* Lens */}
        <View style={s.cameraLens}>
          <View style={s.cameraLensInner} />
        </View>
        {/* Flash dot */}
        <View style={s.cameraFlash} />
      </View>
    </Wrap>
  );
}

// ── 5. Document + magnifier — Scan failed / no meds detected ─────────────────
export function ScanIllustration() {
  return (
    <Wrap>
      <View style={s.scanDoc}>
        {/* Text lines */}
        <View style={[s.scanLine, { width: 28 }]} />
        <View style={[s.scanLine, { width: 20 }]} />
        <View style={[s.scanLine, { width: 28 }]} />
        <View style={[s.scanLine, { width: 14 }]} />
        {/* Magnifying glass — overlapping bottom-right */}
        <View style={s.magnifier}>
          <View style={s.magnifierHandle} />
        </View>
      </View>
    </Wrap>
  );
}

// ── 6. Lock / biometric — Biometric / lock screen ────────────────────────────
export function LockIllustration() {
  return (
    <Wrap>
      {/* Shackle arc */}
      <View style={s.lockArc} />
      {/* Lock body */}
      <View style={s.lockBody}>
        <View style={s.lockKeyhole} />
      </View>
    </Wrap>
  );
}

const P  = Colors.primary;
const PL = Colors.primaryLight;
const PX = Colors.primaryXLight;
const B  = Colors.border;

const s = StyleSheet.create({
  wrap: {
    width: 96, height: 96,
    borderRadius: 48,
    backgroundColor: PX,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  // Pill
  capsule: {
    width: 54, height: 24,
    borderRadius: 12,
    borderWidth: 2.5, borderColor: P,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  capsuleLeft:    { flex: 1, backgroundColor: P },
  capsuleDivider: { width: 2, backgroundColor: P },
  capsuleRight:   { flex: 1, backgroundColor: PL },
  dotsRow:        { flexDirection: 'row', gap: 6, marginTop: 8 },
  dot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: B },
  dotActive:      { backgroundColor: P },

  // Calendar
  calendar: {
    width: 52, height: 56,
    borderRadius: 8,
    borderWidth: 2.5, borderColor: P,
    overflow: 'hidden',
  },
  calendarHeader: {
    height: 16,
    backgroundColor: P,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingTop: 0,
  },
  calendarPin: {
    width: 4, height: 8,
    borderRadius: 2,
    backgroundColor: PL,
    marginTop: -4,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 3,
  },
  calendarDot: {
    width: 7, height: 7,
    borderRadius: 3.5,
    backgroundColor: B,
  },
  calendarDotFilled: { backgroundColor: P },

  // Person
  personHead: {
    width: 26, height: 26,
    borderRadius: 13,
    backgroundColor: P,
    marginBottom: 5,
  },
  personShoulders: {
    width: 50, height: 22,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: P,
  },

  // Camera
  cameraBump: {
    width: 18, height: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: P,
    alignSelf: 'flex-start',
    marginLeft: 18,
    marginBottom: -1,
    zIndex: 1,
  },
  cameraBody: {
    width: 60, height: 40,
    borderRadius: 8,
    backgroundColor: P,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cameraLens: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 2.5, borderColor: PX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLensInner: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: PX,
    opacity: 0.6,
  },
  cameraFlash: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: PL,
    position: 'absolute',
    top: 8, right: 10,
  },

  // Scan / document
  scanDoc: {
    width: 46, height: 58,
    borderRadius: 6,
    borderWidth: 2.5, borderColor: P,
    paddingTop: 10,
    paddingHorizontal: 9,
    gap: 6,
  },
  scanLine: {
    height: 2.5,
    borderRadius: 2,
    backgroundColor: P,
    opacity: 0.6,
  },
  magnifier: {
    width: 20, height: 20,
    borderRadius: 10,
    borderWidth: 2.5, borderColor: P,
    position: 'absolute',
    bottom: -10, right: -10,
    backgroundColor: PX,
  },
  magnifierHandle: {
    position: 'absolute',
    bottom: -7, right: -7,
    width: 2.5, height: 9,
    borderRadius: 2,
    backgroundColor: P,
    transform: [{ rotate: '45deg' }],
  },

  // Lock
  lockArc: {
    width: 28, height: 18,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 3, borderColor: P,
    borderBottomWidth: 0,
    marginBottom: -2,
  },
  lockBody: {
    width: 42, height: 32,
    borderRadius: 6,
    backgroundColor: P,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockKeyhole: {
    width: 10, height: 14,
    borderRadius: 5,
    backgroundColor: PX,
    marginTop: 2,
  },
});
