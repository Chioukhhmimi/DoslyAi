import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { MedForm } from '@components/medication/MedForm';
import { EmptyState } from '@components/ui/EmptyState';
import { PersonIllustration } from '@components/ui/EmptyIllustrations';
import { useMedications } from '@hooks/useMedications';
import { useProfiles } from '@hooks/useProfiles';
import { NewMedication } from '@store/medicationStore';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { useLocalSearchParams } from 'expo-router';
import { useOCRQueue } from '@store/ocrQueueStore';

export default function AddScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addMedication } = useMedications();
  const { activeProfile } = useProfiles();
  const params = useLocalSearchParams<{
    prefillName?: string;
    prefillUnit?: string;
    prefillQty?: string;
  }>();

  // Bump this key every time the screen is focused → remounts MedForm with fresh state
  const [formKey, setFormKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFormKey((k) => k + 1);
    }, []),
  );

  if (!activeProfile) {
    return (
      <ScreenContainer>
        <EmptyState
          illustration={<PersonIllustration />}
          title={t('profile.noProfiles')}
          description={t('profile.noProfilesDescription')}
          actionLabel={t('home.manageProfiles')}
          onAction={() => router.push('/profile')}
        />
      </ScreenContainer>
    );
  }

  const prefill: Partial<{ name: string; doseQuantity: number; unit: string }> | undefined =
    params.prefillName
      ? {
          name: params.prefillName,
          doseQuantity: params.prefillQty ? parseFloat(params.prefillQty) || 1 : 1,
          unit: params.prefillUnit ?? '',
        }
      : undefined;

  function handleSubmit(data: NewMedication) {
    addMedication(data);
    const next = useOCRQueue.getState().shift();
    if (next) {
      router.replace({
        pathname: '/(tabs)/add',
        params: { prefillName: next.name, prefillUnit: next.dosage, prefillQty: '1' },
      });
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <MedForm
      key={formKey}
      profileId={activeProfile.id}
      initialValues={prefill}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({});
