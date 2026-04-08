import 'package:flutter/material.dart';

enum AppLanguage { uzLatin, uzCyrillic, russian, english }

extension AppLanguageX on AppLanguage {
  Locale get locale {
    switch (this) {
      case AppLanguage.uzLatin:
        return const Locale('uz', 'Latn');
      case AppLanguage.uzCyrillic:
        return const Locale('uz', 'Cyrl');
      case AppLanguage.russian:
        return const Locale('ru');
      case AppLanguage.english:
        return const Locale('en');
    }
  }

  String get label {
    switch (this) {
      case AppLanguage.uzLatin:
        return "O'zbek (Lotin)";
      case AppLanguage.uzCyrillic:
        return 'Ўзбек (Кирилл)';
      case AppLanguage.russian:
        return 'Русский';
      case AppLanguage.english:
        return 'English';
    }
  }
}

class AppLanguageController extends ValueNotifier<AppLanguage> {
  AppLanguageController() : super(AppLanguage.uzLatin);

  void setLanguage(AppLanguage lang) {
    if (value == lang) return;
    value = lang;
  }
}

final appLanguageController = AppLanguageController();
