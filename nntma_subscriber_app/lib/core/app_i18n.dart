import 'package:flutter/widgets.dart';

import 'app_language.dart';

class AppI18n {
  final AppLanguage language;
  const AppI18n(this.language);

  static AppI18n of(BuildContext context) => AppI18n(appLanguageController.value);

  static String current(String key) => AppI18n(appLanguageController.value).t(key);

  String t(String key) {
    return _dict[language]?[key] ?? _dict[AppLanguage.uzLatin]?[key] ?? key;
  }

  String pick({
    required String uzLatin,
    required String uzCyrillic,
    required String russian,
    required String english,
  }) {
    switch (language) {
      case AppLanguage.uzLatin:
        return uzLatin;
      case AppLanguage.uzCyrillic:
        return uzCyrillic;
      case AppLanguage.russian:
        return russian;
      case AppLanguage.english:
        return english;
    }
  }
}

extension AppI18nContext on BuildContext {
  AppI18n get i18n => AppI18n.of(this);
}

const Map<AppLanguage, Map<String, String>> _dict = {
  AppLanguage.uzLatin: {
    'app.name': 'ngo.uz',
    'lang.title': 'Til',
    'lang.menu': 'Til tanlash',
    'nav.home': 'Bosh sahifa',
    'nav.about': 'Biz haqimizda',
    'nav.news': 'Yangiliklar',
    'nav.services': 'Xizmatlar',
    'nav.contact': "Bog'lanish",
    'nav.cabinet': 'Kabinet',
    'nav.cabinet_app': 'Arizalar',
    'nav.cabinet_docs': 'Hujjatlar',
    'nav.cabinet_support': 'Yordam',
    'nav.cabinet_settings': 'Sozlamalar',
    'home.title': "O'zNNTMA rasmiy platformasi",
    'home.sub': "NNTlar uchun yangiliklar, tadbirlar, xizmatlar va hamkorlik imkoniyatlari bir joyda.",
    'about.title': 'Biz haqimizda',
    'about.sub': "O'zNNTMA fuqarolik jamiyati institutlari uchun milliy hamkorlik platformasi.",
    'news.title': 'Yangiliklar va tadbirlar',
    'news.sub': "So'nggi xabarlar, seminarlar va hududiy uchrashuvlar.",
    'services.title': 'Xizmatlar',
    'services.sub': "NNTlar uchun hujjatlar, hisobot, maslahat va murojaat xizmatlari.",
    'contact.title': "Bog'lanish",
    'contact.sub': "Murojaat, hamkorlik yoki savollar uchun biz bilan bog'laning.",
    'footer.quick_links': 'Tezkor havolalar',
    'footer.link.about': 'Biz haqimizda',
    'footer.link.news': 'Yangiliklar',
    'footer.link.events': 'Tadbirlarimiz',
    'footer.link.membership': "A'zo bo'lish",
    'footer.link.grants': 'Grant va tanlovlar',
    'footer.contact': "Bog'lanish",
    'footer.social': 'Ijtimoiy tarmoqlar',
    'footer.copy': "© COPYRIGHT 2019-2026 O'zNNTMA",
    'footer.address_label': 'Manzil:',
  },
  AppLanguage.uzCyrillic: {
    'app.name': 'ngo.uz',
    'lang.title': 'Тил',
    'lang.menu': 'Тил танлаш',
    'nav.home': 'Бош саҳифа',
    'nav.about': 'Биз ҳақимизда',
    'nav.news': 'Янгиликлар',
    'nav.services': 'Хизматлар',
    'nav.contact': 'Боғланиш',
    'nav.cabinet': 'Кабинет',
    'nav.cabinet_app': 'Аризалар',
    'nav.cabinet_docs': 'Ҳужжатлар',
    'nav.cabinet_support': 'Ёрдам',
    'nav.cabinet_settings': 'Созламалар',
    'home.title': 'ЎзННТМА расмий платформаси',
    'home.sub': 'ННТлар учун янгиликлар, тадбирлар, хизматлар ва ҳамкорлик имкониятлари бир жойда.',
    'about.title': 'Биз ҳақимизда',
    'about.sub': 'ЎзННТМА фуқаролик жамияти институтлари учун миллий ҳамкорлик платформаси.',
    'news.title': 'Янгиликлар ва тадбирлар',
    'news.sub': 'Сўнгги хабарлар, семинарлар ва ҳудудий учрашувлар.',
    'services.title': 'Хизматлар',
    'services.sub': 'ННТлар учун ҳужжатлар, ҳисобот, маслаҳат ва мурожаат хизматлари.',
    'contact.title': 'Боғланиш',
    'contact.sub': 'Мурожаат, ҳамкорлик ёки саволлар учун биз билан боғланинг.',
    'footer.quick_links': 'Тезкор ҳаволалар',
    'footer.link.about': 'Биз ҳақимизда',
    'footer.link.news': 'Янгиликлар',
    'footer.link.events': 'Тадбирларимиз',
    'footer.link.membership': "Аъзо бўлиш",
    'footer.link.grants': 'Грант ва танловлар',
    'footer.contact': 'Боғланиш',
    'footer.social': 'Ижтимоий тармоқлар',
    'footer.copy': "© COPYRIGHT 2019-2026 O'zNNTMA",
    'footer.address_label': 'Манзил:',
  },
  AppLanguage.russian: {
    'app.name': 'ngo.uz',
    'lang.title': 'Язык',
    'lang.menu': 'Выбор языка',
    'nav.home': 'Главная',
    'nav.about': 'О нас',
    'nav.news': 'Новости',
    'nav.services': 'Сервисы',
    'nav.contact': 'Контакты',
    'nav.cabinet': 'Кабинет',
    'nav.cabinet_app': 'Заявки',
    'nav.cabinet_docs': 'Документы',
    'nav.cabinet_support': 'Поддержка',
    'nav.cabinet_settings': 'Настройки',
    'home.title': 'Официальная платформа OʻzNNTMA',
    'home.sub': 'Новости, события, сервисы и возможности сотрудничества для ННО в одном месте.',
    'about.title': 'О нас',
    'about.sub': 'Национальная платформа сотрудничества для институтов гражданского общества.',
    'news.title': 'Новости и события',
    'news.sub': 'Последние новости, семинары и региональные встречи.',
    'services.title': 'Сервисы',
    'services.sub': 'Документы, отчетность, консультации и обращения для ННО.',
    'contact.title': 'Контакты',
    'contact.sub': 'Свяжитесь с нами по вопросам, партнерству и предложениям.',
    'footer.quick_links': 'Быстрые ссылки',
    'footer.link.about': 'О нас',
    'footer.link.news': 'Новости',
    'footer.link.events': 'События',
    'footer.link.membership': 'Членство',
    'footer.link.grants': 'Гранты и конкурсы',
    'footer.contact': 'Контакты',
    'footer.social': 'Социальные сети',
    'footer.copy': "© COPYRIGHT 2019-2026 O'zNNTMA",
    'footer.address_label': 'Адрес:',
  },
  AppLanguage.english: {
    'app.name': 'ngo.uz',
    'lang.title': 'Language',
    'lang.menu': 'Choose language',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.news': 'News',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.cabinet': 'Cabinet',
    'nav.cabinet_app': 'Applications',
    'nav.cabinet_docs': 'Documents',
    'nav.cabinet_support': 'Support',
    'nav.cabinet_settings': 'Settings',
    'home.title': 'Official OʻzNNTMA Platform',
    'home.sub': 'News, events, services and collaboration opportunities for NGOs in one place.',
    'about.title': 'About',
    'about.sub': 'A national cooperation platform for civil society institutions.',
    'news.title': 'News and Events',
    'news.sub': 'Latest updates, seminars and regional meetings.',
    'services.title': 'Services',
    'services.sub': 'Documents, reporting, consultation and request services for NGOs.',
    'contact.title': 'Contact',
    'contact.sub': 'Reach out for inquiries, partnerships, or feedback.',
    'footer.quick_links': 'Quick links',
    'footer.link.about': 'About',
    'footer.link.news': 'News',
    'footer.link.events': 'Events',
    'footer.link.membership': 'Membership',
    'footer.link.grants': 'Grants and tenders',
    'footer.contact': 'Contact',
    'footer.social': 'Social media',
    'footer.copy': "© COPYRIGHT 2019-2026 O'zNNTMA",
    'footer.address_label': 'Address:',
  },
};
