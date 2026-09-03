# i18n Full Translation Design — MediTrack

## Goal

Replace every hardcoded French string in the app with `t()` calls backed by complete `fr.json`, `en.json`, and `ar.json` translation files. The app must fully translate to the active language (FR/EN/AR) including RTL layout for Arabic.

## Architecture

i18next + react-i18next is already wired up in `i18n/index.ts`. The three locale JSON files live in `i18n/locales/`. Every screen and component calls `useTranslation()` and references keys via `t('namespace.key')`. No structural changes to routing or state — only string replacement.

## Tech Stack

- i18next ^26, react-i18next ^17
- Locale files: `i18n/locales/{fr,en,ar}.json`
- Hook: `useTranslation()` from react-i18next
- Existing config: `i18n/index.ts` (already sets fallbackLng, resources)

---

## Complete JSON Key Structure

All three files share identical key structure. Values differ by language.

```json
{
  "common": {
    "appName": "MediTrack",
    "continue": "",
    "skip": "",
    "save": "",
    "cancel": "",
    "delete": "",
    "edit": "",
    "back": "",
    "done": "",
    "loading": "",
    "error": "",
    "retry": "",
    "search": "",
    "add": "",
    "confirm": "",
    "close": "",
    "notFound": "",
    "required": "",
    "activate": "",
    "restart": ""
  },
  "onboarding": {
    "slide1": { "title": "", "description": "" },
    "slide2": { "title": "", "description": "" },
    "slide3": { "title": "", "description": "", "getStarted": "" },
    "slide4": { "title": "", "description": "" }
  },
  "tabs": {
    "home": "",
    "history": "",
    "add": "",
    "profile": "",
    "medications": "",
    "settings": ""
  },
  "home": {
    "title": "",
    "greeting": "{{name}}",
    "todayMeds": "",
    "noMeds": "",
    "noMedsDescription": "",
    "changeProfile": "",
    "manageProfiles": "",
    "stats": {
      "adherence": "",
      "today": "",
      "missed": ""
    },
    "buckets": {
      "morning": "",
      "afternoon": "",
      "evening": "",
      "night": ""
    }
  },
  "medications": {
    "title": "",
    "active": "",
    "paused": "",
    "empty": {
      "title": "",
      "description": ""
    }
  },
  "medication": {
    "types": {
      "pill": "",
      "syrup": "",
      "injection": "",
      "supplement": "",
      "other": ""
    },
    "freq": {
      "daily": "",
      "weekly": "",
      "interval": "",
      "custom": "",
      "everyN": "",
      "days": "",
      "customLabel": ""
    },
    "schedule": {
      "start": "",
      "end": "",
      "indefinite": "",
      "times": "",
      "upcoming": ""
    },
    "actions": {
      "pause": "",
      "resume": "",
      "delete": ""
    },
    "detail": {
      "title": "",
      "notFound": "",
      "frequency": "",
      "notes": ""
    },
    "form": {
      "step": "",
      "of": "",
      "nameLabel": "",
      "namePlaceholder": "",
      "nameRequired": "",
      "nameMax": "",
      "doseLabel": "",
      "qtyInvalid": "",
      "qtyMax": "",
      "unitRequired": "",
      "colorLabel": "",
      "notesLabel": "",
      "notesPlaceholder": "",
      "schedulingLabel": "",
      "summaryLabel": "",
      "endAfterStart": "",
      "next": "",
      "previous": ""
    },
    "units": {
      "mg": "mg",
      "g": "g",
      "ml": "ml",
      "mcg": "mcg",
      "tablet": "",
      "capsule": "",
      "drop": "",
      "dose": ""
    },
    "confirm": {
      "noteLabel": "",
      "taken": "",
      "snooze": "",
      "skip": "",
      "notFound": "",
      "snooze10": "",
      "snooze30": "",
      "snooze60": "",
      "snoozeTitle": ""
    },
    "scan": {
      "cameraRequired": "",
      "cameraDescription": "",
      "allowCamera": "",
      "addManually": "",
      "processing": "",
      "detected": "",
      "failed": "",
      "failedDescription": "",
      "noneDetected": "",
      "noneDescription": "",
      "alignGuide": "",
      "gallery": "",
      "approveAndAdd": "",
      "nameLabel": "",
      "dosageLabel": ""
    }
  },
  "profile": {
    "title": "",
    "new": "",
    "hint": "",
    "active": "",
    "medCount_one": "",
    "medCount_other": "",
    "noProfiles": "",
    "noProfilesDescription": "",
    "createFirst": "",
    "bornOn": "",
    "editTitle": "",
    "notFound": "",
    "dangerZone": "",
    "deleteProfile": "",
    "form": {
      "nameLabel": "",
      "namePlaceholder": "",
      "nameRequired": "",
      "dobLabel": "",
      "dobPlaceholder": "",
      "relationLabel": "",
      "relationPlaceholder": ""
    },
    "detail": {
      "medCount_one": "",
      "medCount_other": "",
      "saved_one": "",
      "saved_other": ""
    }
  },
  "settings": {
    "title": "",
    "language": "",
    "privacy": "",
    "terms": "",
    "about": "",
    "notifications": "",
    "version": "",
    "biometric": {
      "label": "",
      "description": ""
    },
    "restart": {
      "title": "",
      "body": ""
    },
    "notifications_screen": {
      "enable": "",
      "quietHours": "",
      "quietDescription": "",
      "start": "",
      "end": ""
    },
    "about_screen": {
      "tagline": "",
      "developer": "",
      "platform": "",
      "platformValue": "",
      "database": "",
      "databaseValue": "",
      "sharedData": "",
      "sharedDataValue": ""
    },
    "privacy_body": "",
    "terms": {
      "intro": "",
      "section1Title": "",
      "section1Body": "",
      "section2Title": "",
      "section2Body": "",
      "section3Title": "",
      "section3Body": "",
      "section4Title": "",
      "section4Body": ""
    }
  },
  "export": {
    "title": "",
    "period": "",
    "last7": "",
    "last30": "",
    "last90": "",
    "custom": "",
    "from": "",
    "to": "",
    "summary": "",
    "csv": "",
    "pdf": "",
    "generating": ""
  },
  "lock": {
    "subtitle": "",
    "unlock": ""
  },
  "scheduler": {
    "days": {
      "sun": "",
      "mon": "",
      "tue": "",
      "wed": "",
      "thu": "",
      "fri": "",
      "sat": ""
    },
    "pattern": {
      "label": "",
      "preset11": "",
      "preset21": "",
      "preset52": "",
      "preset217": ""
    }
  }
}
```

