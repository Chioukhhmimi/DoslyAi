# i18n Full Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every hardcoded French string in the app with `t()` calls and write complete FR/EN/AR JSON locale files so the app fully translates based on selected language.

**Architecture:** i18next + react-i18next already configured in `i18n/index.ts` with a single `translation` namespace per language. All locale JSON files live in `i18n/locales/`. Each screen/component calls `useTranslation()` and uses `t('key')`. No routing or state changes needed.

**Tech Stack:** i18next ^26, react-i18next ^17, TypeScript strict, Expo SDK 57, React Native 0.86

---

## File Map

**Replace entirely:**
- `i18n/locales/fr.json` — complete French translations (~120 keys)
- `i18n/locales/en.json` — complete English translations
- `i18n/locales/ar.json` — complete Arabic translations

**Modify (add `useTranslation` + replace hardcoded strings):**
- `app/(onboarding)/slide4.tsx`
- `app/(tabs)/index.tsx` — partially done, still has hardcoded strings
- `app/(tabs)/medications.tsx`
- `app/(tabs)/history.tsx` — partially done
- `app/(tabs)/settings.tsx` — partially done
- `app/(tabs)/add.tsx`
- `app/medication/[id].tsx`
- `app/medication/confirm.tsx`
- `app/medication/scan.tsx`
- `app/profile/index.tsx`
- `app/profile/new.tsx`
- `app/profile/[id].tsx`
- `app/settings/notifications.tsx`
- `app/settings/about.tsx`
- `app/settings/language.tsx`
- `app/settings/privacy.tsx`
- `app/settings/terms.tsx`
- `app/export.tsx`
- `components/medication/MedForm.tsx`
- `components/medication/SchedulePicker.tsx`
- `components/ui/LockScreen.tsx`

---

## Task 1: Write complete locale JSON files

**Files:**
- Modify: `i18n/locales/fr.json`
- Modify: `i18n/locales/en.json`
- Modify: `i18n/locales/ar.json`

- [ ] **Step 1: Replace `i18n/locales/fr.json` with complete French translations**

```json
{
  "common": {
    "appName": "MediTrack",
    "continue": "Continuer",
    "skip": "Passer",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "back": "Retour",
    "done": "Terminer",
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "retry": "Réessayer",
    "search": "Rechercher",
    "add": "Ajouter",
    "confirm": "Confirmer",
    "close": "Fermer",
    "notFound": "Introuvable",
    "required": "Requis",
    "activate": "Activer",
    "restart": "Redémarrer"
  },
  "onboarding": {
    "slide1": {
      "title": "Scannez votre ordonnance",
      "description": "Photographiez votre ordonnance et laissez MediTrack extraire automatiquement vos médicaments."
    },
    "slide2": {
      "title": "Ne manquez plus vos prises",
      "description": "Recevez des rappels personnalisés pour prendre vos médicaments au bon moment, chaque jour."
    },
    "slide3": {
      "title": "Gérez plusieurs profils en toute sécurité",
      "description": "Suivez les traitements de toute votre famille depuis une seule application. Vos données restent sur votre appareil.",
      "getStarted": "Commencer"
    },
    "slide4": {
      "title": "Activez les rappels",
      "description": "Recevez une notification à chaque heure de prise pour ne jamais manquer un médicament. Vous pouvez modifier cela à tout moment dans les Paramètres."
    }
  },
  "tabs": {
    "home": "Accueil",
    "history": "Historique",
    "add": "Ajouter",
    "profile": "Profil",
    "medications": "Médicaments",
    "settings": "Paramètres"
  },
  "home": {
    "title": "Accueil",
    "greeting": "Bonjour, {{name}} 👋",
    "todayMeds": "Médicaments du jour",
    "noMeds": "Aucun médicament prévu aujourd'hui",
    "noMedsDescription": "Ajoutez un médicament pour commencer le suivi.",
    "changeProfile": "Changer de profil ▾",
    "manageProfiles": "Gérer les profils",
    "stats": {
      "adherence": "Observance",
      "today": "Aujourd'hui",
      "missed": "Manqués"
    },
    "buckets": {
      "morning": "🌅 Matin",
      "afternoon": "☀️ Après-midi",
      "evening": "🌆 Soir",
      "night": "🌙 Nuit"
    }
  },
  "medications": {
    "title": "Médicaments",
    "active": "Actifs",
    "paused": "En pause",
    "empty": {
      "title": "Aucun médicament",
      "description": "Ajoutez votre premier médicament."
    }
  },
  "history": {
    "title": "Historique",
    "empty": "Aucun historique",
    "emptyDescription": "Votre historique de prises apparaîtra ici.",
    "export": "⬆ Export",
    "filters": {
      "all": "Tous",
      "taken": "Pris",
      "missed": "Manqués",
      "skipped": "Passés"
    },
    "ranges": {
      "seven": "7 j",
      "thirty": "30 j",
      "ninety": "90 j"
    },
    "stats": {
      "adherence": "Observance",
      "taken": "Pris",
      "missed": "Manqués",
      "skipped": "Passés"
    }
  },
  "medication": {
    "types": {
      "pill": "Pilule",
      "syrup": "Sirop",
      "injection": "Injection",
      "supplement": "Supplément",
      "other": "Autre"
    },
    "freq": {
      "daily": "Quotidien",
      "weekly": "Hebdomadaire",
      "interval": "Intervalle",
      "custom": "Schéma",
      "everyN": "Toutes les",
      "days": "j",
      "customLabel": "Schéma personnalisé"
    },
    "schedule": {
      "start": "Début",
      "end": "Fin",
      "indefinite": "Indéfinie",
      "times": "Horaires",
      "upcoming": "Prochaines prises"
    },
    "actions": {
      "pause": "⏸ Mettre en pause",
      "resume": "▶ Reprendre",
      "delete": "Supprimer"
    },
    "detail": {
      "title": "Médicament",
      "notFound": "Ce médicament est introuvable.",
      "frequency": "Fréquence",
      "notes": "Notes"
    },
    "form": {
      "step": "Étape",
      "of": "/",
      "nameLabel": "Nom du médicament *",
      "namePlaceholder": "ex: Amoxicilline",
      "nameRequired": "Le nom est requis",
      "nameMax": "Max 80 caractères",
      "doseLabel": "Dose *",
      "qtyInvalid": "Quantité invalide (ex: 1, 2.5)",
      "qtyMax": "Maximum 999",
      "unitRequired": "Unité requise (ex: mg, comprimé)",
      "colorLabel": "Couleur (optionnel)",
      "notesLabel": "Notes (optionnel)",
      "notesPlaceholder": "Instructions particulières...",
      "schedulingLabel": "Planification",
      "summaryLabel": "Récapitulatif",
      "endAfterStart": "La date de fin doit être après la date de début",
      "next": "Suivant",
      "previous": "Retour",
      "typeLabel": "Forme",
      "indefinite": "Durée indéfinie"
    },
    "units": {
      "mg": "mg",
      "g": "g",
      "ml": "ml",
      "mcg": "mcg",
      "tablet": "comprimé(s)",
      "capsule": "gélule(s)",
      "drop": "goutte(s)",
      "dose": "dose(s)"
    },
    "confirm": {
      "noteLabel": "Note (optionnel)",
      "taken": "✓ Pris",
      "snooze": "⏱ Reporter",
      "skip": "→ Passer",
      "notFound": "Médicament introuvable",
      "snooze10": "10 min",
      "snooze30": "30 min",
      "snooze60": "1 heure",
      "snoozeTitle": "Reporter le rappel"
    },
    "scan": {
      "cameraRequired": "Caméra requise",
      "cameraDescription": "MediTrack a besoin d'accéder à votre caméra pour scanner les ordonnances.",
      "allowCamera": "Autoriser la caméra",
      "addManually": "Ajouter manuellement",
      "processing": "Analyse en cours...",
      "detected": "Médicaments détectés",
      "failed": "Analyse échouée",
      "failedDescription": "Erreur lors de l'analyse.",
      "noneDetected": "Aucun médicament détecté",
      "noneDescription": "L'image n'a pas permis d'extraire des médicaments. Essayez une meilleure prise de vue ou ajoutez manuellement.",
      "alignGuide": "Alignez l'ordonnance dans le cadre",
      "gallery": "Galerie",
      "approveAndAdd": "Approuver et ajouter ({{count}})",
      "nameLabel": "Nom",
      "dosageLabel": "Dosage"
    }
  },
  "profile": {
    "title": "Profils",
    "new": "Nouveau",
    "hint": "Appuyez sur un profil pour le sélectionner.",
    "active": "Actif",
    "medCount_one": "{{count}} médicament",
    "medCount_other": "{{count}} médicaments",
    "noProfiles": "Aucun profil créé",
    "noProfilesDescription": "Créez un profil pour commencer à gérer les médicaments.",
    "createFirst": "Créer mon premier profil",
    "bornOn": "Né(e) le",
    "editTitle": "Modifier le profil",
    "notFound": "Ce profil est introuvable.",
    "dangerZone": "Zone de danger",
    "deleteProfile": "Supprimer ce profil",
    "form": {
      "nameLabel": "Nom *",
      "namePlaceholder": "ex: Ahmed",
      "nameRequired": "Le nom est requis.",
      "dobLabel": "Date de naissance",
      "dobPlaceholder": "JJ/MM/AAAA",
      "relationLabel": "Relation",
      "relationPlaceholder": "ex: Moi-même, Enfant..."
    },
    "detail": {
      "medCount_one": "{{count}} médicament",
      "medCount_other": "{{count}} médicaments",
      "saved_one": "enregistré",
      "saved_other": "enregistrés"
    }
  },
  "settings": {
    "title": "Paramètres",
    "language": "Langue",
    "privacy": "Politique de confidentialité",
    "terms": "Conditions d'utilisation",
    "about": "À propos",
    "notifications": "Notifications",
    "version": "Version",
    "biometric": {
      "label": "Verrou biométrique",
      "description": "Demande Face ID / empreinte à chaque ouverture."
    },
    "restart": {
      "title": "Redémarrage requis",
      "body": "Veuillez redémarrer l'application pour appliquer la nouvelle direction de mise en page."
    },
    "notificationsScreen": {
      "enable": "Activer les notifications",
      "quietHours": "Heures silencieuses",
      "quietDescription": "Aucune notification ne sera envoyée pendant cette période.",
      "start": "Début",
      "end": "Fin"
    },
    "aboutScreen": {
      "tagline": "Gérez vos médicaments simplement.",
      "developer": "Développeur",
      "platform": "Plateforme",
      "platformValue": "iOS & Android",
      "database": "Base de données",
      "databaseValue": "SQLite local",
      "sharedData": "Données partagées",
      "sharedDataValue": "Aucune"
    },
    "privacyBody": "MediTrack stocke toutes vos données localement sur votre appareil. Aucune donnée personnelle n'est transmise à des serveurs externes. Vos informations médicales restent entièrement privées et sous votre contrôle.\n\nLes données suivantes sont stockées localement :\n• Profils patients (nom, date de naissance, relation)\n• Médicaments et plannings de prise\n• Historique des prises\n\nVous pouvez supprimer toutes vos données à tout moment en désinstallant l'application.",
    "termsScreen": {
      "intro": "En utilisant MediTrack, vous acceptez les conditions suivantes :",
      "section1Title": "1. Usage",
      "section1Body": "MediTrack est un outil d'aide à la gestion des médicaments. Il ne remplace pas l'avis d'un professionnel de santé.",
      "section2Title": "2. Responsabilité",
      "section2Body": "L'utilisateur est seul responsable de la saisie correcte des informations médicales et du respect des prescriptions de son médecin.",
      "section3Title": "3. Données",
      "section3Body": "Toutes les données sont stockées localement. L'éditeur n'a accès à aucune information personnelle ou médicale.",
      "section4Title": "4. Modifications",
      "section4Body": "Ces conditions peuvent être mises à jour. Les mises à jour seront communiquées via les notes de version de l'application."
    }
  },
  "export": {
    "title": "Exporter les données",
    "period": "Période",
    "last7": "7 derniers jours",
    "last30": "30 derniers jours",
    "last90": "90 derniers jours",
    "custom": "Personnalisé",
    "from": "Du",
    "to": "Au",
    "summary": "Du {{from}} au {{to}} · {{count}} enregistrements",
    "csv": "⬇ Export CSV",
    "pdf": "⬇ Export PDF",
    "generating": "Génération en cours…"
  },
  "lock": {
    "subtitle": "Protégé par biométrie",
    "unlock": "Déverrouiller"
  },
  "scheduler": {
    "days": {
      "sun": "D",
      "mon": "L",
      "tue": "M",
      "wed": "M",
      "thu": "J",
      "fri": "V",
      "sat": "S"
    },
    "pattern": {
      "label": "Schéma répétitif (1 = prise, 0 = pause)",
      "preset11": "1/1 (alternance)",
      "preset21": "2/1",
      "preset52": "5/2 (sem.)",
      "preset217": "21/7"
    },
    "everyN": "Toutes les",
    "days_label": "jour(s)"
  }
}
```

