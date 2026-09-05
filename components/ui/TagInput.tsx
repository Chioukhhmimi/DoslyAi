// components/ui/TagInput.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, values, onChange, placeholder }: TagInputProps) {
  const [text, setText] = useState('');

  function addTag() {
    const trimmed = text.trim();
    if (!trimmed || values.includes(trimmed)) { setText(''); return; }
    onChange([...values, trimmed]);
    setText('');
  }

  function removeTag(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {values.map((v, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{v}</Text>
            <TouchableOpacity onPress={() => removeTag(i)} hitSlop={8}>
              <Ionicons name="close" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder ?? '…'}
          placeholderTextColor={Colors.textDisabled}
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTag}>
          <Ionicons name="add" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label:    { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  chip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, borderRadius: 20, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  chipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: Spacing.xs },
  input:    { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.sm, color: Colors.textPrimary, backgroundColor: Colors.surface },
  addBtn:   { backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
});