---

## Translation Values — French (fr.json)

```json
{
  "common": {
    "appName": "MediTrack", "continue": "Continuer", "skip": "Passer",
    "save": "Enregistrer", "cancel": "Annuler", "delete": "Supprimer",
    "edit": "Modifier", "back": "Retour", "done": "Terminer",
    "loading": "Chargement...", "error": "Une erreur est survenue",
    "retry": "Réessayer", "search": "Rechercher", "add": "Ajouter",
    "confirm": "Confirmer", "close": "Fermer", "notFound": "Introuvable",
    "required": "Requis", "activate": "Activer", "restart": "Redémarrer"
  },
  "onboarding": {
    "slide1": { "title": "Scannez votre ordonnance", "description": "Photographiez votre ordonnance et laissez MediTrack extraire automatiquement vos médicaments." },
    "slide2": { "title": "Ne manquez plus vos prises", "description": "Recevez des rappels personnalisés pour prendre vos médicaments au bon moment, chaque jour." },
    "slide3": { "title": "Gérez plusieurs profils en toute sécurité", "description": "Suivez les traitements de toute votre famille depuis une seule application. Vos données restent sur votre appareil.", "getStarted": "Commencer" },
    "slide4": { "title": "Activez les rappels", "description": "Recevez une notification à chaque heure de prise pour ne jamais manquer un médicament. Vous pouvez modifier cela à tout moment dans les Paramètres." }
  },
  "tabs": { "home": "Accueil", "history": "Historique", "add": "Ajouter", "profile": "Profil", "medications": "Médicaments", "settings": "Paramètres" },
  "home": {
    "title": "Accueil", "greeting": "Bonjour, {{name}} 👋", "todayMeds": "Médicaments du jour",
    "noMeds": "Aucun médicament prévu aujourd'hui", "noMedsDescription": "Ajoutez un médicament pour commencer le suivi.",
    "changeProfile": "Changer de profil ▾", "manageProfiles": "Gérer les profils",
    "stats": { "adherence": "Observance", "today": "Aujourd'hui", "missed": "Manqués" },
    "buckets": { "morning": "🌅 Matin", "afternoon": "☀️ Après-midi", "evening": "🌆 Soir", "night": "🌙 Nuit" }
  },
  "medications": {
    "title": "Médicaments", "active": "Actifs", "paused": "En pause",
    "empty": { "title": "Aucun médicament", "description": "Ajoutez votre premier médicament." }
  },
  "medication": {
    "types": { "pill": "Pilule", "syrup": "Sirop", "injection": "Injection", "supplement": "Supplément", "other": "Autre" },
    "freq": { "daily": "Quotidien", "weekly": "Hebdomadaire", "interval": "Intervalle", "custom": "Schéma", "everyN": "Toutes les", "days": "j", "customLabel": "Schéma personnalisé" },
    "schedule": { "start": "Début", "end": "Fin", "indefinite": "Indéfinie", "times": "Horaires", "upcoming": "Prochaines prises" },
    "actions": { "pause": "⏸ Mettre en pause", "resume": "▶ Reprendre", "delete": "Supprimer" },
    "detail": { "title": "Médicament", "notFound": "Ce médicament est introuvable.", "frequency": "Fréquence", "notes": "Notes" },
    "form": {
      "step": "Étape", "of": "/", "nameLabel": "Nom du médicament *", "namePlaceholder": "ex: Amoxicilline",
      "nameRequired": "Le nom est requis", "nameMax": "Max 80 caractères", "doseLabel": "Dose *",
      "qtyInvalid": "Quantité invalide (ex: 1, 2.5)", "qtyMax": "Maximum 999", "unitRequired": "Unité requise (ex: mg, comprimé)",
      "colorLabel": "Couleur (optionnel)", "notesLabel": "Notes (optionnel)", "notesPlaceholder": "Instructions particulières...",
      "schedulingLabel": "Planification", "summaryLabel": "Récapitulatif", "endAfterStart": "La date de fin doit être après la date de début",
      "next": "Suivant", "previous": "Retour"
    },
    "units": { "mg": "mg", "g": "g", "ml": "ml", "mcg": "mcg", "tablet": "comprimé(s)", "capsule": "gélule(s)", "drop": "goutte(s)", "dose": "dose(s)" },
    "confirm": {
      "noteLabel": "Note (optionnel)", "taken": "✓ Pris", "snooze": "⏱ Reporter", "skip": "→ Passer",
      "notFound": "Médicament introuvable", "snooze10": "10 min", "snooze30": "30 min", "snooze60": "1 heure",
      "snoozeTitle": "Reporter le rappel"
    },
    "scan": {
      "cameraRequired": "Caméra requise", "cameraDescription": "MediTrack a besoin d'accéder à votre caméra pour scanner les ordonnances.",
      "allowCamera": "Autoriser la caméra", "addManually": "Ajouter manuellement", "processing": "Analyse en cours...",
      "detected": "Médicaments détectés", "failed": "Analyse échouée", "failedDescription": "Erreur lors de l'analyse.",
      "noneDetected": "Aucun médicament détecté", "noneDescription": "L'image n'a pas permis d'extraire des médicaments. Essayez une meilleure prise de vue ou ajoutez manuellement.",
      "alignGuide": "Alignez l'ordonnance dans le cadre", "gallery": "Galerie",
      "approveAndAdd": "Approuver et ajouter ({{count}})", "nameLabel": "Nom", "dosageLabel": "Dosage"
    }
  },
  "profile": {
    "title": "Profils", "new": "Nouveau", "hint": "Appuyez sur un profil pour le sélectionner.", "active": "Actif",
    "medCount_one": "{{count}} médicament", "medCount_other": "{{count}} médicaments",
    "noProfiles": "Aucun profil créé", "noProfilesDescription": "Créez un profil pour commencer à gérer les médicaments.",
    "createFirst": "Créer mon premier profil", "bornOn": "Né(e) le",
    "editTitle": "Modifier le profil", "notFound": "Ce profil est introuvable.",
    "dangerZone": "Zone de danger", "deleteProfile": "Supprimer ce profil",
    "form": {
      "nameLabel": "Nom *", "namePlaceholder": "ex: Ahmed", "nameRequired": "Le nom est requis.",
      "dobLabel": "Date de naissance", "dobPlaceholder": "JJ/MM/AAAA",
      "relationLabel": "Relation", "relationPlaceholder": "ex: Moi-même, Enfant..."
    },
    "detail": { "medCount_one": "{{count}} médicament", "medCount_other": "{{count}} médicaments", "saved_one": "enregistré", "saved_other": "enregistrés" }
  },
  "settings": {
    "title": "Paramètres", "language": "Langue", "privacy": "Politique de confidentialité",
    "terms": "Conditions d'utilisation", "about": "À propos", "notifications": "Notifications", "version": "Version",
    "biometric": { "label": "Verrou biométrique", "description": "Demande Face ID / empreinte à chaque ouverture." },
    "restart": { "title": "Redémarrage requis", "body": "Veuillez redémarrer l'application pour appliquer la nouvelle direction de mise en page." },
    "notifications_screen": {
      "enable": "Activer les notifications", "quietHours": "Heures silencieuses",
      "quietDescription": "Aucune notification ne sera envoyée pendant cette période.", "start": "Début", "end": "Fin"
    },
    "about_screen": {
      "tagline": "Gérez vos médicaments simplement.", "developer": "Développeur", "platform": "Plateforme",
      "platformValue": "iOS & Android", "database": "Base de données", "databaseValue": "SQLite local",
      "sharedData": "Données partagées", "sharedDataValue": "Aucune"
    },
    "privacy_body": "MediTrack stocke toutes vos données localement sur votre appareil. Aucune donnée personnelle n'est transmise à des serveurs externes. Vos informations médicales restent entièrement privées et sous votre contrôle.\n\nLes données suivantes sont stockées localement :\n• Profils patients (nom, date de naissance, relation)\n• Médicaments et plannings de prise\n• Historique des prises\n\nVous pouvez supprimer toutes vos données à tout moment en désinstallant l'application.",
    "terms_screen": {
      "intro": "En utilisant MediTrack, vous acceptez les conditions suivantes :",
      "section1Title": "1. Usage", "section1Body": "MediTrack est un outil d'aide à la gestion des médicaments. Il ne remplace pas l'avis d'un professionnel de santé.",
      "section2Title": "2. Responsabilité", "section2Body": "L'utilisateur est seul responsable de la saisie correcte des informations médicales et du respect des prescriptions de son médecin.",
      "section3Title": "3. Données", "section3Body": "Toutes les données sont stockées localement. L'éditeur n'a accès à aucune information personnelle ou médicale.",
      "section4Title": "4. Modifications", "section4Body": "Ces conditions peuvent être mises à jour. Les mises à jour seront communiquées via les notes de version de l'application."
    }
  },
  "export": {
    "title": "Exporter les données", "period": "Période", "last7": "7 derniers jours",
    "last30": "30 derniers jours", "last90": "90 derniers jours", "custom": "Personnalisé",
    "from": "Du", "to": "Au", "summary": "Du {{from}} au {{to}} · {{count}} enregistrements",
    "csv": "⬇ Export CSV", "pdf": "⬇ Export PDF", "generating": "Génération en cours…"
  },
  "lock": { "subtitle": "Protégé par biométrie", "unlock": "Déverrouiller" },
  "scheduler": {
    "days": { "sun": "D", "mon": "L", "tue": "M", "wed": "M", "thu": "J", "fri": "V", "sat": "S" },
    "pattern": { "label": "Schéma répétitif (1 = prise, 0 = pause)", "preset11": "1/1 (alternance)", "preset21": "2/1", "preset52": "5/2 (sem.)", "preset217": "21/7" }
  }
}
```

