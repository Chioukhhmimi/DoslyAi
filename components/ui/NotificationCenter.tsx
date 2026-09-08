import React from 'react';
import { View, Modal, TouchableOpacity, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Badge } from '@components/ui/Badge';

import { AppText } from './AppText';

export interface NotificationItem {
  id: string;
  medicationName: string;
  dose: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  onMarkTaken?: () => void;
}

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  items: NotificationItem[];
}

const STATUS_VARIANT = {
  pending: 'info',
  taken:   'success',
  skipped: 'warning',
  missed:  'danger',
} as const;

export function NotificationCenter({ visible, onClose, items }: NotificationCenterProps) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AppText style={styles.title}>{t('notificationCenter.title')}</AppText>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button">
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textDisabled} />
            <AppText style={styles.emptyText}>{t('notificationCenter.empty')}</AppText>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.itemInfo}>
                  <AppText style={styles.itemName}>{item.medicationName}</AppText>
                  <AppText style={styles.itemDose}>{item.dose} · {item.scheduledTime}</AppText>
                </View>
                <View style={styles.itemRight}>
                  <Badge label={t(`notificationCenter.status.${item.status}`)} variant={STATUS_VARIANT[item.status]} size="sm" />
                  {item.status === 'pending' && item.onMarkTaken && (
                    <TouchableOpacity style={styles.takenBtn} onPress={item.onMarkTaken} accessibilityRole="button">
                      <AppText style={styles.takenBtnText}>{t('notificationCenter.markTaken')}</AppText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:        { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText:    { fontSize: FontSize.md, color: Colors.textSecondary },
  list:         { padding: Spacing.md, gap: Spacing.sm },
  item:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  itemInfo:     { flex: 1 },
  itemName:     { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  itemDose:     { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  itemRight:    { gap: 6, alignItems: 'flex-end' },
  takenBtn:     { backgroundColor: Colors.successLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  takenBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.successText },
});
