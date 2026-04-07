import 'content_models.dart';

class SiteContent {
  static const kpis = [
    KpiData(value: '2500+', label: 'Azolikdagi NNTlar'),
    KpiData(value: '14', label: 'Hududiy bolinma'),
    KpiData(value: '100+', label: 'Yillik tadbirlar'),
    KpiData(value: '2005', label: 'Tashkil etilgan yil'),
  ];

  static const homeNews = [
    CardData(
      title: 'NNT vakillari uchun malaka oshirish kurslari boshlandi',
      description: 'Hududlar kesimida loyiha boshqaruvi, hisobot va grant yozish boyicha treninglar otkazilmoqda.',
      badge: 'Elon',
    ),
    CardData(
      title: 'Jamoatchilik eshituvlari uchun yangi muloqot formati yoLga qoyildi',
      description: 'NNTlar, davlat organlari va ekspertlar ishtirokida mavzuli ochiq muhokamalar boshlanmoqda.',
      badge: 'Yangilik',
    ),
    CardData(
      title: 'Azolik arizalarini topshirish jarayoni toliq raqamlashtirildi',
      description: 'Ariza yuborish, hujjat yuklash va holatni kuzatish bosqichlari yagona platformada jamlandi.',
      badge: 'Platforma',
    ),
  ];

  static const aboutCards = [
    CardData(title: 'Tashkilot haqida', description: 'Tarix, missiya, strategik maqsad va asosiy yonalishlar.'),
    CardData(title: 'Rahbariyat', description: 'Kengash va ijro apparati boshqaruv darajalari.'),
    CardData(title: 'Bizning jamoa', description: 'Markaziy apparat va hududiy bolinmalar tarkibi (siz toldirasiz).'),
    CardData(title: 'Azolikdagi NNTlar', description: 'Assotsiatsiyaga azo bolgan tashkilotlar royxati (siz toldirasiz).'),
  ];

  static const newsCards = [
    CardData(
      title: 'Ijtimoiy sheriklik forumi yakunlari elon qilindi',
      description: 'Forum doirasida NNTlar va davlat idoralari ortasidagi hamkorlik uchun ustuvor yonalishlar belgilandi.',
      badge: 'Forum',
    ),
    CardData(
      title: 'NNTlar uchun huquqiy amaliy qollanma taqdim etildi',
      description: 'Tashkilotlarni royxatdan otkazish, hisobot va monitoring jarayonlari boyicha yangi metodik material chop etildi.',
      badge: 'Hujjat',
    ),
    CardData(
      title: 'Hududiy boLimlarda ochiq eshiklar kuni otkazildi',
      description: 'NNT vakillari uchun konsultatsiya, hujjat ekspertizasi va loyiha boicha amaliy yordam korsatildi.',
      badge: 'Hudud',
    ),
  ];

  static const eventCards = [
    CardData(
      title: 'Toshkent: Grant loyihasi yozish amaliy seminari',
      description: '24-aprel, 10:00 - 13:00, OZNNTMA markaziy ofisi',
      badge: 'Royxatdan otish ochiq',
    ),
    CardData(
      title: 'Samarqand: Ijtimoiy loyiha boshqaruvi treningi',
      description: '30-aprel, 14:00 - 17:00, Hududiy bolinma ofisi',
      badge: 'Rejalashtirilgan',
    ),
    CardData(
      title: 'Andijon: Jamoatchilik nazorati boyicha ochiq muloqot',
      description: '6-may, 11:00 - 13:30, NNTlar uyi',
      badge: 'Taklifnoma',
    ),
  ];

  static const serviceCards = [
    CardData(title: 'Rasmiy hujjatlar', description: 'Meyoriy hujjatlar, qarorlar va namunaviy shakllar kutubxonasi.'),
    CardData(title: 'Hisobot shakllari', description: 'Yillik va choraklik hisobot blankalari hamda topshirish tartibi.'),
    CardData(title: 'Savol-javob', description: 'Eng kop beriladigan savollarga tezkor amaliy javoblar.'),
    CardData(title: 'Murojaat yuborish', description: 'Rasmiy onlayn murojaat yuborish, raqam olish va holatni kuzatish.'),
    CardData(title: 'Huquqiy konsultatsiya', description: 'NNT faoliyatiga doir huquqiy masalalar boyicha maslahat xizmati.'),
  ];
}