---

## Translation Values — English (en.json)

```json
{
  "common": {
    "appName": "MediTrack", "continue": "Continue", "skip": "Skip",
    "save": "Save", "cancel": "Cancel", "delete": "Delete",
    "edit": "Edit", "back": "Back", "done": "Done",
    "loading": "Loading...", "error": "An error occurred",
    "retry": "Retry", "search": "Search", "add": "Add",
    "confirm": "Confirm", "close": "Close", "notFound": "Not found",
    "required": "Required", "activate": "Activate", "restart": "Restart"
  },
  "onboarding": {
    "slide1": { "title": "Scan your prescription", "description": "Photograph your prescription and let MediTrack automatically extract your medications." },
    "slide2": { "title": "Never miss a dose", "description": "Receive personalised reminders to take your medications at the right time, every day." },
    "slide3": { "title": "Manage multiple profiles safely", "description": "Track treatments for your whole family from one app. Your data stays on your device.", "getStarted": "Get started" },
    "slide4": { "title": "Enable reminders", "description": "Receive a notification at each dose time so you never miss a medication. You can change this at any time in Settings." }
  },
  "tabs": { "home": "Home", "history": "History", "add": "Add", "profile": "Profile", "medications": "Medications", "settings": "Settings" },
  "home": {
    "title": "Home", "greeting": "Hello, {{name}} 👋", "todayMeds": "Today's medications",
    "noMeds": "No medications scheduled today", "noMedsDescription": "Add a medication to start tracking.",
    "changeProfile": "Switch profile ▾", "manageProfiles": "Manage profiles",
    "stats": { "adherence": "Adherence", "today": "Today", "missed": "Missed" },
    "buckets": { "morning": "🌅 Morning", "afternoon": "☀️ Afternoon", "evening": "🌆 Evening", "night": "🌙 Night" }
  },
  "medications": {
    "title": "Medications", "active": "Active", "paused": "Paused",
    "empty": { "title": "No medications", "description": "Add your first medication." }
  },
  "medication": {
    "types": { "pill": "Pill", "syrup": "Syrup", "injection": "Injection", "supplement": "Supplement", "other": "Other" },
    "freq": { "daily": "Daily", "weekly": "Weekly", "interval": "Interval", "custom": "Custom", "everyN": "Every", "days": "d", "customLabel": "Custom schedule" },
    "schedule": { "start": "Start", "end": "End", "indefinite": "Indefinite", "times": "Times", "upcoming": "Upcoming doses" },
    "actions": { "pause": "⏸ Pause", "resume": "▶ Resume", "delete": "Delete" },
    "detail": { "title": "Medication", "notFound": "This medication was not found.", "frequency": "Frequency", "notes": "Notes" },
    "form": {
      "step": "Step", "of": "/", "nameLabel": "Medication name *", "namePlaceholder": "e.g. Amoxicillin",
      "nameRequired": "Name is required", "nameMax": "Max 80 characters", "doseLabel": "Dose *",
      "qtyInvalid": "Invalid quantity (e.g. 1, 2.5)", "qtyMax": "Maximum 999", "unitRequired": "Unit required (e.g. mg, tablet)",
      "colorLabel": "Colour (optional)", "notesLabel": "Notes (optional)", "notesPlaceholder": "Special instructions...",
      "schedulingLabel": "Scheduling", "summaryLabel": "Summary", "endAfterStart": "End date must be after start date",
      "next": "Next", "previous": "Back"
    },
    "units": { "mg": "mg", "g": "g", "ml": "ml", "mcg": "mcg", "tablet": "tablet(s)", "capsule": "capsule(s)", "drop": "drop(s)", "dose": "dose(s)" },
    "confirm": {
      "noteLabel": "Note (optional)", "taken": "✓ Taken", "snooze": "⏱ Snooze", "skip": "→ Skip",
      "notFound": "Medication not found", "snooze10": "10 min", "snooze30": "30 min", "snooze60": "1 hour",
      "snoozeTitle": "Snooze reminder"
    },
    "scan": {
      "cameraRequired": "Camera required", "cameraDescription": "MediTrack needs access to your camera to scan prescriptions.",
      "allowCamera": "Allow camera", "addManually": "Add manually", "processing": "Analysing...",
      "detected": "Detected medications", "failed": "Analysis failed", "failedDescription": "Could not analyse the image.",
      "noneDetected": "No medications detected", "noneDescription": "The image could not extract any medications. Try a better shot or add manually.",
      "alignGuide": "Align the prescription within the frame", "gallery": "Gallery",
      "approveAndAdd": "Approve and add ({{count}})", "nameLabel": "Name", "dosageLabel": "Dosage"
    }
  },
  "profile": {
    "title": "Profiles", "new": "New", "hint": "Tap a profile to select it.", "active": "Active",
    "medCount_one": "{{count}} medication", "medCount_other": "{{count}} medications",
    "noProfiles": "No profiles yet", "noProfilesDescription": "Create a profile to start managing medications.",
    "createFirst": "Create my first profile", "bornOn": "Born on",
    "editTitle": "Edit profile", "notFound": "This profile was not found.",
    "dangerZone": "Danger zone", "deleteProfile": "Delete this profile",
    "form": {
      "nameLabel": "Name *", "namePlaceholder": "e.g. Ahmed", "nameRequired": "Name is required.",
      "dobLabel": "Date of birth", "dobPlaceholder": "DD/MM/YYYY",
      "relationLabel": "Relationship", "relationPlaceholder": "e.g. Myself, Child..."
    },
    "detail": { "medCount_one": "{{count}} medication", "medCount_other": "{{count}} medications", "saved_one": "saved", "saved_other": "saved" }
  },
  "settings": {
    "title": "Settings", "language": "Language", "privacy": "Privacy policy",
    "terms": "Terms of use", "about": "About", "notifications": "Notifications", "version": "Version",
    "biometric": { "label": "Biometric lock", "description": "Requires Face ID / fingerprint on every open." },
    "restart": { "title": "Restart required", "body": "Please restart the app to apply the new layout direction." },
    "notifications_screen": {
      "enable": "Enable notifications", "quietHours": "Quiet hours",
      "quietDescription": "No notifications will be sent during this period.", "start": "Start", "end": "End"
    },
    "about_screen": {
      "tagline": "Manage your medications simply.", "developer": "Developer", "platform": "Platform",
      "platformValue": "iOS & Android", "database": "Database", "databaseValue": "Local SQLite",
      "sharedData": "Shared data", "sharedDataValue": "None"
    },
    "privacy_body": "MediTrack stores all your data locally on your device. No personal data is transmitted to external servers. Your medical information remains entirely private and under your control.\n\nThe following data is stored locally:\n• Patient profiles (name, date of birth, relationship)\n• Medications and dosing schedules\n• Intake history\n\nYou can delete all your data at any time by uninstalling the app.",
    "terms_screen": {
      "intro": "By using MediTrack, you agree to the following terms:",
      "section1Title": "1. Use", "section1Body": "MediTrack is a medication management aid. It does not replace the advice of a healthcare professional.",
      "section2Title": "2. Responsibility", "section2Body": "The user is solely responsible for correctly entering medical information and following their doctor's prescriptions.",
      "section3Title": "3. Data", "section3Body": "All data is stored locally. The publisher has no access to any personal or medical information.",
      "section4Title": "4. Changes", "section4Body": "These terms may be updated. Updates will be communicated via the app's release notes."
    }
  },
  "export": {
    "title": "Export data", "period": "Period", "last7": "Last 7 days",
    "last30": "Last 30 days", "last90": "Last 90 days", "custom": "Custom",
    "from": "From", "to": "To", "summary": "From {{from}} to {{to}} · {{count}} records",
    "csv": "⬇ Export CSV", "pdf": "⬇ Export PDF", "generating": "Generating…"
  },
  "lock": { "subtitle": "Protected by biometrics", "unlock": "Unlock" },
  "scheduler": {
    "days": { "sun": "S", "mon": "M", "tue": "T", "wed": "W", "thu": "T", "fri": "F", "sat": "S" },
    "pattern": { "label": "Repeating pattern (1 = take, 0 = skip)", "preset11": "1/1 (alternate)", "preset21": "2/1", "preset52": "5/2 (week)", "preset217": "21/7" }
  }
}
```

