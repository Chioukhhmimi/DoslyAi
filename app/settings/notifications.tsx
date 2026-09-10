import React, { useState } from 'react';
import { View, Switch, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Card } from '@components/ui/Card';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useSettingsStore } from '@store/settingsStore';
import { useAuthStore } from '@store/authStore';

import { AppText } from '@components/ui/AppText';

function parseHHMM(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export default function NotificationsSettingsScreen() {
  const { t } = useTranslation();
  const {
    notificationsEnabled,
    setNotificationsEnabled: _setNotificationsEnabled,
    quietHoursEnabled,
    setQuietHoursEnabled: _setQuietHoursEnabled,
    quietHoursStart,
    setQuietHoursStart: _setQuietHoursStart,
    quietHoursEnd,
    setQuietHoursEnd: _setQuietHoursEnd,
  } = useSettingsStore();
  const user = useAuthStore((s) => s.user);

  function setNotificationsEnabled(v: boolean) { _setNotificationsEnabled(user!.uid, v); }
  function setQuietHoursEnabled(v: boolean) { _setQuietHoursEnabled(user!.uid, v); }
  function setQuietHoursStart(v: string) { _setQuietHoursStart(user!.uid, v); }
  function setQuietHoursEnd(v: string) { _setQuietHoursEnd(user!.uid, v); }

  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const startDate = parseHHMM(quietHoursStart);
  const endDate = parseHHMM(quietHoursEnd);

  function onTimeChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setPickerTarget(null);
    if (!selected) return;
    const hh = String(selected.getHours()).padStart(2, '0');
    const mm = String(selected.getMinutes()).padStart(2, '0');
    const value = `${hh}:${mm}`;
    if (pickerTarget === 'start') setQuietHoursStart(value);
    else setQuietHoursEnd(value);
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('settings.notifications')} />

      <Card style={styles.card}>
        <View style={styles.row}>
          <AppText style={styles.rowLabel}>{t('settings.notificationsScreen.enable')}</AppText>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <AppText style={styles.rowLabel}>{t('settings.notificationsScreen.quietHours')}</AppText>
          <Switch
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            disabled={!notificationsEnabled}
          />
        </View>

        {quietHoursEnabled && notificationsEnabled && (
          <View style={styles.quietHoursBlock}>
            <AppText style={styles.quietHoursHint}>
              {t('settings.notificationsScreen.quietDescription')}
            </AppText>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <AppText style={styles.timeLabel}>{t('settings.notificationsScreen.start')}</AppText>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerTarget('start')}>
                  <AppText style={styles.timeBtnText}>{quietHoursStart}</AppText>
                  <Ionicons name="time-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={Colors.textSecondary}
                style={styles.arrow}
              />
              <View style={styles.timeItem}>
                <AppText style={styles.timeLabel}>{t('settings.notificationsScreen.end')}</AppText>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerTarget('end')}>
                  <AppText style={styles.timeBtnText}>{quietHoursEnd}</AppText>
                  <Ionicons name="time-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Card>

      {Platform.OS === 'android' && pickerTarget !== null && (
        <DateTimePicker
          value={pickerTarget === 'start' ? startDate : endDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={pickerTarget !== null} transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setPickerTarget(null)}>
                  <AppText style={styles.pickerDone}>{t('common.done')}</AppText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerTarget === 'start' ? startDate : endDate}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  rowLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  quietHoursBlock: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  quietHoursHint: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timeItem: { flex: 1 },
  timeLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  timeBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
  },
  timeBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  arrow: { marginTop: 18 },
  pickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.xl,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerDone: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  picker: { width: '100%' },
});