- [ ] **Step 2: Replace `i18n/locales/en.json` with complete English translations**

```json
{
  "common": {
    "appName": "MediTrack",
    "continue": "Continue",
    "skip": "Skip",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "done": "Done",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "search": "Search",
    "add": "Add",
    "confirm": "Confirm",
    "close": "Close",
    "notFound": "Not found",
    "required": "Required",
    "activate": "Activate",
    "restart": "Restart"
  },
  "onboarding": {
    "slide1": {
      "title": "Scan your prescription",
      "description": "Photograph your prescription and let MediTrack automatically extract your medications."
    },
    "slide2": {
      "title": "Never miss a dose",
      "description": "Receive personalised reminders to take your medications at the right time, every day."
    },
    "slide3": {
      "title": "Manage multiple profiles safely",
      "description": "Track treatments for your whole family from one app. Your data stays on your device.",
      "getStarted": "Get started"
    },
    "slide4": {
      "title": "Enable reminders",
      "description": "Receive a notification at each dose time so you never miss a medication. You can change this at any time in Settings."
    }
  },
  "tabs": {
    "home": "Home",
    "history": "History",
    "add": "Add",
    "profile": "Profile",
    "medications": "Medications",
    "settings": "Settings"
  },
  "home": {
    "title": "Home",
    "greeting": "Hello, {{name}} 👋",
    "todayMeds": "Today's medications",
    "noMeds": "No medications scheduled today",
    "noMedsDescription": "Add a medication to start tracking.",
    "changeProfile": "Switch profile ▾",
    "manageProfiles": "Manage profiles",
    "stats": {
      "adherence": "Adherence",
      "today": "Today",
      "missed": "Missed"
    },
    "buckets": {
      "morning": "🌅 Morning",
      "afternoon": "☀️ Afternoon",
      "evening": "🌆 Evening",
      "night": "🌙 Night"
    }
  },
  "medications": {
    "title": "Medications",
    "active": "Active",
    "paused": "Paused",
    "empty": {
      "title": "No medications",
      "description": "Add your first medication."
    }
  },
  "history": {
    "title": "History",
    "empty": "No history",
    "emptyDescription": "Your intake history will appear here.",
    "export": "⬆ Export",
    "filters": {
      "all": "All",
      "taken": "Taken",
      "missed": "Missed",
      "skipped": "Skipped"
    },
    "ranges": {
      "seven": "7 d",
      "thirty": "30 d",
      "ninety": "90 d"
    },
    "stats": {
      "adherence": "Adherence",
      "taken": "Taken",
      "missed": "Missed",
      "skipped": "Skipped"
    }
  },
  "medication": {
    "types": {
      "pill": "Pill",
      "syrup": "Syrup",
      "injection": "Injection",
      "supplement": "Supplement",
      "other": "Other"
    },
    "freq": {
      "daily": "Daily",
      "weekly": "Weekly",
      "interval": "Interval",
      "custom": "Custom",
      "everyN": "Every",
      "days": "d",
      "customLabel": "Custom schedule"
    },
    "schedule": {
      "start": "Start",
      "end": "End",
      "indefinite": "Indefinite",
      "times": "Times",
      "upcoming": "Upcoming doses"
    },
    "actions": {
      "pause": "⏸ Pause",
      "resume": "▶ Resume",
      "delete": "Delete"
    },
    "detail": {
      "title": "Medication",
      "notFound": "This medication was not found.",
      "frequency": "Frequency",
      "notes": "Notes"
    },
    "form": {
      "step": "Step",
      "of": "/",
      "nameLabel": "Medication name *",
      "namePlaceholder": "e.g. Amoxicillin",
      "nameRequired": "Name is required",
      "nameMax": "Max 80 characters",
      "doseLabel": "Dose *",
      "qtyInvalid": "Invalid quantity (e.g. 1, 2.5)",
      "qtyMax": "Maximum 999",
      "unitRequired": "Unit required (e.g. mg, tablet)",
      "colorLabel": "Colour (optional)",
      "notesLabel": "Notes (optional)",
      "notesPlaceholder": "Special instructions...",
      "schedulingLabel": "Scheduling",
      "summaryLabel": "Summary",
      "endAfterStart": "End date must be after start date",
      "next": "Next",
      "previous": "Back",
      "typeLabel": "Form",
      "indefinite": "Indefinite duration"
    },
    "units": {
      "mg": "mg",
      "g": "g",
      "ml": "ml",
      "mcg": "mcg",
      "tablet": "tablet(s)",
      "capsule": "capsule(s)",
      "drop": "drop(s)",
      "dose": "dose(s)"
    },
    "confirm": {
      "noteLabel": "Note (optional)",
      "taken": "✓ Taken",
      "snooze": "⏱ Snooze",
      "skip": "→ Skip",
      "notFound": "Medication not found",
      "snooze10": "10 min",
      "snooze30": "30 min",
      "snooze60": "1 hour",
      "snoozeTitle": "Snooze reminder"
    },
    "scan": {
      "cameraRequired": "Camera required",
      "cameraDescription": "MediTrack needs access to your camera to scan prescriptions.",
      "allowCamera": "Allow camera",
      "addManually": "Add manually",
      "processing": "Analysing...",
      "detected": "Detected medications",
      "failed": "Analysis failed",
      "failedDescription": "Could not analyse the image.",
      "noneDetected": "No medications detected",
      "noneDescription": "The image could not extract any medications. Try a better shot or add manually.",
      "alignGuide": "Align the prescription within the frame",
      "gallery": "Gallery",
      "approveAndAdd": "Approve and add ({{count}})",
      "nameLabel": "Name",
      "dosageLabel": "Dosage"
    }
  },
  "profile": {
    "title": "Profiles",
    "new": "New",
    "hint": "Tap a profile to select it.",
    "active": "Active",
    "medCount_one": "{{count}} medication",
    "medCount_other": "{{count}} medications",
    "noProfiles": "No profiles yet",
    "noProfilesDescription": "Create a profile to start managing medications.",
    "createFirst": "Create my first profile",
    "bornOn": "Born on",
    "editTitle": "Edit profile",
    "notFound": "This profile was not found.",
    "dangerZone": "Danger zone",
    "deleteProfile": "Delete this profile",
    "form": {
      "nameLabel": "Name *",
      "namePlaceholder": "e.g. Ahmed",
      "nameRequired": "Name is required.",
      "dobLabel": "Date of birth",
      "dobPlaceholder": "DD/MM/YYYY",
      "relationLabel": "Relationship",
      "relationPlaceholder": "e.g. Myself, Child..."
    },
    "detail": {
      "medCount_one": "{{count}} medication",
      "medCount_other": "{{count}} medications",
      "saved_one": "saved",
      "saved_other": "saved"
    }
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "privacy": "Privacy policy",
    "terms": "Terms of use",
    "about": "About",
    "notifications": "Notifications",
    "version": "Version",
    "biometric": {
      "label": "Biometric lock",
      "description": "Requires Face ID / fingerprint on every open."
    },
    "restart": {
      "title": "Restart required",
      "body": "Please restart the app to apply the new layout direction."
    },
    "notificationsScreen": {
      "enable": "Enable notifications",
      "quietHours": "Quiet hours",
      "quietDescription": "No notifications will be sent during this period.",
      "start": "Start",
      "end": "End"
    },
    "aboutScreen": {
      "tagline": "Manage your medications simply.",
      "developer": "Developer",
      "platform": "Platform",
      "platformValue": "iOS & Android",
      "database": "Database",
      "databaseValue": "Local SQLite",
      "sharedData": "Shared data",
      "sharedDataValue": "None"
    },
    "privacyBody": "MediTrack stores all your data locally on your device. No personal data is transmitted to external servers. Your medical information remains entirely private and under your control.\n\nThe following data is stored locally:\n• Patient profiles (name, date of birth, relationship)\n• Medications and dosing schedules\n• Intake history\n\nYou can delete all your data at any time by uninstalling the app.",
    "termsScreen": {
      "intro": "By using MediTrack, you agree to the following terms:",
      "section1Title": "1. Use",
      "section1Body": "MediTrack is a medication management aid. It does not replace the advice of a healthcare professional.",
      "section2Title": "2. Responsibility",
      "section2Body": "The user is solely responsible for correctly entering medical information and following their doctor's prescriptions.",
      "section3Title": "3. Data",
      "section3Body": "All data is stored locally. The publisher has no access to any personal or medical information.",
      "section4Title": "4. Changes",
      "section4Body": "These terms may be updated. Updates will be communicated via the app's release notes."
    }
  },
  "export": {
    "title": "Export data",
    "period": "Period",
    "last7": "Last 7 days",
    "last30": "Last 30 days",
    "last90": "Last 90 days",
    "custom": "Custom",
    "from": "From",
    "to": "To",
    "summary": "From {{from}} to {{to}} · {{count}} records",
    "csv": "⬇ Export CSV",
    "pdf": "⬇ Export PDF",
    "generating": "Generating…"
  },
  "lock": {
    "subtitle": "Protected by biometrics",
    "unlock": "Unlock"
  },
  "scheduler": {
    "days": {
      "sun": "S",
      "mon": "M",
      "tue": "T",
      "wed": "W",
      "thu": "T",
      "fri": "F",
      "sat": "S"
    },
    "pattern": {
      "label": "Repeating pattern (1 = take, 0 = skip)",
      "preset11": "1/1 (alternate)",
      "preset21": "2/1",
      "preset52": "5/2 (week)",
      "preset217": "21/7"
    },
    "everyN": "Every",
    "days_label": "day(s)"
  }
}
```

