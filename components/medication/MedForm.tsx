import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Medication,
  MedicationSchedule,
  MedicationType,
  NewMedication,
} from '@store/medicationStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Button } from '@components/ui/Button';
import { BottomSheet } from '@components/ui/BottomSheet';
import { SchedulePicker } from './SchedulePicker';
import { COMMON_DRUG_NAMES } from '@constants/drugNames';

interface MedFormProps {
  initialValues?: Partial<Medication>;
  onSubmit: (data: NewMedication) => void;
  onCancel: () => void;
  profileId: string;
}

const TYPES: MedicationType[] = ['pill', 'syrup', 'injection', 'supplement', 'other'];
const UNIT_PRESET_KEYS = ['mg', 'g', 'ml', 'mcg', 'tablet', 'capsule', 'drop', 'dose'] as const;
const PILL_COLORS = [
  '#6366F1',
  '#EC4899',
  '#F97316',
  '#10B981',
  '#EAB308',
  '#06B6D4',
  '#EF4444',
  '#8B5CF6',
  '#84CC16',
  '#F59E0B',
];
const DEFAULT_SCHEDULE: MedicationSchedule = { frequency: 'daily', times: ['08:00'] };

export function MedForm({ initialValues, onSubmit, onCancel, profileId }: MedFormProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [name, setName] = useState(initialValues?.name ?? '');
  const [doseQuantity, setDoseQuantity] = useState(
    initialValues?.doseQuantity != null ? String(initialValues.doseQuantity) : '',
  );
  const [unit, setUnit] = useState(initialValues?.unit ?? '');
  const [type, setType] = useState<MedicationType>(initialValues?.type ?? 'pill');
  const [pillColor, setPillColor] = useState<string | undefined>(initialValues?.pillColor);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [schedule, setSchedule] = useState<MedicationSchedule>(
    initialValues?.schedule ?? DEFAULT_SCHEDULE,
  );

  const parseDate = (s?: string) => (s ? new Date(s + 'T00:00:00') : new Date());
  const [startDate, setStartDate] = useState<Date>(parseDate(initialValues?.startDate));
  const [endDate, setEndDate] = useState<Date | null>(
    initialValues?.endDate ? new Date(initialValues.endDate + 'T00:00:00') : null,
  );
  const [ongoing, setOngoing] = useState(!initialValues?.endDate);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setNameSuggestions([]);
  }, [step]);

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('medication.form.nameRequired');
    else if (name.trim().length > 80) errs.name = t('medication.form.nameMax');
    const qty = parseFloat(doseQuantity);
    if (!doseQuantity.trim() || isNaN(qty) || qty <= 0)
      errs.doseQuantity = t('medication.form.qtyInvalid');
    else if (qty > 999) errs.doseQuantity = t('medication.form.qtyMax');
    if (!unit.trim()) errs.unit = t('medication.form.unitRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep3(): boolean {
    if (!ongoing && endDate && endDate < startDate) {
      setErrors({ endDate: t('medication.form.endAfterStart') });
      return false;
    }
    setErrors({});
    return true;
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;
    setNameSuggestions([]);
    setStep((s) => s + 1);
  }

  function handleSubmit() {
    if (!validateStep3()) return;
    onSubmit({
      profileId,
      name: name.trim(),
      doseQuantity: parseFloat(doseQuantity),
      unit: unit.trim(),
      type,
      pillColor,
      notes: notes.trim() || undefined,
      schedule,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: ongoing ? undefined : endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    });
  }

  function onStartDateChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selected) setStartDate(selected);
  }

  function onEndDateChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selected) setEndDate(selected);
  }

  const progress = step / totalSteps;

  const freqSummary =
    schedule.frequency === 'daily'
      ? t('medication.freq.daily')
      : schedule.frequency === 'weekly'
        ? t('medication.freq.weekly')
        : schedule.frequency === 'interval'
          ? `${t('medication.freq.everyN')} ${schedule.intervalDays ?? 1} ${t('medication.freq.days')}`
          : t('medication.freq.customLabel');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.stepLabel}>
        {t('medication.form.step')} {step} {t('medication.form.of')} {totalSteps}
      </Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View>
            <Text style={styles.label}>{t('medication.form.nameLabel')}</Text>
            <View style={{ zIndex: 10, position: 'relative' }}>
              <TextInput
                style={[styles.input, !!errors.name && styles.inputError]}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setErrors((e) => ({ ...e, name: '' }));
                  if (v.length >= 2) {
                    const matches = COMMON_DRUG_NAMES.filter((d) =>
                      d.toLowerCase().startsWith(v.toLowerCase())
                    ).slice(0, 5);
                    const filtered = matches.filter(
                      (m) => !(matches.length === 1 && m.toLowerCase() === v.toLowerCase())
                    );
                    setNameSuggestions(filtered);
                  } else {
                    setNameSuggestions([]);
                  }
                }}
                placeholder={t('medication.form.namePlaceholder')}
                placeholderTextColor={Colors.textDisabled}
              />
              {nameSuggestions.length > 0 && (
                <View style={styles.suggestionList}>
                  {nameSuggestions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={styles.suggestion}
                      onPress={() => { setName(s); setNameSuggestions([]); }}
                    >
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.label}>{t('medication.form.doseLabel')}</Text>
            <View style={styles.doseRow}>
              <View style={[styles.stepper, !!errors.doseQuantity && styles.inputError]}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => {
                    const v = Math.max(0.5, (parseFloat(doseQuantity) || 1) - 0.5);
                    setDoseQuantity(v % 1 === 0 ? String(v) : String(v));
                    setErrors((e) => ({ ...e, doseQuantity: '' }));
                  }}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.stepperInput}
                  value={doseQuantity}
                  onChangeText={(v) => {
                    setDoseQuantity(v);
                    setErrors((e) => ({ ...e, doseQuantity: '' }));
                  }}
                  placeholder="1"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="decimal-pad"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => {
                    const v = Math.min(999, (parseFloat(doseQuantity) || 0) + 0.5);
                    setDoseQuantity(v % 1 === 0 ? String(v) : String(v));
                    setErrors((e) => ({ ...e, doseQuantity: '' }));
                  }}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.doseUnitInput, !!errors.unit && styles.inputError]}
                value={unit}
                onChangeText={(v) => {
                  setUnit(v);
                  setErrors((e) => ({ ...e, unit: '' }));
                }}
                placeholder="mg"
                placeholderTextColor={Colors.textDisabled}
              />
            </View>
            {(!!errors.doseQuantity || !!errors.unit) && (
              <Text style={styles.errorText}>{errors.doseQuantity || errors.unit}</Text>
            )}
            <View style={styles.unitPresets}>
              {UNIT_PRESET_KEYS.map((key) => {
                const label = t(`medication.units.${key}`);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setUnit(key);
                      setErrors((e) => ({ ...e, unit: '' }));
                    }}
                    style={[styles.unitChip, unit === key && styles.unitChipActive]}
                  >
                    <Text style={[styles.unitChipText, unit === key && styles.unitChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>{t('medication.form.typeLabel')}</Text>
            <View style={styles.chips}>
              {TYPES.map((tp) => (
                <TouchableOpacity
                  key={tp}
                  onPress={() => setType(tp)}
                  style={[styles.chip, type === tp && styles.chipActive]}
                >
                  <Text style={[styles.chipText, type === tp && styles.chipTextActive]}>
                    {t(`medication.types.${tp}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('medication.form.colorLabel')}</Text>
            <View style={styles.colorRow}>
              {PILL_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setPillColor(pillColor === c ? undefined : c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    pillColor === c && styles.colorSwatchActive,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.label}>{t('medication.form.notesLabel')}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('medication.form.notesPlaceholder')}
              placeholderTextColor={Colors.textDisabled}
              multiline
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>{t('medication.form.schedulingLabel')}</Text>
            <SchedulePicker value={schedule} onChange={setSchedule} />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.label}>{t('medication.schedule.start')}</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{format(startDate, 'dd/MM/yyyy')}</Text>
                <Text>📅</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>{t('medication.form.indefinite')}</Text>
              <Switch
                value={ongoing}
                onValueChange={(v) => {
                  setOngoing(v);
                  if (v) setEndDate(null);
                  setErrors({});
                }}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            {!ongoing && (
              <>
                <Text style={styles.label}>{t('medication.schedule.end')}</Text>
                <TouchableOpacity
                  style={[styles.input, !!errors.endDate && styles.inputError]}
                  onPress={() => setShowEndPicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateRow}>
                    <Text style={endDate ? styles.dateText : styles.datePlaceholder}>
                      {endDate ? format(endDate, 'dd/MM/yyyy') : t('profile.form.dobPlaceholder')}
                    </Text>
                    <Text>📅</Text>
                  </View>
                </TouchableOpacity>
                {!!errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
              </>
            )}

            {Platform.OS === 'android' && showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
              />
            )}
            {Platform.OS === 'ios' && (
              <BottomSheet
                visible={showStartPicker}
                onClose={() => setShowStartPicker(false)}
                showHandle={false}
              >
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                    <Text style={styles.pickerDone}>{t('common.done')}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  onChange={onStartDateChange}
                  style={styles.picker}
                />
              </BottomSheet>
            )}

            {Platform.OS === 'android' && showEndPicker && (
              <DateTimePicker
                value={endDate ?? new Date()}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={onEndDateChange}
              />
            )}
            {Platform.OS === 'ios' && (
              <BottomSheet
                visible={showEndPicker}
                onClose={() => setShowEndPicker(false)}
                showHandle={false}
              >
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                    <Text style={styles.pickerDone}>{t('common.done')}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={endDate ?? new Date()}
                  mode="date"
                  display="spinner"
                  minimumDate={startDate}
                  onChange={onEndDateChange}
                  style={styles.picker}
                />
              </BottomSheet>
            )}
          </View>
        )}

        {step === 4 && (
          <View style={styles.review}>
            <Text style={styles.sectionTitle}>{t('medication.form.summaryLabel')}</Text>
            <View style={styles.reviewCard}>
              <ReviewRow label={t('medication.form.nameLabel').replace(' *', '')} value={name} />
              <ReviewRow
                label={t('medication.form.doseLabel').replace(' *', '')}
                value={`${doseQuantity} ${unit}`}
              />
              <ReviewRow
                label={t('medication.form.typeLabel')}
                value={t(`medication.types.${type}`)}
              />
              <ReviewRow label={t('medication.detail.frequency')} value={freqSummary} />
              <ReviewRow label={t('medication.schedule.times')} value={schedule.times.join(', ')} />
              <ReviewRow
                label={t('medication.schedule.start')}
                value={format(startDate, 'dd/MM/yyyy')}
              />
              <ReviewRow
                label={t('medication.schedule.end')}
                value={
                  ongoing
                    ? t('medication.schedule.indefinite')
                    : endDate
                      ? format(endDate, 'dd/MM/yyyy')
                      : '—'
                }
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.nav}>
        {step === 1 ? (
          <Button
            label={t('common.cancel')}
            variant="ghost"
            onPress={onCancel}
            style={styles.navBtn}
          />
        ) : (
          <Button
            label={t('medication.form.previous')}
            variant="secondary"
            onPress={() => setStep((s) => s - 1)}
            style={styles.navBtn}
          />
        )}
        {step < totalSteps ? (
          <Button label={t('medication.form.next')} onPress={goNext} style={styles.navBtn} />
        ) : (
          <Button label={t('common.confirm')} onPress={handleSubmit} style={styles.navBtn} />
        )}
      </View>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={reviewStyles.row}>
      <Text style={reviewStyles.label}>{label}</Text>
      <Text style={reviewStyles.value}>{value}</Text>
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    margin: Spacing.md,
    marginBottom: 0,
  },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  stepLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  inputError: { borderColor: Colors.danger },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 2 },
  doseRow: { flexDirection: 'row', gap: Spacing.sm },
  stepper: {
    flex: 0.45,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
  },
  stepperBtnText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.primary },
  stepperInput: {
    flex: 1,
    height: 48,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  doseUnitInput: { flex: 0.55 },
  unitPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  unitChip: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  unitChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  unitChipText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  unitChipTextActive: { color: Colors.primary, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: { borderColor: Colors.textPrimary, transform: [{ scale: 1.15 }] },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.textInverse },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: FontSize.md, color: Colors.textPrimary },
  datePlaceholder: { fontSize: FontSize.md, color: Colors.textDisabled },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.sm,
  },
  review: {},
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nav: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navBtn: { flex: 1 },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerDone: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  picker: { width: '100%' },
  suggestionList: { position: 'absolute', top: '100%' as any, left: 0, right: 0, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, elevation: 4, zIndex: 10 },
  suggestion:     { padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionText: { fontSize: FontSize.md, color: Colors.textPrimary },
});