---

## Translation Values — Arabic (ar.json)

```json
{
  "common": {
    "appName": "ميديتراك", "continue": "متابعة", "skip": "تخطي",
    "save": "حفظ", "cancel": "إلغاء", "delete": "حذف",
    "edit": "تعديل", "back": "رجوع", "done": "تم",
    "loading": "جارٍ التحميل...", "error": "حدث خطأ",
    "retry": "إعادة المحاولة", "search": "بحث", "add": "إضافة",
    "confirm": "تأكيد", "close": "إغلاق", "notFound": "غير موجود",
    "required": "مطلوب", "activate": "تفعيل", "restart": "إعادة التشغيل"
  },
  "onboarding": {
    "slide1": { "title": "امسح وصفتك الطبية", "description": "التقط صورة لوصفتك الطبية ودع ميديتراك يستخرج أدويتك تلقائيًا." },
    "slide2": { "title": "لا تفوّت أي جرعة", "description": "احصل على تذكيرات مخصصة لتناول أدويتك في الوقت المناسب كل يوم." },
    "slide3": { "title": "أدِر ملفات متعددة بأمان", "description": "تابع علاجات عائلتك بأكملها من تطبيق واحد. تبقى بياناتك على جهازك.", "getStarted": "ابدأ الآن" },
    "slide4": { "title": "فعّل التذكيرات", "description": "احصل على إشعار عند كل موعد جرعة حتى لا تفوتك أي دواء. يمكنك تغيير ذلك في أي وقت من الإعدادات." }
  },
  "tabs": { "home": "الرئيسية", "history": "السجل", "add": "إضافة", "profile": "الملف", "medications": "الأدوية", "settings": "الإعدادات" },
  "home": {
    "title": "الرئيسية", "greeting": "مرحبًا، {{name}} 👋", "todayMeds": "أدوية اليوم",
    "noMeds": "لا توجد أدوية مجدولة اليوم", "noMedsDescription": "أضف دواءً لبدء التتبع.",
    "changeProfile": "تغيير الملف ▾", "manageProfiles": "إدارة الملفات",
    "stats": { "adherence": "الالتزام", "today": "اليوم", "missed": "الفائتة" },
    "buckets": { "morning": "🌅 الصباح", "afternoon": "☀️ الظهر", "evening": "🌆 المساء", "night": "🌙 الليل" }
  },
  "medications": {
    "title": "الأدوية", "active": "نشطة", "paused": "موقوفة",
    "empty": { "title": "لا توجد أدوية", "description": "أضف دواءك الأول." }
  },
  "medication": {
    "types": { "pill": "حبة", "syrup": "شراب", "injection": "حقنة", "supplement": "مكمل غذائي", "other": "أخرى" },
    "freq": { "daily": "يومي", "weekly": "أسبوعي", "interval": "فترة", "custom": "مخصص", "everyN": "كل", "days": "ي", "customLabel": "جدول مخصص" },
    "schedule": { "start": "البداية", "end": "النهاية", "indefinite": "غير محدد", "times": "المواعيد", "upcoming": "الجرعات القادمة" },
    "actions": { "pause": "⏸ إيقاف مؤقت", "resume": "▶ استئناف", "delete": "حذف" },
    "detail": { "title": "الدواء", "notFound": "لم يتم العثور على هذا الدواء.", "frequency": "التكرار", "notes": "ملاحظات" },
    "form": {
      "step": "خطوة", "of": "/", "nameLabel": "اسم الدواء *", "namePlaceholder": "مثال: أموكسيسيلين",
      "nameRequired": "الاسم مطلوب", "nameMax": "الحد الأقصى 80 حرفًا", "doseLabel": "الجرعة *",
      "qtyInvalid": "كمية غير صالحة (مثال: 1، 2.5)", "qtyMax": "الحد الأقصى 999", "unitRequired": "الوحدة مطلوبة (مثال: ملغ، حبة)",
      "colorLabel": "اللون (اختياري)", "notesLabel": "ملاحظات (اختيارية)", "notesPlaceholder": "تعليمات خاصة...",
      "schedulingLabel": "الجدولة", "summaryLabel": "الملخص", "endAfterStart": "يجب أن يكون تاريخ الانتهاء بعد تاريخ البداية",
      "next": "التالي", "previous": "رجوع"
    },
    "units": { "mg": "ملغ", "g": "غ", "ml": "مل", "mcg": "ميكروغرام", "tablet": "حبة/حبات", "capsule": "كبسولة/كبسولات", "drop": "قطرة/قطرات", "dose": "جرعة/جرعات" },
    "confirm": {
      "noteLabel": "ملاحظة (اختيارية)", "taken": "✓ تم الأخذ", "snooze": "⏱ تأجيل", "skip": "→ تخطي",
      "notFound": "الدواء غير موجود", "snooze10": "10 دقائق", "snooze30": "30 دقيقة", "snooze60": "ساعة واحدة",
      "snoozeTitle": "تأجيل التذكير"
    },
    "scan": {
      "cameraRequired": "الكاميرا مطلوبة", "cameraDescription": "يحتاج ميديتراك إلى الوصول إلى كاميرتك لمسح الوصفات الطبية.",
      "allowCamera": "السماح بالكاميرا", "addManually": "إضافة يدويًا", "processing": "جارٍ التحليل...",
      "detected": "الأدوية المكتشفة", "failed": "فشل التحليل", "failedDescription": "تعذّر تحليل الصورة.",
      "noneDetected": "لم يتم اكتشاف أي أدوية", "noneDescription": "لم تتمكن الصورة من استخراج أي أدوية. جرّب التقاط صورة أوضح أو أضف يدويًا.",
      "alignGuide": "ضع الوصفة داخل الإطار", "gallery": "المعرض",
      "approveAndAdd": "موافقة وإضافة ({{count}})", "nameLabel": "الاسم", "dosageLabel": "الجرعة"
    }
  },
  "profile": {
    "title": "الملفات", "new": "جديد", "hint": "اضغط على ملف لتحديده.", "active": "نشط",
    "medCount_one": "{{count}} دواء", "medCount_other": "{{count}} أدوية",
    "noProfiles": "لا توجد ملفات", "noProfilesDescription": "أنشئ ملفًا لبدء إدارة الأدوية.",
    "createFirst": "إنشاء ملفي الأول", "bornOn": "تاريخ الميلاد",
    "editTitle": "تعديل الملف", "notFound": "لم يتم العثور على هذا الملف.",
    "dangerZone": "منطقة الخطر", "deleteProfile": "حذف هذا الملف",
    "form": {
      "nameLabel": "الاسم *", "namePlaceholder": "مثال: أحمد", "nameRequired": "الاسم مطلوب.",
      "dobLabel": "تاريخ الميلاد", "dobPlaceholder": "يي/شش/سسسس",
      "relationLabel": "العلاقة", "relationPlaceholder": "مثال: أنا، طفل..."
    },
    "detail": { "medCount_one": "{{count}} دواء", "medCount_other": "{{count}} أدوية", "saved_one": "مسجّل", "saved_other": "مسجّلة" }
  },
  "settings": {
    "title": "الإعدادات", "language": "اللغة", "privacy": "سياسة الخصوصية",
    "terms": "شروط الاستخدام", "about": "حول التطبيق", "notifications": "الإشعارات", "version": "الإصدار",
    "biometric": { "label": "القفل البيومتري", "description": "يطلب Face ID / بصمة الإصبع عند كل فتح." },
    "restart": { "title": "إعادة التشغيل مطلوبة", "body": "يرجى إعادة تشغيل التطبيق لتطبيق اتجاه التخطيط الجديد." },
    "notifications_screen": {
      "enable": "تفعيل الإشعارات", "quietHours": "ساعات الهدوء",
      "quietDescription": "لن يتم إرسال أي إشعارات خلال هذه الفترة.", "start": "البداية", "end": "النهاية"
    },
    "about_screen": {
      "tagline": "أدِر أدويتك ببساطة.", "developer": "المطوّر", "platform": "المنصة",
      "platformValue": "iOS وAndroid", "database": "قاعدة البيانات", "databaseValue": "SQLite محلي",
      "sharedData": "البيانات المشتركة", "sharedDataValue": "لا شيء"
    },
    "privacy_body": "يخزّن ميديتراك جميع بياناتك محليًا على جهازك. لا يتم إرسال أي بيانات شخصية إلى خوادم خارجية. تبقى معلوماتك الطبية خاصة تمامًا وتحت سيطرتك.\n\nيتم تخزين البيانات التالية محليًا:\n• ملفات المرضى (الاسم، تاريخ الميلاد، العلاقة)\n• الأدوية وجداول الجرعات\n• سجل تناول الأدوية\n\nيمكنك حذف جميع بياناتك في أي وقت بإلغاء تثبيت التطبيق.",
    "terms_screen": {
      "intro": "باستخدام ميديتراك، فإنك توافق على الشروط التالية:",
      "section1Title": "1. الاستخدام", "section1Body": "ميديتراك أداة مساعدة لإدارة الأدوية. لا يحل محل استشارة متخصص الرعاية الصحية.",
      "section2Title": "2. المسؤولية", "section2Body": "المستخدم وحده مسؤول عن إدخال المعلومات الطبية الصحيحة واتباع وصفات طبيبه.",
      "section3Title": "3. البيانات", "section3Body": "جميع البيانات مخزّنة محليًا. لا يملك الناشر إمكانية الوصول إلى أي معلومات شخصية أو طبية.",
      "section4Title": "4. التعديلات", "section4Body": "قد يتم تحديث هذه الشروط. سيتم إبلاغك بالتحديثات عبر ملاحظات إصدار التطبيق."
    }
  },
  "export": {
    "title": "تصدير البيانات", "period": "الفترة", "last7": "آخر 7 أيام",
    "last30": "آخر 30 يومًا", "last90": "آخر 90 يومًا", "custom": "مخصص",
    "from": "من", "to": "إلى", "summary": "من {{from}} إلى {{to}} · {{count}} سجل",
    "csv": "⬇ تصدير CSV", "pdf": "⬇ تصدير PDF", "generating": "جارٍ الإنشاء…"
  },
  "lock": { "subtitle": "محمي ببصمة", "unlock": "فتح القفل" },
  "scheduler": {
    "days": { "sun": "أح", "mon": "ن", "tue": "ث", "wed": "ر", "thu": "خ", "fri": "ج", "sat": "س" },
    "pattern": { "label": "نمط متكرر (1 = جرعة، 0 = راحة)", "preset11": "1/1 (تناوب)", "preset21": "2/1", "preset52": "5/2 (أسبوع)", "preset217": "21/7" }
  }
}
```