- [ ] **Step 3: Replace `i18n/locales/ar.json` with complete Arabic translations**

```json
{
  "common": {
    "appName": "ميديتراك",
    "continue": "متابعة",
    "skip": "تخطي",
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "back": "رجوع",
    "done": "تم",
    "loading": "جارٍ التحميل...",
    "error": "حدث خطأ",
    "retry": "إعادة المحاولة",
    "search": "بحث",
    "add": "إضافة",
    "confirm": "تأكيد",
    "close": "إغلاق",
    "notFound": "غير موجود",
    "required": "مطلوب",
    "activate": "تفعيل",
    "restart": "إعادة التشغيل"
  },
  "onboarding": {
    "slide1": {
      "title": "امسح وصفتك الطبية",
      "description": "التقط صورة لوصفتك الطبية ودع ميديتراك يستخرج أدويتك تلقائيًا."
    },
    "slide2": {
      "title": "لا تفوّت أي جرعة",
      "description": "احصل على تذكيرات مخصصة لتناول أدويتك في الوقت المناسب كل يوم."
    },
    "slide3": {
      "title": "أدِر ملفات متعددة بأمان",
      "description": "تابع علاجات عائلتك بأكملها من تطبيق واحد. تبقى بياناتك على جهازك.",
      "getStarted": "ابدأ الآن"
    },
    "slide4": {
      "title": "فعّل التذكيرات",
      "description": "احصل على إشعار عند كل موعد جرعة حتى لا تفوتك أي دواء. يمكنك تغيير ذلك في أي وقت من الإعدادات."
    }
  },
  "tabs": {
    "home": "الرئيسية",
    "history": "السجل",
    "add": "إضافة",
    "profile": "الملف",
    "medications": "الأدوية",
    "settings": "الإعدادات"
  },
  "home": {
    "title": "الرئيسية",
    "greeting": "مرحبًا، {{name}} 👋",
    "todayMeds": "أدوية اليوم",
    "noMeds": "لا توجد أدوية مجدولة اليوم",
    "noMedsDescription": "أضف دواءً لبدء التتبع.",
    "changeProfile": "تغيير الملف ▾",
    "manageProfiles": "إدارة الملفات",
    "stats": {
      "adherence": "الالتزام",
      "today": "اليوم",
      "missed": "الفائتة"
    },
    "buckets": {
      "morning": "🌅 الصباح",
      "afternoon": "☀️ الظهر",
      "evening": "🌆 المساء",
      "night": "🌙 الليل"
    }
  },
  "medications": {
    "title": "الأدوية",
    "active": "نشطة",
    "paused": "موقوفة",
    "empty": {
      "title": "لا توجد أدوية",
      "description": "أضف دواءك الأول."
    }
  },
  "history": {
    "title": "السجل",
    "empty": "لا يوجد سجل",
    "emptyDescription": "سيظهر سجل تناولك هنا.",
    "export": "⬆ تصدير",
    "filters": {
      "all": "الكل",
      "taken": "مأخوذة",
      "missed": "الفائتة",
      "skipped": "المتخطاة"
    },
    "ranges": {
      "seven": "7 أ",
      "thirty": "30 أ",
      "ninety": "90 أ"
    },
    "stats": {
      "adherence": "الالتزام",
      "taken": "مأخوذة",
      "missed": "الفائتة",
      "skipped": "المتخطاة"
    }
  },
  "medication": {
    "types": {
      "pill": "حبة",
      "syrup": "شراب",
      "injection": "حقنة",
      "supplement": "مكمل غذائي",
      "other": "أخرى"
    },
    "freq": {
      "daily": "يومي",
      "weekly": "أسبوعي",
      "interval": "فترة",
      "custom": "مخصص",
      "everyN": "كل",
      "days": "ي",
      "customLabel": "جدول مخصص"
    },
    "schedule": {
      "start": "البداية",
      "end": "النهاية",
      "indefinite": "غير محدد",
      "times": "المواعيد",
      "upcoming": "الجرعات القادمة"
    },
    "actions": {
      "pause": "⏸ إيقاف مؤقت",
      "resume": "▶ استئناف",
      "delete": "حذف"
    },
    "detail": {
      "title": "الدواء",
      "notFound": "لم يتم العثور على هذا الدواء.",
      "frequency": "التكرار",
      "notes": "ملاحظات"
    },
    "form": {
      "step": "خطوة",
      "of": "/",
      "nameLabel": "اسم الدواء *",
      "namePlaceholder": "مثال: أموكسيسيلين",
      "nameRequired": "الاسم مطلوب",
      "nameMax": "الحد الأقصى 80 حرفًا",
      "doseLabel": "الجرعة *",
      "qtyInvalid": "كمية غير صالحة (مثال: 1، 2.5)",
      "qtyMax": "الحد الأقصى 999",
      "unitRequired": "الوحدة مطلوبة (مثال: ملغ، حبة)",
      "colorLabel": "اللون (اختياري)",
      "notesLabel": "ملاحظات (اختيارية)",
      "notesPlaceholder": "تعليمات خاصة...",
      "schedulingLabel": "الجدولة",
      "summaryLabel": "الملخص",
      "endAfterStart": "يجب أن يكون تاريخ الانتهاء بعد تاريخ البداية",
      "next": "التالي",
      "previous": "رجوع",
      "typeLabel": "الشكل",
      "indefinite": "مدة غير محددة"
    },
    "units": {
      "mg": "ملغ",
      "g": "غ",
      "ml": "مل",
      "mcg": "ميكروغرام",
      "tablet": "حبة/حبات",
      "capsule": "كبسولة/كبسولات",
      "drop": "قطرة/قطرات",
      "dose": "جرعة/جرعات"
    },
    "confirm": {
      "noteLabel": "ملاحظة (اختيارية)",
      "taken": "✓ تم الأخذ",
      "snooze": "⏱ تأجيل",
      "skip": "→ تخطي",
      "notFound": "الدواء غير موجود",
      "snooze10": "10 دقائق",
      "snooze30": "30 دقيقة",
      "snooze60": "ساعة واحدة",
      "snoozeTitle": "تأجيل التذكير"
    },
    "scan": {
      "cameraRequired": "الكاميرا مطلوبة",
      "cameraDescription": "يحتاج ميديتراك إلى الوصول إلى كاميرتك لمسح الوصفات الطبية.",
      "allowCamera": "السماح بالكاميرا",
      "addManually": "إضافة يدويًا",
      "processing": "جارٍ التحليل...",
      "detected": "الأدوية المكتشفة",
      "failed": "فشل التحليل",
      "failedDescription": "تعذّر تحليل الصورة.",
      "noneDetected": "لم يتم اكتشاف أي أدوية",
      "noneDescription": "لم تتمكن الصورة من استخراج أي أدوية. جرّب التقاط صورة أوضح أو أضف يدويًا.",
      "alignGuide": "ضع الوصفة داخل الإطار",
      "gallery": "المعرض",
      "approveAndAdd": "موافقة وإضافة ({{count}})",
      "nameLabel": "الاسم",
      "dosageLabel": "الجرعة"
    }
  },
  "profile": {
    "title": "الملفات",
    "new": "جديد",
    "hint": "اضغط على ملف لتحديده.",
    "active": "نشط",
    "medCount_one": "{{count}} دواء",
    "medCount_other": "{{count}} أدوية",
    "noProfiles": "لا توجد ملفات",
    "noProfilesDescription": "أنشئ ملفًا لبدء إدارة الأدوية.",
    "createFirst": "إنشاء ملفي الأول",
    "bornOn": "تاريخ الميلاد",
    "editTitle": "تعديل الملف",
    "notFound": "لم يتم العثور على هذا الملف.",
    "dangerZone": "منطقة الخطر",
    "deleteProfile": "حذف هذا الملف",
    "form": {
      "nameLabel": "الاسم *",
      "namePlaceholder": "مثال: أحمد",
      "nameRequired": "الاسم مطلوب.",
      "dobLabel": "تاريخ الميلاد",
      "dobPlaceholder": "يي/شش/سسسس",
      "relationLabel": "العلاقة",
      "relationPlaceholder": "مثال: أنا، طفل..."
    },
    "detail": {
      "medCount_one": "{{count}} دواء",
      "medCount_other": "{{count}} أدوية",
      "saved_one": "مسجّل",
      "saved_other": "مسجّلة"
    }
  },
  "settings": {
    "title": "الإعدادات",
    "language": "اللغة",
    "privacy": "سياسة الخصوصية",
    "terms": "شروط الاستخدام",
    "about": "حول التطبيق",
    "notifications": "الإشعارات",
    "version": "الإصدار",
    "biometric": {
      "label": "القفل البيومتري",
      "description": "يطلب Face ID / بصمة الإصبع عند كل فتح."
    },
    "restart": {
      "title": "إعادة التشغيل مطلوبة",
      "body": "يرجى إعادة تشغيل التطبيق لتطبيق اتجاه التخطيط الجديد."
    },
    "notificationsScreen": {
      "enable": "تفعيل الإشعارات",
      "quietHours": "ساعات الهدوء",
      "quietDescription": "لن يتم إرسال أي إشعارات خلال هذه الفترة.",
      "start": "البداية",
      "end": "النهاية"
    },
    "aboutScreen": {
      "tagline": "أدِر أدويتك ببساطة.",
      "developer": "المطوّر",
      "platform": "المنصة",
      "platformValue": "iOS وAndroid",
      "database": "قاعدة البيانات",
      "databaseValue": "SQLite محلي",
      "sharedData": "البيانات المشتركة",
      "sharedDataValue": "لا شيء"
    },
    "privacyBody": "يخزّن ميديتراك جميع بياناتك محليًا على جهازك. لا يتم إرسال أي بيانات شخصية إلى خوادم خارجية. تبقى معلوماتك الطبية خاصة تمامًا وتحت سيطرتك.\n\nيتم تخزين البيانات التالية محليًا:\n• ملفات المرضى (الاسم، تاريخ الميلاد، العلاقة)\n• الأدوية وجداول الجرعات\n• سجل تناول الأدوية\n\nيمكنك حذف جميع بياناتك في أي وقت بإلغاء تثبيت التطبيق.",
    "termsScreen": {
      "intro": "باستخدام ميديتراك، فإنك توافق على الشروط التالية:",
      "section1Title": "1. الاستخدام",
      "section1Body": "ميديتراك أداة مساعدة لإدارة الأدوية. لا يحل محل استشارة متخصص الرعاية الصحية.",
      "section2Title": "2. المسؤولية",
      "section2Body": "المستخدم وحده مسؤول عن إدخال المعلومات الطبية الصحيحة واتباع وصفات طبيبه.",
      "section3Title": "3. البيانات",
      "section3Body": "جميع البيانات مخزّنة محليًا. لا يملك الناشر إمكانية الوصول إلى أي معلومات شخصية أو طبية.",
      "section4Title": "4. التعديلات",
      "section4Body": "قد يتم تحديث هذه الشروط. سيتم إبلاغك بالتحديثات عبر ملاحظات إصدار التطبيق."
    }
  },
  "export": {
    "title": "تصدير البيانات",
    "period": "الفترة",
    "last7": "آخر 7 أيام",
    "last30": "آخر 30 يومًا",
    "last90": "آخر 90 يومًا",
    "custom": "مخصص",
    "from": "من",
    "to": "إلى",
    "summary": "من {{from}} إلى {{to}} · {{count}} سجل",
    "csv": "⬇ تصدير CSV",
    "pdf": "⬇ تصدير PDF",
    "generating": "جارٍ الإنشاء…"
  },
  "lock": {
    "subtitle": "محمي ببصمة",
    "unlock": "فتح القفل"
  },
  "scheduler": {
    "days": {
      "sun": "أح",
      "mon": "ن",
      "tue": "ث",
      "wed": "ر",
      "thu": "خ",
      "fri": "ج",
      "sat": "س"
    },
    "pattern": {
      "label": "نمط متكرر (1 = جرعة، 0 = راحة)",
      "preset11": "1/1 (تناوب)",
      "preset21": "2/1",
      "preset52": "5/2 (أسبوع)",
      "preset217": "21/7"
    },
    "everyN": "كل",
    "days_label": "يوم/أيام"
  }
}
```

