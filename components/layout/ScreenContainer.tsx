import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padded?: boolean;
  onRefresh?: () => Promise<void> | void;
}

export function ScreenContainer({
  children,
  scrollable = false,
  style,
  padded = true,
  onRefresh,
}: ScreenContainerProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  async function handleRefresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  const inner = scrollable ? (
    <ScrollView
      contentContainerStyle={[padded && styles.padded, style]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, style]}>{children}</View>
  );

  return <SafeAreaView style={styles.safe}>{inner}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  padded: { padding: Spacing.md },
});