---

## Files to Update (20 files)

| File | Keys Used |
|------|-----------|
| `app/(onboarding)/slide4.tsx` | `onboarding.slide4.*`, `common.activate` |
| `app/(tabs)/index.tsx` | `home.*`, `tabs.home` |
| `app/(tabs)/medications.tsx` | `medications.*`, `medication.freq.*`, `medication.types.*` |
| `app/(tabs)/history.tsx` | `history.*`, `medication.confirm.taken`, `medication.confirm.skip` |
| `app/(tabs)/settings.tsx` | `settings.biometric.*`, `settings.*` |
| `app/(tabs)/add.tsx` | `home.manageProfiles`, `profile.noProfiles`, `profile.noProfilesDescription` |
| `app/medication/[id].tsx` | `medication.types.*`, `medication.freq.*`, `medication.schedule.*`, `medication.actions.*`, `medication.detail.*` |
| `app/medication/confirm.tsx` | `medication.confirm.*` |
| `app/medication/scan.tsx` | `medication.scan.*` |
| `app/profile/index.tsx` | `profile.*` |
| `app/profile/new.tsx` | `profile.form.*`, `common.*` |
| `app/profile/[id].tsx` | `profile.*`, `profile.detail.*`, `profile.form.*` |
| `app/settings/notifications.tsx` | `settings.notifications_screen.*` |
| `app/settings/about.tsx` | `settings.about_screen.*`, `settings.version` |
| `app/settings/language.tsx` | `settings.restart.*` |
| `app/settings/privacy.tsx` | `settings.privacy_body` |
| `app/settings/terms.tsx` | `settings.terms_screen.*` |
| `app/export.tsx` | `export.*` |
| `components/medication/MedForm.tsx` | `medication.form.*`, `medication.units.*`, `medication.types.*`, `medication.freq.*`, `medication.schedule.*`, `common.*` |
| `components/medication/SchedulePicker.tsx` | `medication.freq.*`, `scheduler.*` |
| `components/ui/LockScreen.tsx` | `lock.*`, `common.appName` |

## Pattern for Each File

```tsx
import { useTranslation } from 'react-i18next';

// Inside component:
const { t } = useTranslation();

// Usage:
<Text>{t('home.greeting', { name: profile.name })}</Text>
<Text>{t('medications.empty.title')}</Text>
```

For plurals (`medCount_one` / `medCount_other`):
```tsx
t('profile.medCount', { count: medications.length })
```

## Error Handling

- All keys have fallbacks in English via i18next `fallbackLng: 'en'` (already set in `i18n/index.ts`)
- No dynamic key construction — all keys are static strings passed to `t()`

## Testing

- Switch language in Settings → Language, verify strings change on every screen
- Switch to Arabic, verify RTL layout kicks in (already handled by existing `I18nManager.forceRTL` logic)
- No TypeScript changes needed — `t()` returns `string`