- [ ] **Step 4: Verify TypeScript accepts the new JSON (run typecheck)**

```bash
cd D:\MedicalIT\meditrack && npx tsc --noEmit
```

Expected: 0 errors (JSON imports are typed automatically).

---

## Task 2: Translate home screen `app/(tabs)/index.tsx`

**Files:**
- Modify: `app/(tabs)/index.tsx`

The file already has `useTranslation` imported and uses `t()` in some places. Three hardcoded strings remain: bucket labels in the `BUCKETS` constant, and `'Changer de profil ▾'`/`'Gérer les profils'` in the header. Also `StatCard` labels `'Observance'`, `'Aujourd'hui'`, `'Manqués'` are hardcoded.

- [ ] **Step 1: Replace the BUCKETS constant to use translation keys instead of hardcoded labels**

In `app/(tabs)/index.tsx`, replace the `BUCKETS` constant and `HomeScreen` component to use `t()`. The `BUCKETS` array is defined at module level but `t()` must be called inside a component. Move the labels inside the component.

Replace the entire BUCKETS constant + HomeScreen function with:

```tsx
const BUCKET_KEYS = [
  { key: 'morning',   start:  6, end: 12 },
  { key: 'afternoon', start: 12, end: 17 },
  { key: 'evening',   start: 17, end: 21 },
  { key: 'night',     start: 21, end:  6 },
] as const;

type BucketKey = (typeof BUCKET_KEYS)[number]['key'];
```

Then inside `HomeScreen`, build the labeled buckets:

```tsx
export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { todayMedications, intakeHistory, recordIntake, getIntakeForDose, adherenceRate } = useMedications();
  const { profiles, activeProfile, setActiveProfile } = useProfiles();
  const { todaySummary } = useScheduler();
  const hydrateMedications = useMedicationStore((s) => s.hydrate);

  const today = new Date();

  const BUCKETS = BUCKET_KEYS.map((b) => ({
    ...b,
    label: t(`home.buckets.${b.key}`),
  }));

  const sections = buildBucketSections(todayMedications, today, BUCKETS);

  async function handleRefresh() {
    await hydrateMedications();
  }

  return (
    <ScreenContainer scrollable onRefresh={handleRefresh}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7} style={styles.greetingBtn}>
          <Text style={styles.greeting}>
            {activeProfile ? t('home.greeting', { name: activeProfile.name }) : t('home.title')}
          </Text>
          <Text style={styles.profileSwitch}>
            {profiles.length > 1 ? t('home.changeProfile') : t('home.manageProfiles')}
          </Text>
        </TouchableOpacity>
        {todaySummary.pending > 0 && (
          <Badge label={String(todaySummary.pending)} variant="warning" />
        )}
      </View>

      {/* Profile selector (multi-profile) */}
      {profiles.length > 1 && (
        <ProfileSelector
          profiles={profiles}
          activeProfileId={activeProfile?.id ?? null}
          onSelect={setActiveProfile}
        />
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label={t('home.stats.adherence')} value={`${adherenceRate}%`} />
        <StatCard label={t('home.stats.today')} value={`${todaySummary.taken}/${todaySummary.total}`} />
        <StatCard label={t('home.stats.missed')} value={String(todaySummary.missed)} />
      </View>

      {/* Bucketed medication list */}
      {sections.length === 0 ? (
        <EmptyState
          title={t('home.noMeds')}
          description={t('home.noMedsDescription')}
          actionLabel={t('common.add')}
          onAction={() => router.push('/(tabs)/add')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.medication.id}_${item.scheduledISO}`}
          stickySectionHeadersEnabled={false}
          scrollEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.bucketHeader}>{section.label}</Text>
          )}
          renderItem={({ item }) => {
            const intakeRecord = getIntakeForDose(item.medication.id, item.scheduledISO);
            return (
              <MedCard
                medication={item.medication}
                scheduledTime={item.scheduledTime}
                scheduledISO={item.scheduledISO}
                intakeRecord={intakeRecord}
                onMarkTaken={() =>
                  recordIntake({
                    medicationId: item.medication.id,
                    profileId: item.medication.profileId,
                    scheduledAt: item.scheduledISO,
                    takenAt: new Date().toISOString(),
                  })
                }
                onSkip={() =>
                  recordIntake({
                    medicationId: item.medication.id,
                    profileId: item.medication.profileId,
                    scheduledAt: item.scheduledISO,
                    skipped: true,
                  })
                }
              />
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
```

- [ ] **Step 2: Update `buildBucketSections` to accept the labelled BUCKETS array**

Replace the `buildBucketSections` function signature (it currently reads the module-level BUCKETS):

```tsx
function buildBucketSections(
  medications: Medication[],
  today: Date,
  buckets: { key: BucketKey; label: string; start: number; end: number }[]
) {
  const entries: DoseEntry[] = [];

  for (const med of medications) {
    const doses = getScheduledDosesForDay(med, today);
    for (const dose of doses) {
      const hh = String(dose.getHours()).padStart(2, '0');
      const mm = String(dose.getMinutes()).padStart(2, '0');
      entries.push({ medication: med, scheduledISO: dose.toISOString(), scheduledTime: `${hh}:${mm}` });
    }
  }

  entries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const groups: Record<BucketKey, DoseEntry[]> = { morning: [], afternoon: [], evening: [], night: [] };
  for (const entry of entries) {
    groups[getBucket(entry.scheduledTime)].push(entry);
  }

  return buckets
    .map((b) => ({ ...b, data: groups[b.key] }))
    .filter((s) => s.data.length > 0);
}
```

---

## Task 3: Translate `app/(tabs)/medications.tsx`

**Files:**
- Modify: `app/(tabs)/medications.tsx`

- [ ] **Step 1: Add `useTranslation` import and translate all hardcoded strings**

Replace the entire file content with:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, SectionList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { EmptyState } from '@components/ui/EmptyState';
import { Badge } from '@components/ui/Badge';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useMedications } from '@hooks/useMedications';
import { useMedicationStore, Medication } from '@store/medicationStore';
import { formatTime } from '@utils/dateHelpers';

const TYPE_COLOR: Record<string, string> = {
  pill: '#6366F1', syrup: '#EC4899', injection: '#F97316', supplement: '#10B981', other: Colors.textSecondary,
};

function MedRow({ item }: { item: Medication }) {
  const { t } = useTranslation();
  const router = useRouter();
  const freqLabel = t(`medication.freq.${item.schedule.frequency}`, { defaultValue: item.schedule.frequency });
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/medication/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.dot, { backgroundColor: TYPE_COLOR[item.type] ?? TYPE_COLOR.other }]} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          {item.doseQuantity} {item.unit} · {freqLabel}
        </Text>
        <Text style={styles.times}>{item.schedule.times.map(formatTime).join(' · ')}</Text>
      </View>
      {item.paused && <Badge label={t('medications.paused')} variant="warning" size="sm" />}
    </TouchableOpacity>
  );
}

export default function MedicationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { medications } = useMedications();
  const hydrate = useMedicationStore((s) => s.hydrate);

  const active = medications.filter((m) => !m.paused);
  const paused = medications.filter((m) => m.paused);

  const sections = [
    ...(active.length > 0 ? [{ title: t('medications.active'), data: active }] : []),
    ...(paused.length > 0 ? [{ title: t('medications.paused'), data: paused }] : []),
  ];

  if (medications.length === 0) {
    return (
      <ScreenContainer scrollable onRefresh={hydrate}>
        <Text style={styles.title}>{t('medications.title')}</Text>
        <EmptyState
          title={t('medications.empty.title')}
          description={t('medications.empty.description')}
          actionLabel={t('common.add')}
          onAction={() => router.push('/(tabs)/add')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable onRefresh={hydrate}>
      <Text style={styles.title}>{t('medications.title')}</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        scrollEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => <MedRow item={item} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title:         { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  sectionHeader: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  dot:           { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  info:          { flex: 1 },
  name:          { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  sub:           { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  times:         { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 1 },
});
```

---

## Task 4: Translate `app/(tabs)/history.tsx`

**Files:**
- Modify: `app/(tabs)/history.tsx`

The file already imports `useTranslation` but only uses it for the empty state. The FILTERS and RANGES arrays are hardcoded, and the stats labels are hardcoded.

- [ ] **Step 1: Replace FILTERS and RANGES constants and translate stats labels**

Replace the FILTERS and RANGES constant definitions and the component body:

```tsx
// Remove hardcoded FILTERS and RANGES arrays at top of file.
// Replace with these inside the component (after const { t } = useTranslation()):

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',     label: t('history.filters.all') },
  { key: 'taken',   label: t('history.filters.taken') },
  { key: 'missed',  label: t('history.filters.missed') },
  { key: 'skipped', label: t('history.filters.skipped') },
];

const RANGES: { value: Range; label: string }[] = [
  { value: 7,  label: t('history.ranges.seven') },
  { value: 30, label: t('history.ranges.thirty') },
  { value: 90, label: t('history.ranges.ninety') },
];
```

Also replace the hardcoded strings in JSX:

```tsx
// Title:
<Text style={styles.title}>{t('history.title')}</Text>

// Export button:
<Text style={styles.exportBtnText}>{t('history.export')}</Text>

// Stats labels:
<Text style={styles.statLabel}>{t('history.stats.adherence')}</Text>
<Text style={styles.statLabel}>{t('history.stats.taken')}</Text>
<Text style={styles.statLabel}>{t('history.stats.missed')}</Text>
<Text style={styles.statLabel}>{t('history.stats.skipped')}</Text>
```

The day labels in the week strip use `['D','L','M','M','J','V','S'][day.getDay()]` — replace with:

```tsx
const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'] as const;
// Then in the renderItem:
const label = t(`scheduler.days.${DAY_KEYS[day.getDay()]}`);
```

- [ ] **Step 2: Write the complete updated `app/(tabs)/history.tsx`**

```tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { EmptyState } from '@components/ui/EmptyState';
import { MedListItem } from '@components/medication/MedListItem';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useMedications } from '@hooks/useMedications';
import { isSameDay, addDays } from '@utils/dateHelpers';
import { IntakeRecord } from '@store/medicationStore';
import { useRouter } from 'expo-router';

type Filter = 'all' | 'taken' | 'missed' | 'skipped';
type Range = 7 | 30 | 90;

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function buildDays(range: Range): Date[] {
  const today = new Date();
  return Array.from({ length: range }, (_, i) => addDays(today, i - (range - 1)));
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { medications, intakeHistory } = useMedications();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<Filter>('all');
  const [range, setRange] = useState<Range>(7);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',     label: t('history.filters.all') },
    { key: 'taken',   label: t('history.filters.taken') },
    { key: 'missed',  label: t('history.filters.missed') },
    { key: 'skipped', label: t('history.filters.skipped') },
  ];

  const RANGES: { value: Range; label: string }[] = [
    { value: 7,  label: t('history.ranges.seven') },
    { value: 30, label: t('history.ranges.thirty') },
    { value: 90, label: t('history.ranges.ninety') },
  ];

  const days = useMemo(() => buildDays(range), [range]);

  const rangeStart = days[0];
  const rangeEnd   = days[days.length - 1];

  const dayRecords = intakeHistory.filter((r) => isSameDay(r.scheduledAt, selectedDate));

  const filtered = dayRecords.filter((r) => {
    if (filter === 'taken')   return !!r.takenAt;
    if (filter === 'skipped') return !!r.skipped;
    if (filter === 'missed')  return !r.takenAt && !r.skipped;
    return true;
  });

  const rangeRecords = intakeHistory.filter((r) => {
    const d = new Date(r.scheduledAt);
    return d >= rangeStart && d <= rangeEnd;
  });
  const taken   = rangeRecords.filter((r) => !!r.takenAt).length;
  const skipped = rangeRecords.filter((r) => !!r.skipped).length;
  const missed  = rangeRecords.filter((r) => !r.takenAt && !r.skipped).length;
  const total   = rangeRecords.length;
  const adherencePct = total > 0 ? Math.round((taken / total) * 100) : 100;

  function getMed(record: IntakeRecord) {
    return medications.find((m) => m.id === record.medicationId);
  }

  const visibleDays = range === 7 ? days : (() => {
    const idx = days.findIndex((d) => isSameDay(d, selectedDate));
    const center = idx >= 0 ? idx : days.length - 1;
    const start = Math.max(0, Math.min(center - 3, days.length - 7));
    return days.slice(start, start + 7);
  })();

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('history.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/export' as any)} style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>{t('history.export')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.value}
            onPress={() => { setRange(r.value); setSelectedDate(new Date()); }}
            style={[styles.rangeBtn, range === r.value && styles.rangeBtnActive]}
          >
            <Text style={[styles.rangeBtnText, range === r.value && styles.rangeBtnTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{adherencePct}%</Text>
          <Text style={styles.statLabel}>{t('history.stats.adherence')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#15803D' }]}>{taken}</Text>
          <Text style={styles.statLabel}>{t('history.stats.taken')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>{missed}</Text>
          <Text style={styles.statLabel}>{t('history.stats.missed')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#92400E' }]}>{skipped}</Text>
          <Text style={styles.statLabel}>{t('history.stats.skipped')}</Text>
        </View>
      </View>

      <View style={styles.weekStrip}>
        {visibleDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday    = isSameDay(day, new Date());
          const label      = t(`scheduler.days.${DAY_KEYS[day.getDay()]}`);
          const dayNum     = day.getDate();
          const hasActivity = intakeHistory.some((r) => isSameDay(r.scheduledAt, day));
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(day)}
              style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
            >
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{label}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumActive, isToday && !isSelected && styles.dayNumToday]}>{dayNum}</Text>
              {hasActivity && !isSelected && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title={t('history.empty')}
          description={t('history.emptyDescription')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const med = getMed(item);
            if (!med) return null;
            return (
              <MedListItem
                medication={med}
                intakeRecord={item}
                scheduledAt={item.scheduledAt}
              />
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  title:            { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  exportBtn:        { paddingVertical: 6, paddingHorizontal: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.primary },
  exportBtnText:    { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  rangeRow:         { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
  rangeBtn:         { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  rangeBtnActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rangeBtnText:     { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  rangeBtnTextActive: { color: Colors.textInverse },
  statsCard:        { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
  statItem:         { flex: 1, alignItems: 'center' },
  statValue:        { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  statLabel:        { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider:      { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  weekStrip:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  dayBtn:           { alignItems: 'center', padding: Spacing.xs, borderRadius: Radius.sm, flex: 1, minHeight: 52 },
  dayBtnActive:     { backgroundColor: Colors.primary },
  dayLabel:         { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  dayLabelActive:   { color: Colors.textInverse },
  dayNum:           { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  dayNumActive:     { color: Colors.textInverse },
  dayNumToday:      { color: Colors.primary },
  dot:              { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 2 },
  filterRow:        { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
  filterBtn:        { paddingVertical: 6, paddingHorizontal: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  filterBtnActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText:       { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.textInverse },
});
```

---

## Task 5: Translate `app/(tabs)/settings.tsx` and `app/(tabs)/add.tsx`

**Files:**
- Modify: `app/(tabs)/settings.tsx`
- Modify: `app/(tabs)/add.tsx`

- [ ] **Step 1: Fix 2 remaining hardcoded strings in `app/(tabs)/settings.tsx`**

In `app/(tabs)/settings.tsx`, find these two hardcoded strings and replace with `t()` calls. The file already imports and uses `useTranslation`.

Replace:
```tsx
<Text style={styles.rowLabel}>Verrou biométrique</Text>
```
With:
```tsx
<Text style={styles.rowLabel}>{t('settings.biometric.label')}</Text>
```

Replace:
```tsx
<Text style={styles.biometricHint}>
  Demande Face ID / empreinte à chaque ouverture.
</Text>
```
With:
```tsx
<Text style={styles.biometricHint}>{t('settings.biometric.description')}</Text>
```

Also fix the biometric authenticate prompt (not visible text, but good to translate):
Replace:
```tsx
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Confirmez pour activer le verrou',
  cancelLabel: 'Annuler',
});
```
With:
```tsx
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: t('settings.biometric.label'),
  cancelLabel: t('common.cancel'),
});
```

- [ ] **Step 2: Translate `app/(tabs)/add.tsx`**

Add `useTranslation` import and replace 3 hardcoded strings:

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MedForm } from '@components/medication/MedForm';
import { EmptyState } from '@components/ui/EmptyState';
import { useMedications } from '@hooks/useMedications';
import { useProfiles } from '@hooks/useProfiles';
import { NewMedication } from '@store/medicationStore';
import { ScreenContainer } from '@components/layout/ScreenContainer';

export default function AddScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addMedication } = useMedications();
  const { activeProfile } = useProfiles();
  const params = useLocalSearchParams<{ prefillName?: string; prefillUnit?: string; prefillQty?: string }>();

  if (!activeProfile) {
    return (
      <ScreenContainer>
        <EmptyState
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
    router.replace('/(tabs)');
  }

  return (
    <MedForm
      profileId={activeProfile.id}
      initialValues={prefill}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({});
```

---

## Task 6: Read and translate remaining screens

Before writing Tasks 6–11, read these files to get exact current content:

- [ ] **Step 1: Read `app/medication/[id].tsx`**

Read the file at `app/medication/[id].tsx`.

- [ ] **Step 2: Read `app/medication/confirm.tsx` and `app/profile/index.tsx`**

Read both files.

- [ ] **Step 3: Read `app/profile/new.tsx`, `app/profile/[id].tsx`**

Read both files.

- [ ] **Step 4: Read `app/settings/notifications.tsx`, `app/settings/about.tsx`, `app/settings/language.tsx`, `app/settings/privacy.tsx`, `app/settings/terms.tsx`**

Read all five.

- [ ] **Step 5: Read `app/export.tsx` and `app/(onboarding)/slide4.tsx`**

Read both.

---

## Task 7: Translate `app/medication/[id].tsx`

**Files:**
- Modify: `app/medication/[id].tsx`

After reading the file in Task 6, replace all hardcoded strings using these mappings:

| Hardcoded FR | Key |
|---|---|
| `'Médicament'` (title) | `t('medication.detail.title')` |
| `'Ce médicament est introuvable.'` | `t('medication.detail.notFound')` |
| `'Retour'` | `t('common.back')` |
| `'Modifier'` | `t('common.edit')` |
| `'En pause'` badge | `t('medications.paused')` |
| `'Fréquence'` | `t('medication.detail.frequency')` |
| `'Horaires'` | `t('medication.schedule.times')` |
| `'Début'` | `t('medication.schedule.start')` |
| `'Fin'` | `t('medication.schedule.end')` |
| `'Indéfinie'` | `t('medication.schedule.indefinite')` |
| `'Notes'` | `t('medication.detail.notes')` |
| `'Prochaines prises'` | `t('medication.schedule.upcoming')` |
| `'▶ Reprendre'` | `t('medication.actions.resume')` |
| `'⏸ Mettre en pause'` | `t('medication.actions.pause')` |
| `'Supprimer'` | `t('medication.actions.delete')` |
| Type labels `'Pilule'` etc. | `t(`medication.types.${med.type}`)` |
| Frequency labels `'Quotidien'` etc. | `t(`medication.freq.${med.schedule.frequency}`)` |
| Interval display `Toutes les N j` | `` `${t('medication.freq.everyN')} ${med.schedule.intervalDays ?? 1} ${t('medication.freq.days')}` `` |
| `'Schéma personnalisé'` | `t('medication.freq.customLabel')` |

Add `useTranslation` import if not present, call `const { t } = useTranslation()` inside the component.

---

## Task 8: Translate `app/medication/confirm.tsx`

**Files:**
- Modify: `app/medication/confirm.tsx`

After reading the file in Task 6, replace all hardcoded strings:

| Hardcoded FR | Key |
|---|---|
| `'Note (optionnel)'` | `t('medication.confirm.noteLabel')` |
| `'✓ Pris'` | `t('medication.confirm.taken')` |
| `'⏱ Reporter'` | `t('medication.confirm.snooze')` |
| `'→ Passer'` | `t('medication.confirm.skip')` |
| `'Annuler'` | `t('common.cancel')` |
| `'10 min'` | `t('medication.confirm.snooze10')` |
| `'30 min'` | `t('medication.confirm.snooze30')` |
| `'1 heure'` | `t('medication.confirm.snooze60')` |
| `'Reporter le rappel'` | `t('medication.confirm.snoozeTitle')` |
| `'Médicament introuvable'` | `t('medication.confirm.notFound')` |
| `'Retour'` | `t('common.back')` |

Add `useTranslation` import if not present.

---

## Task 9: Translate `app/medication/scan.tsx`

**Files:**
- Modify: `app/medication/scan.tsx`

Add `useTranslation` import and `const { t } = useTranslation()` inside `ScanScreen`. Replace all hardcoded strings:

| Hardcoded FR | Key |
|---|---|
| `'Caméra requise'` | `t('medication.scan.cameraRequired')` |
| `'MediTrack a besoin...'` | `t('medication.scan.cameraDescription')` |
| `'Autoriser la caméra'` | `t('medication.scan.allowCamera')` |
| `'Ajouter manuellement'` | `t('medication.scan.addManually')` |
| `'Analyse en cours...'` | `t('medication.scan.processing')` |
| `'Médicaments détectés'` | `t('medication.scan.detected')` |
| `'Analyse échouée'` | `t('medication.scan.failed')` |
| `'Aucun médicament détecté'` | `t('medication.scan.noneDetected')` |
| `'L'image n'a pas permis...'` | `t('medication.scan.noneDescription')` |
| `'Alignez l'ordonnance dans le cadre'` | `t('medication.scan.alignGuide')` |
| `'Galerie'` | `t('medication.scan.gallery')` |
| `` `Approuver et ajouter (${count})` `` | `t('medication.scan.approveAndAdd', { count })` |
| `'Réessayer'` | `t('common.retry')` |
| `'Nom'` (field label) | `t('medication.scan.nameLabel')` |
| `'Dosage'` (field label) | `t('medication.scan.dosageLabel')` |

---

## Task 10: Translate profile screens

**Files:**
- Modify: `app/profile/index.tsx`
- Modify: `app/profile/new.tsx`
- Modify: `app/profile/[id].tsx`

After reading in Task 6, apply these replacements. Add `useTranslation` where missing.

**`app/profile/index.tsx`:**

| Hardcoded | Key |
|---|---|
| `'Profils'` | `t('profile.title')` |
| `'Nouveau'` | `t('profile.new')` |
| `'Aucun profil créé'` | `t('profile.noProfiles')` |
| `'Créez un profil pour commencer...'` | `t('profile.noProfilesDescription')` |
| `'Créer mon premier profil'` | `t('profile.createFirst')` |
| `'Appuyez sur un profil...'` | `t('profile.hint')` |
| `'Actif'` | `t('profile.active')` |
| Medication count (singular/plural) | `t('profile.medCount', { count: medCount })` |

**`app/profile/new.tsx`:**

| Hardcoded | Key |
|---|---|
| `'Nouveau profil'` | `t('profile.new')` |
| `'Nom *'` | `t('profile.form.nameLabel')` |
| `'ex: Ahmed'` | `t('profile.form.namePlaceholder')` |
| `'Le nom est requis.'` | `t('profile.form.nameRequired')` |
| `'Date de naissance'` | `t('profile.form.dobLabel')` |
| `'JJ/MM/AAAA'` | `t('profile.form.dobPlaceholder')` |
| `'Relation'` | `t('profile.form.relationLabel')` |
| `'ex: Moi-même, Enfant...'` | `t('profile.form.relationPlaceholder')` |
| `'Enregistrer'` | `t('common.save')` |
| `'Terminer'` (iOS picker done) | `t('common.done')` |

**`app/profile/[id].tsx`:**

| Hardcoded | Key |
|---|---|
| `'Profil'` | `t('profile.title')` |
| `'Ce profil est introuvable.'` | `t('profile.notFound')` |
| `'Retour'` | `t('common.back')` |
| `'Modifier le profil'` | `t('profile.editTitle')` |
| `'Modifier'` | `t('common.edit')` |
| `'Né(e) le '` | `t('profile.bornOn')` |
| `'médicament'` / `'médicaments'` | `t('profile.detail.medCount', { count })` |
| `'enregistré'` / `'enregistrés'` | `t('profile.detail.saved', { count })` |
| `'Nom *'` | `t('profile.form.nameLabel')` |
| `'Nom du patient'` | `t('profile.form.namePlaceholder')` |
| `'Date de naissance'` | `t('profile.form.dobLabel')` |
| `'JJ/MM/AAAA'` | `t('profile.form.dobPlaceholder')` |
| `'Relation'` | `t('profile.form.relationLabel')` |
| `'ex: Moi-même, Enfant, Parent...'` | `t('profile.form.relationPlaceholder')` |
| `'Enregistrer'` | `t('common.save')` |
| `'Annuler'` | `t('common.cancel')` |
| `'Terminer'` (iOS picker) | `t('common.done')` |
| `'Zone de danger'` | `t('profile.dangerZone')` |
| `'Supprimer ce profil'` | `t('profile.deleteProfile')` |

---

## Task 11: Translate settings sub-screens

**Files:**
- Modify: `app/settings/notifications.tsx`
- Modify: `app/settings/about.tsx`
- Modify: `app/settings/language.tsx`
- Modify: `app/settings/privacy.tsx`
- Modify: `app/settings/terms.tsx`

After reading in Task 6, add `useTranslation` to each file and replace strings.

**`app/settings/notifications.tsx`:**

| Hardcoded | Key |
|---|---|
| `'Notifications'` | `t('settings.notifications')` |
| `'Activer les notifications'` | `t('settings.notificationsScreen.enable')` |
| `'Heures silencieuses'` | `t('settings.notificationsScreen.quietHours')` |
| `'Aucune notification...'` | `t('settings.notificationsScreen.quietDescription')` |
| `'Début'` | `t('settings.notificationsScreen.start')` |
| `'Fin'` | `t('settings.notificationsScreen.end')` |
| `'Terminer'` (iOS picker) | `t('common.done')` |

**`app/settings/about.tsx`:**

| Hardcoded | Key |
|---|---|
| `'Gérez vos médicaments simplement.'` | `t('settings.aboutScreen.tagline')` |
| `'Développeur'` | `t('settings.aboutScreen.developer')` |
| `'MedicalIT'` | `'MedicalIT'` (keep literal — it's a proper name) |
| `'Plateforme'` | `t('settings.aboutScreen.platform')` |
| `'iOS & Android'` | `t('settings.aboutScreen.platformValue')` |
| `'Base de données'` | `t('settings.aboutScreen.database')` |
| `'SQLite local'` | `t('settings.aboutScreen.databaseValue')` |
| `'Données partagées'` | `t('settings.aboutScreen.sharedData')` |
| `'Aucune'` | `t('settings.aboutScreen.sharedDataValue')` |
| `'Version'` | `t('settings.version')` |

**`app/settings/language.tsx`:**

| Hardcoded | Key |
|---|---|
| `'Redémarrage requis'` (Alert title) | `t('settings.restart.title')` |
| `'Veuillez redémarrer...'` (Alert body) | `t('settings.restart.body')` |
| `'OK'` (Alert button) | `'OK'` (keep literal — standard system string) |

**`app/settings/privacy.tsx`:**

Replace the hardcoded privacy body string with `t('settings.privacyBody')`.

**`app/settings/terms.tsx`:**

| Hardcoded | Key |
|---|---|
| `'En utilisant MediTrack...'` | `t('settings.termsScreen.intro')` |
| `'1. Usage'` | `t('settings.termsScreen.section1Title')` |
| Body of section 1 | `t('settings.termsScreen.section1Body')` |
| `'2. Responsabilité'` | `t('settings.termsScreen.section2Title')` |
| Body of section 2 | `t('settings.termsScreen.section2Body')` |
| `'3. Données'` | `t('settings.termsScreen.section3Title')` |
| Body of section 3 | `t('settings.termsScreen.section3Body')` |
| `'4. Modifications'` | `t('settings.termsScreen.section4Title')` |
| Body of section 4 | `t('settings.termsScreen.section4Body')` |

---

## Task 12: Translate `app/export.tsx`

**Files:**
- Modify: `app/export.tsx`

After reading in Task 6, add `useTranslation` and replace strings:

| Hardcoded | Key |
|---|---|
| `'Exporter les données'` | `t('export.title')` |
| `'Période'` | `t('export.period')` |
| `'7 derniers jours'` | `t('export.last7')` |
| `'30 derniers jours'` | `t('export.last30')` |
| `'90 derniers jours'` | `t('export.last90')` |
| `'Personnalisé'` | `t('export.custom')` |
| `'Du'` | `t('export.from')` |
| `'Au'` | `t('export.to')` |
| `'Du {date} au {date} · {count} enregistrements'` | `t('export.summary', { from, to, count })` |
| `'...'` loading indicator | `t('common.loading')` |
| `'⬇ Export CSV'` | `t('export.csv')` |
| `'⬇ Export PDF'` | `t('export.pdf')` |
| `'Génération en cours…'` | `t('export.generating')` |
| `'Terminer'` | `t('common.done')` |

---

## Task 13: Translate `components/medication/MedForm.tsx`

**Files:**
- Modify: `components/medication/MedForm.tsx`

This is the most complex component. Add `useTranslation` inside `MedForm` function body.

- [ ] **Step 1: Add import and update static constants that need translation**

The `TYPE_LABELS` record and `UNIT_PRESETS` array are currently hardcoded. Move them inside the component so `t()` can be called:

```tsx
// Inside MedForm function body, after const { t } = useTranslation():
const TYPE_LABELS: Record<MedicationType, string> = {
  pill:       t('medication.types.pill'),
  syrup:      t('medication.types.syrup'),
  injection:  t('medication.types.injection'),
  supplement: t('medication.types.supplement'),
  other:      t('medication.types.other'),
};

const UNIT_PRESETS = [
  t('medication.units.mg'),       // 'mg'
  t('medication.units.g'),        // 'g'
  t('medication.units.ml'),       // 'ml'
  t('medication.units.mcg'),      // 'mcg'
  t('medication.units.tablet'),
  t('medication.units.capsule'),
  t('medication.units.drop'),
  t('medication.units.dose'),
];
```

- [ ] **Step 2: Replace all hardcoded strings in the JSX**

```tsx
// Step label:
<Text style={styles.stepLabel}>{t('medication.form.step')} {step} {t('medication.form.of')} {totalSteps}</Text>

// Name field:
<Text style={styles.label}>{t('medication.form.nameLabel')}</Text>
placeholder={t('medication.form.namePlaceholder')}

// Dose field:
<Text style={styles.label}>{t('medication.form.doseLabel')}</Text>

// Form (type) section:
<Text style={styles.label}>{t('medication.form.typeLabel')}</Text>

// Color:
<Text style={styles.label}>{t('medication.form.colorLabel')}</Text>

// Notes:
<Text style={styles.label}>{t('medication.form.notesLabel')}</Text>
placeholder={t('medication.form.notesPlaceholder')}

// Step 2 planning title:
<Text style={styles.sectionTitle}>{t('medication.form.schedulingLabel')}</Text>

// Step 3 start date:
<Text style={styles.label}>{t('medication.schedule.start')}</Text>

// Ongoing toggle:
<Text style={styles.label}>{t('medication.form.indefinite')}</Text>

// End date:
<Text style={styles.label}>{t('medication.schedule.end')}</Text>
// placeholder when no endDate:
{endDate ? format(endDate, 'dd/MM/yyyy') : t('profile.form.dobPlaceholder')}

// iOS picker done button:
<Text style={styles.pickerDone}>{t('common.done')}</Text>

// Step 4 summary title:
<Text style={styles.sectionTitle}>{t('medication.form.summaryLabel')}</Text>

// ReviewRow labels:
<ReviewRow label={t('profile.form.nameLabel').replace(' *','')} value={name} />
<ReviewRow label={t('medication.form.doseLabel').replace(' *','')} value={`${doseQuantity} ${unit}`} />
<ReviewRow label={t('medication.form.typeLabel')} value={TYPE_LABELS[type]} />
<ReviewRow label={t('medication.detail.frequency')} value={
  schedule.frequency === 'daily'    ? t('medication.freq.daily') :
  schedule.frequency === 'weekly'   ? t('medication.freq.weekly') :
  schedule.frequency === 'interval' ? `${t('medication.freq.everyN')} ${schedule.intervalDays ?? 1} ${t('medication.freq.days')}` :
  t('medication.freq.customLabel')
} />
<ReviewRow label={t('medication.schedule.times')} value={schedule.times.join(', ')} />
<ReviewRow label={t('medication.schedule.start')} value={format(startDate, 'dd/MM/yyyy')} />
<ReviewRow label={t('medication.schedule.end')} value={ongoing ? t('medication.schedule.indefinite') : (endDate ? format(endDate, 'dd/MM/yyyy') : '—')} />

// Navigation buttons:
// Cancel button (step 1):
<Button label={t('common.cancel')} variant="ghost" onPress={onCancel} style={styles.navBtn} />
// Back button (step > 1):
<Button label={t('medication.form.previous')} variant="secondary" onPress={() => setStep((s) => s - 1)} style={styles.navBtn} />
// Next button:
<Button label={t('medication.form.next')} onPress={goNext} style={styles.navBtn} />
// Confirm button:
<Button label={t('common.confirm')} onPress={handleSubmit} style={styles.navBtn} />
```

- [ ] **Step 3: Replace hardcoded error strings in validation functions**

```tsx
function validateStep1(): boolean {
  const errs: Record<string, string> = {};
  if (!name.trim()) errs.name = t('medication.form.nameRequired');
  else if (name.trim().length > 80) errs.name = t('medication.form.nameMax');
  const qty = parseFloat(doseQuantity);
  if (!doseQuantity.trim() || isNaN(qty) || qty <= 0) errs.doseQuantity = t('medication.form.qtyInvalid');
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
```

---

## Task 14: Translate `components/medication/SchedulePicker.tsx` and `components/ui/LockScreen.tsx`

**Files:**
- Modify: `components/medication/SchedulePicker.tsx`
- Modify: `components/ui/LockScreen.tsx`

- [ ] **Step 1: Translate `SchedulePicker.tsx`**

Add `useTranslation` import and call inside the component. Move FREQ_LABELS and PATTERN_PRESETS inside the function:

```tsx
import { useTranslation } from 'react-i18next';

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const { t } = useTranslation();
  const freq = value.frequency;

  const FREQ_LABELS: Record<FrequencyType, string> = {
    daily:    t('medication.freq.daily'),
    weekly:   t('medication.freq.weekly'),
    interval: t('medication.freq.interval'),
    pattern:  t('medication.freq.custom'),
  };

  const PATTERN_PRESETS: { label: string; pattern: number[] }[] = [
    { label: t('scheduler.pattern.preset11'), pattern: [1, 0] },
    { label: t('scheduler.pattern.preset21'), pattern: [1, 1, 0] },
    { label: t('scheduler.pattern.preset52'), pattern: [1, 1, 1, 1, 1, 0, 0] },
    { label: t('scheduler.pattern.preset217'), pattern: Array(21).fill(1).concat(Array(7).fill(0)) },
  ];

  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
```

Replace the DAYS array usage with translated day labels:

```tsx
// Instead of const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
// Use inside the weekly section:
{DAY_KEYS.map((key, i) => {
  const active = value.daysOfWeek?.includes(i) ?? false;
  return (
    <TouchableOpacity
      key={i}
      onPress={() => toggleDay(i)}
      style={[styles.dayChip, active && styles.dayChipActive]}
    >
      <Text style={[styles.dayText, active && styles.dayTextActive]}>
        {t(`scheduler.days.${key}`)}
      </Text>
    </TouchableOpacity>
  );
})}
```

Replace interval labels:

```tsx
<Text style={styles.intervalLabel}>{t('scheduler.everyN')}</Text>
// ...
<Text style={styles.intervalLabel}>{t('scheduler.days_label')}</Text>
```

Replace pattern label:

```tsx
<Text style={styles.patternLabel}>{t('scheduler.pattern.label')}</Text>
```

- [ ] **Step 2: Translate `components/ui/LockScreen.tsx`**

Add `useTranslation` import and replace 3 hardcoded strings:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{t('common.appName')}</Text>
        <Text style={styles.subtitle}>{t('lock.subtitle')}</Text>
        <TouchableOpacity style={styles.btn} onPress={onUnlock}>
          <Ionicons name="finger-print-outline" size={22} color="#fff" />
          <Text style={styles.btnText}>{t('lock.unlock')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:  { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  content:  { alignItems: 'center', gap: Spacing.md },
  iconWrap: { width: 88, height: 88, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  title:    { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary },
  btn:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  btnText:  { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
```

---

## Task 15: Translate `app/(onboarding)/slide4.tsx`

**Files:**
- Modify: `app/(onboarding)/slide4.tsx`

After reading the file (it is a simple slide similar to slide1–3), add `useTranslation` and replace:

| Hardcoded | Key |
|---|---|
| `'Activez les rappels'` | `t('onboarding.slide4.title')` |
| `'Recevez une notification...'` | `t('onboarding.slide4.description')` |
| `'Activer'` or `'Activer les rappels'` (button) | `t('common.activate')` |

---

## Task 16: Final typecheck

**Files:** None — verification only.

- [ ] **Step 1: Run TypeScript typecheck**

```bash
cd D:\MedicalIT\meditrack && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Verify `npx expo start --clear` launches without bundler errors**

```bash
cd D:\MedicalIT\meditrack && npx expo start --clear
```

Expected: Bundle success, no red screens on launch.

- [ ] **Step 3: Manual verification checklist**

After launching in Expo Go or dev build:
1. Default language (FR): open app, verify all strings are in French
2. Go to Settings → Language → English: verify home screen, medications, history all show English
3. Go to Settings → Language → Arabic: verify strings appear in Arabic. (RTL layout requires app restart — this is expected and the app shows an Alert.)
4. Verify medication form steps 1–4 all show translated labels
5. Verify LockScreen shows translated text when biometric lock is enabled
