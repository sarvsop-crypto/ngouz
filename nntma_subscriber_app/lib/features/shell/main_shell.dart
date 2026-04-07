import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../core/app_routes.dart';
import '../../core/app_tokens.dart';
import '../cabinet/pages/cabinet_applications_page.dart';
import '../cabinet/pages/cabinet_dashboard_page.dart';
import '../cabinet/pages/cabinet_documents_page.dart';
import '../cabinet/pages/cabinet_grants_page.dart';
import '../cabinet/pages/cabinet_settings_page.dart';
import '../cabinet/pages/cabinet_support_page.dart';
import '../pages/about_page.dart';
import '../pages/awards_page.dart';
import '../pages/contact_page.dart';
import '../pages/events_page.dart';
import '../pages/home_page.dart';
import '../pages/news_page.dart';
import '../pages/projects_page.dart';
import '../pages/services_page.dart';
import '../pages/website_extra_pages.dart';
import 'app_nav_item.dart';

class MainShell extends StatefulWidget {
  final String initialRoute;

  const MainShell({super.key, this.initialRoute = AppRoutes.home});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  static final pages = <AppNavItem>[
    AppNavItem(route: AppRoutes.home, title: 'Bosh sahifa', shortTitle: 'Bosh', icon: PhosphorIconsRegular.house, page: HomePage()),
    AppNavItem(route: AppRoutes.about, title: 'Biz haqimizda', shortTitle: 'About', icon: PhosphorIconsRegular.info, page: AboutPage()),
    AppNavItem(route: AppRoutes.projects, title: 'Loyihalar', shortTitle: 'Loyiha', icon: PhosphorIconsRegular.kanban, page: ProjectsPage()),
    AppNavItem(route: AppRoutes.news, title: 'Yangiliklar', shortTitle: 'Yangi', icon: PhosphorIconsRegular.newspaper, page: NewsPage()),
    AppNavItem(route: AppRoutes.events, title: 'Tadbirlar', shortTitle: 'Tadbir', icon: PhosphorIconsRegular.calendarDots, page: EventsPage()),
    AppNavItem(route: AppRoutes.services, title: 'Xizmatlar', shortTitle: 'Xizmat', icon: PhosphorIconsRegular.stack, page: ServicesPage()),
    AppNavItem(route: AppRoutes.awards, title: 'Mukofotlar', shortTitle: 'Award', icon: PhosphorIconsRegular.trophy, page: AwardsPage()),
    AppNavItem(route: AppRoutes.contact, title: 'Boglanish', shortTitle: 'Aloqa', icon: PhosphorIconsRegular.phoneCall, page: ContactPage()),
    ..._extraConfigs.map(
      (cfg) => AppNavItem(
        route: cfg.route,
        title: cfg.title,
        shortTitle: cfg.title.length > 8 ? cfg.title.substring(0, 8) : cfg.title,
        icon: PhosphorIconsRegular.fileText,
        page: WebsiteExtraPage(config: cfg),
      ),
    ),
    AppNavItem(route: AppRoutes.cabinetDashboard, title: 'Kabinet bosh sahifa', shortTitle: 'CabDash', icon: PhosphorIconsRegular.squaresFour, page: CabinetDashboardPage()),
    AppNavItem(route: AppRoutes.cabinetApplications, title: 'Kabinet arizalar', shortTitle: 'CabApp', icon: PhosphorIconsRegular.clipboardText, page: CabinetApplicationsPage()),
    AppNavItem(route: AppRoutes.cabinetDocuments, title: 'Kabinet hujjatlar', shortTitle: 'CabDoc', icon: PhosphorIconsRegular.folder, page: CabinetDocumentsPage()),
    AppNavItem(route: AppRoutes.cabinetGrants, title: 'Kabinet grantlar', shortTitle: 'CabGrant', icon: PhosphorIconsRegular.medal, page: CabinetGrantsPage()),
    AppNavItem(route: AppRoutes.cabinetSupport, title: 'Kabinet yordam', shortTitle: 'CabHelp', icon: PhosphorIconsRegular.lifebuoy, page: CabinetSupportPage()),
    AppNavItem(route: AppRoutes.cabinetSettings, title: 'Kabinet sozlamalar', shortTitle: 'CabSet', icon: PhosphorIconsRegular.gear, page: CabinetSettingsPage()),
  ];

  static const _extraConfigs = <ExtraPageConfig>[
    ExtraPageConfig(
      route: AppRoutes.whoWeAre,
      title: 'Tashkilot haqida',
      heroSub: 'NNTMAning maqsadi, vazifalari va asosiy faoliyat yo\'nalishlari.',
      cards: [
        ExtraCard(title: 'Missiya', description: 'Fuqarolik jamiyatini rivojlantirish va NNTlar salohiyatini oshirish.'),
        ExtraCard(title: 'Asosiy vazifa', description: 'NNTlar manfaatlarini himoya qilish va hamkorlik platformalarini yaratish.'),
        ExtraCard(title: 'Natija', description: 'Hududlar kesimida barqaror ijtimoiy tashabbuslarni kengaytirish.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.mission,
      title: 'Missiya',
      heroSub: 'Tashkilotning strategik vazifalari va qadriyatlari.',
      cards: [
        ExtraCard(title: 'Qadriyatlar', description: 'Shaffoflik, hamkorlik, mas\'uliyat va ochiqlik tamoyillari.'),
        ExtraCard(title: 'Ustuvor yo\'nalishlar', description: 'NNTlarni qo\'llab-quvvatlash, ta\'lim va ijtimoiy innovatsiyalar.'),
        ExtraCard(title: 'Uzoq muddatli maqsad', description: 'Kuchli fuqarolik jamiyati va barqaror rivojlanish.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.boardOfExperts,
      title: 'Ekspertlar kengashi',
      heroSub: 'Soha mutaxassislari va ekspertlar ishtirokidagi maslahat platformasi.',
      cards: [
        ExtraCard(title: 'Huquqiy ekspertiza', description: 'Normativ hujjatlar bo\'yicha takliflar tayyorlash.'),
        ExtraCard(title: 'Tahliliy ishlar', description: 'NNT sektori holati bo\'yicha tahlil va monitoring.'),
        ExtraCard(title: 'Jamoatchilik muloqoti', description: 'Muhokama va ochiq eshituvlarni tashkillashtirish.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.leadership,
      title: 'Rahbariyat',
      heroSub: 'Tashkilot boshqaruvi va mas\'ul rahbarlar haqida ma\'lumot.',
      cards: [
        ExtraCard(title: 'Kengash raisi', description: 'Strategik rivojlanish va institutsional hamkorlik.'),
        ExtraCard(title: 'Rais o\'rinbosarlari', description: 'Dasturlar ijrosi va hududiy faoliyat koordinatsiyasi.'),
        ExtraCard(title: 'Ijro apparati', description: 'Kundalik boshqaruv va loyiha amaliyoti.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.ourTeam,
      title: 'Bizning jamoa',
      heroSub: 'Markaziy apparat va hududiy bo\'linmalar jamoasi.',
      cards: [
        ExtraCard(title: 'Markaziy jamoa', description: 'Respublika darajasidagi boshqaruv va metodik qo\'llab-quvvatlash.'),
        ExtraCard(title: 'Hududiy bo\'linmalar', description: 'Viloyatlar kesimida NNTlar bilan bevosita ishlash.'),
        ExtraCard(title: 'Yordam liniyasi', description: 'A\'zolar va hamkorlar uchun maslahat va yo\'naltirish.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.nntSchool,
      title: 'NNTlar maktabi',
      heroSub: 'NNT rahbarlari va mutaxassislari uchun o\'quv platformasi.',
      cards: [
        ExtraCard(title: 'Malaka oshirish', description: 'Loyiha boshqaruvi, hisobot va grant yozish bo\'yicha kurslar.'),
        ExtraCard(title: 'Amaliy treninglar', description: 'Real keyslar asosida seminar va workshoplar.'),
        ExtraCard(title: 'Sertifikatlash', description: 'Kurslarni tugatgan ishtirokchilar uchun sertifikat dasturi.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.onlineLibrary,
      title: 'Onlayn kutubxona',
      heroSub: 'NNTlar uchun metodik materiallar va foydali manbalar.',
      cards: [
        ExtraCard(title: 'Qo\'llanmalar', description: 'Loyiha, boshqaruv va huquqiy mavzudagi qo\'llanmalar.'),
        ExtraCard(title: 'Shablonlar', description: 'Hujjat va hisobotlar uchun tayyor namunalar.'),
        ExtraCard(title: 'Arxiv', description: 'Oldingi yillar materiallari va resurslar bazasi.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.multimediaRoom,
      title: 'Multimedia xonasi',
      heroSub: 'Foto, video va media materiallar jamlanmasi.',
      cards: [
        ExtraCard(title: 'Foto albomlar', description: 'Tadbirlar va loyihalardan fotohisobotlar.'),
        ExtraCard(title: 'Video materiallar', description: 'Intervyu, seminar va taqdimot yozuvlari.'),
        ExtraCard(title: 'Media paket', description: 'Press-relizlar uchun media to\'plamlari.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.officialDocs,
      title: 'Rasmiy hujjatlar',
      heroSub: 'NNT faoliyatiga oid qonunlar, nizomlar va me\'yoriy hujjatlar.',
      cards: [
        ExtraCard(title: 'Normativ baza', description: 'Qonun, qaror va farmonlarning aktual to\'plami.'),
        ExtraCard(title: 'Ichki reglamentlar', description: 'Tashkilot ichki tartib-qoidalari va standartlar.'),
        ExtraCard(title: 'Yuklab olish', description: 'Rasmiy hujjatlarning PDF/Doc formatlari.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.reportingForms,
      title: 'Hisobot shakllari',
      heroSub: 'Yillik va choraklik hisobot topshirish uchun shakllar.',
      cards: [
        ExtraCard(title: 'Yillik shakl', description: 'NNT faoliyati bo\'yicha yillik standart hisobot formasi.'),
        ExtraCard(title: 'Choraklik shakl', description: 'Qisqa davr monitoringi va indikatorlar to\'plami.'),
        ExtraCard(title: 'Topshirish yo\'riqnomasi', description: 'To\'ldirish tartibi va muddatlar bo\'yicha yo\'riqnoma.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.faq,
      title: 'Savol-javob',
      heroSub: 'Eng ko\'p so\'raladigan savollar va amaliy javoblar.',
      cards: [
        ExtraCard(title: 'A\'zolik', description: 'A\'zo bo\'lish jarayoni bo\'yicha asosiy savollar.'),
        ExtraCard(title: 'Hisobot', description: 'Hisobot topshirishdagi keng tarqalgan masalalar.'),
        ExtraCard(title: 'Hujjatlar', description: 'Talab etiladigan hujjatlar ro\'yxati va talablari.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.membership,
      title: 'A\'zo bo\'lish',
      heroSub: 'NNTMAga a\'zolik uchun ariza topshirish va bosqichlar.',
      cards: [
        ExtraCard(title: 'Boshlash', description: 'Ariza to\'ldirish va boshlang\'ich ma\'lumotlar.'),
        ExtraCard(title: 'Tekshiruv', description: 'Hujjatlar ekspertizasi va qo\'shimcha so\'rovlar.'),
        ExtraCard(title: 'Tasdiqlash', description: 'Yakuniy qaror va a\'zolikni rasmiylashtirish.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.membershipGuide,
      title: 'A\'zolik yo\'riqnomasi',
      heroSub: 'A\'zolik jarayonining to\'liq qadamlari.',
      cards: [
        ExtraCard(title: '1-qadam', description: 'Tashkilot ma\'lumotlarini kiritish va arizani yuborish.'),
        ExtraCard(title: '2-qadam', description: 'Hujjatlar to\'plamini yuklash va tekshiruvdan o\'tish.'),
        ExtraCard(title: '3-qadam', description: 'A\'zolik shartlari va tasdiqlash bosqichi.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.membershipStatus,
      title: 'A\'zolik holati',
      heroSub: 'Yuborilgan arizaning joriy holati va status bosqichlari.',
      cards: [
        ExtraCard(title: 'Qabul qilindi', description: 'Ariza tizimga muvaffaqiyatli kiritilgan.'),
        ExtraCard(title: 'Ko\'rib chiqilmoqda', description: 'Mutaxassislar tomonidan ekspertiza bosqichi.'),
        ExtraCard(title: 'Yakunlandi', description: 'Tasdiqlangan yoki qayta ishlashga yuborilgan holat.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.membershipCertificate,
      title: 'A\'zolik sertifikati',
      heroSub: 'Tasdiqlangan a\'zolar uchun sertifikat ma\'lumotlari.',
      cards: [
        ExtraCard(title: 'Sertifikat rekvizitlari', description: 'Raqam, sana, amal qilish muddati.'),
        ExtraCard(title: 'Yuklab olish', description: 'Sertifikatni PDF formatida olish imkoniyati.'),
        ExtraCard(title: 'Tekshirish', description: 'Sertifikat haqiqiyligini tekshirish mexanizmi.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.grants,
      title: 'Grantlar',
      heroSub: 'Faol va yakunlangan grant dasturlari hamda tanlovlar.',
      cards: [
        ExtraCard(title: 'Faol tanlovlar', description: 'Ariza topshirish muddati ochiq grantlar.'),
        ExtraCard(title: 'Yakunlangan grantlar', description: 'Arxivlangan tanlov va natijalar.'),
        ExtraCard(title: 'Talablar', description: 'Ishtirok shartlari va zarur hujjatlar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.publications,
      title: 'Publikatsiyalar',
      heroSub: 'Tahliliy maqolalar, hisobotlar va metodik materiallar.',
      cards: [
        ExtraCard(title: 'Tahlillar', description: 'Sohaviy tahliliy maqolalar to\'plami.'),
        ExtraCard(title: 'Nashrlar', description: 'Rasmiy hisobot va nashr etilgan materiallar.'),
        ExtraCard(title: 'Qidiruv', description: 'Mavzu, sana va teglar bo\'yicha filtrlangan qidiruv.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.publicationDetail,
      title: 'Publikatsiya tafsiloti',
      heroSub: 'Tanlangan publikatsiya bo\'yicha to\'liq ma\'lumot.',
      cards: [
        ExtraCard(title: 'Asosiy mazmun', description: 'Maqola yoki hisobotning to\'liq matni.'),
        ExtraCard(title: 'Muallif va sana', description: 'Nashr muallifi, manba va chop etilgan vaqt.'),
        ExtraCard(title: 'Bog\'liq materiallar', description: 'O\'xshash mavzudagi qo\'shimcha manbalar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.newsDetail,
      title: 'Yangilik tafsiloti',
      heroSub: 'Tanlangan yangilik bo\'yicha batafsil kontent.',
      cards: [
        ExtraCard(title: 'Yangilik matni', description: 'To\'liq matn, asosiy faktlar va izohlar.'),
        ExtraCard(title: 'Meta ma\'lumot', description: 'Sana, kategoriya va muallif ma\'lumotlari.'),
        ExtraCard(title: 'Tegishli yangiliklar', description: 'Shu mavzuga oid boshqa yangiliklar ro\'yxati.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.videos,
      title: 'Videolar',
      heroSub: 'Media markazdagi barcha video materiallar.',
      cards: [
        ExtraCard(title: 'Tadbir videolari', description: 'Seminar va forumlardan video yozuvlar.'),
        ExtraCard(title: 'Intervyular', description: 'Ekspert va hamkorlar bilan suhbatlar.'),
        ExtraCard(title: 'Arxiv', description: 'Oldingi yillardagi video materiallar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.videoDetail,
      title: 'Video tafsiloti',
      heroSub: 'Tanlangan video bo\'yicha to\'liq ma\'lumot.',
      cards: [
        ExtraCard(title: 'Video haqida', description: 'Mavzu, davomiylik va asosiy mazmun.'),
        ExtraCard(title: 'Teglar', description: 'Kategoriya va qidiruv uchun teglar to\'plami.'),
        ExtraCard(title: 'Bog\'liq videolar', description: 'Shu mavzu bo\'yicha boshqa videolar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.eventDetail,
      title: 'Tadbir tafsiloti',
      heroSub: 'Tanlangan tadbir haqida to\'liq ma\'lumot.',
      cards: [
        ExtraCard(title: 'Dastur', description: 'Tadbir kun tartibi va sessiyalar ro\'yxati.'),
        ExtraCard(title: 'Ishtirok', description: 'Ro\'yxatdan o\'tish talablari va vaqtlar.'),
        ExtraCard(title: 'Manzil', description: 'Lokatsiya va aloqa ma\'lumotlari.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.serviceRequest,
      title: 'Murojaat yuborish',
      heroSub: 'Onlayn murojaat qoldirish va ijrochini kuzatish.',
      cards: [
        ExtraCard(title: 'Murojaat formasi', description: 'Mavzu, tafsilot va ilovalarni kiritish formasi.'),
        ExtraCard(title: 'Yuborish', description: 'Murojaatni tizimga yuborish va raqam olish.'),
        ExtraCard(title: 'Monitoring', description: 'Ko\'rib chiqish jarayonini bosqichma-bosqich kuzatish.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.serviceRequestStatus,
      title: 'Murojaat holati',
      heroSub: 'Yuborilgan murojaatning joriy ko\'rib chiqish holati.',
      cards: [
        ExtraCard(title: 'Qabul', description: 'Murojaat ro\'yxatga olingan holat.'),
        ExtraCard(title: 'Ijro', description: 'Mas\'ul ijrochi tomonidan ko\'rib chiqish bosqichi.'),
        ExtraCard(title: 'Yakun', description: 'Javob yuborilgan yoki qo\'shimcha ma\'lumot so\'ralgan holat.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.reportStatus,
      title: 'Hisobot holati',
      heroSub: 'Topshirilgan hisobotlarning tekshiruv va qabul statusi.',
      cards: [
        ExtraCard(title: 'Topshirildi', description: 'Hisobot tizimga yuklangan.'),
        ExtraCard(title: 'Tekshiruvda', description: 'Mutaxassis tomonidan ekspertiza olib borilmoqda.'),
        ExtraCard(title: 'Qabul/Izoh', description: 'Yakuniy qaror yoki qayta ishlash izohlari.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.researchAreas,
      title: 'Tadqiqot yo\'nalishlari',
      heroSub: 'NNT sektori uchun ustuvor tadqiqot yo\'nalishlari.',
      cards: [
        ExtraCard(title: 'Ijtimoiy soha', description: 'Ta\'lim, sog\'liqni saqlash va ijtimoiy himoya yo\'nalishlari.'),
        ExtraCard(title: 'Huquqiy islohotlar', description: 'Fuqarolik jamiyati uchun me\'yoriy bazani takomillashtirish.'),
        ExtraCard(title: 'Raqamli transformatsiya', description: 'Elektron platformalar va raqamli xizmatlar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.searchResults,
      title: 'Qidiruv natijalari',
      heroSub: 'Sayt bo\'yicha qidiruvdan topilgan mos materiallar.',
      cards: [
        ExtraCard(title: 'Filtrlar', description: 'Sana, bo\'lim va kontent turi bo\'yicha saralash.'),
        ExtraCard(title: 'Natijalar ro\'yxati', description: 'Mos sahifalar, maqolalar va tadbirlar chiqishi.'),
        ExtraCard(title: 'Tavsiya', description: 'Qidiruvni aniqlashtirish bo\'yicha tezkor tavsiyalar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.socialOrders,
      title: 'Ijtimoiy buyurtmalar',
      heroSub: 'Davlat ijtimoiy buyurtmalari va tegishli tashabbuslar.',
      cards: [
        ExtraCard(title: 'Faol buyurtmalar', description: 'Qabul qilinayotgan tanlov va ijtimoiy buyurtmalar.'),
        ExtraCard(title: 'Shartlar', description: 'Ishtirok mezonlari va hujjatlar talabi.'),
        ExtraCard(title: 'Natijalar', description: 'Yakunlangan buyurtmalar bo\'yicha qarorlar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.structure,
      title: 'Tuzilma',
      heroSub: 'Tashkilotning boshqaruv va ijro tuzilmasi.',
      cards: [
        ExtraCard(title: 'Boshqaruv darajasi', description: 'Kengash va rahbariyat tarkibi.'),
        ExtraCard(title: 'Ijro apparati', description: 'Bo\'limlar va funksional yo\'nalishlar.'),
        ExtraCard(title: 'Hududiy tarmoq', description: 'Viloyat bo\'linmalari va koordinatsiya modeli.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.sustainabilityIndex,
      title: 'Barqarorlik indeksi',
      heroSub: 'Loyihalar va tashkilotlar barqarorligini baholash indikatori.',
      cards: [
        ExtraCard(title: 'Indikatorlar', description: 'Moliyaviy, institutsional va ijtimoiy ko\'rsatkichlar.'),
        ExtraCard(title: 'Baholash davri', description: 'Oylik, choraklik va yillik monitoring kesimlari.'),
        ExtraCard(title: 'Hisobotlar', description: 'Barqarorlik natijalari bo\'yicha tahliliy kesimlar.'),
      ],
    ),
    ExtraPageConfig(
      route: AppRoutes.sustainabilityCert,
      title: 'Barqarorlik sertifikati',
      heroSub: 'Baholashdan o\'tgan tashkilotlar uchun sertifikatlash bo\'limi.',
      cards: [
        ExtraCard(title: 'Sertifikat darajalari', description: 'Baholash ballari asosida daraja ajratish mezonlari.'),
        ExtraCard(title: 'Amal muddati', description: 'Sertifikatning amal qilish va yangilash tartibi.'),
        ExtraCard(title: 'Tekshirish', description: 'Sertifikat holatini onlayn tekshirish imkoniyati.'),
      ],
    ),
  ];

  late int _index;
  bool _menuOpen = false;

  @override
  void initState() {
    super.initState();
    _index = _routeToIndex(widget.initialRoute);
  }

  int _routeToIndex(String route) {
    final idx = pages.indexWhere((p) => p.route == route);
    return idx == -1 ? 0 : idx;
  }

  void _selectIndex(int i) {
    setState(() {
      _menuOpen = false;
      if (i != _index) {
        _index = i;
      }
    });

    final target = pages[i].route;
    final current = ModalRoute.of(context)?.settings.name;
    if (current != target) {
      Navigator.of(context).pushReplacementNamed(target);
    }
  }

  @override
  Widget build(BuildContext context) {
    final mobileNav = MediaQuery.sizeOf(context).width <= 900;

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            _BrandDot(),
            SizedBox(width: AppSpace.sm),
            Text('ngo.uz', style: TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        actions: mobileNav
            ? [
                IconButton(
                  onPressed: () => setState(() => _menuOpen = !_menuOpen),
                  icon: PhosphorIcon(_menuOpen ? PhosphorIconsRegular.x : PhosphorIconsRegular.list),
                  tooltip: 'Menu',
                ),
              ]
            : null,
        bottom: mobileNav
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(48),
                child: Container(
                  alignment: Alignment.centerLeft,
                  height: 48,
                  padding: const EdgeInsets.only(left: AppSpace.sm, right: AppSpace.sm, bottom: AppSpace.xs),
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: pages.length,
                    separatorBuilder: (_, index) => const SizedBox(width: AppSpace.xs),
                    itemBuilder: (context, i) {
                      final selected = i == _index;
                      final isCabinet = pages[i].route.startsWith('/cabinet');
                      return TextButton.icon(
                        onPressed: () => _selectIndex(i),
                        icon: PhosphorIcon(pages[i].icon, size: 16, color: selected ? Colors.white : AppTokens.textMuted),
                        label: Text(
                          isCabinet ? 'Kabinet - ${pages[i].shortTitle}' : pages[i].shortTitle,
                          style: TextStyle(color: selected ? Colors.white : AppTokens.textMuted, fontWeight: selected ? FontWeight.w700 : FontWeight.w500),
                        ),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
                          backgroundColor: selected ? AppTokens.primary : Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                      );
                    },
                  ),
                ),
              ),
      ),
      body: Stack(
        children: [
          pages[_index].page,
          if (mobileNav)
            _MobileOverlayMenu(
              open: _menuOpen,
              items: pages,
              activeIndex: _index,
              onClose: () => setState(() => _menuOpen = false),
              onSelect: _selectIndex,
            ),
        ],
      ),
    );
  }
}

class _MobileOverlayMenu extends StatelessWidget {
  final bool open;
  final List<AppNavItem> items;
  final int activeIndex;
  final VoidCallback onClose;
  final ValueChanged<int> onSelect;

  const _MobileOverlayMenu({
    required this.open,
    required this.items,
    required this.activeIndex,
    required this.onClose,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final panelWidth = width.clamp(280.0, 390.0) * 0.9;

    final siteItems = <int>[];
    final cabinetItems = <int>[];
    for (var i = 0; i < items.length; i++) {
      if (items[i].route.startsWith('/cabinet')) {
        cabinetItems.add(i);
      } else {
        siteItems.add(i);
      }
    }

    return IgnorePointer(
      ignoring: !open,
      child: Stack(
        children: [
          AnimatedOpacity(
            opacity: open ? 1 : 0,
            duration: const Duration(milliseconds: 180),
            child: GestureDetector(
              onTap: onClose,
              child: Container(color: const Color(0x66000000)),
            ),
          ),
          AnimatedPositioned(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            top: 0,
            bottom: 0,
            right: open ? 0 : -panelWidth - 24,
            child: Container(
              width: panelWidth,
              decoration: const BoxDecoration(
                color: AppTokens.bg,
                border: Border(left: BorderSide(color: AppTokens.border)),
                boxShadow: [BoxShadow(color: Color(0x22000000), blurRadius: 24, offset: Offset(-2, 0))],
              ),
              child: SafeArea(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(AppSpace.lg, AppSpace.lg, AppSpace.lg, AppSpace.xl),
                  children: [
                    const Text(
                      'Navigation',
                      style: TextStyle(color: AppTokens.textMuted, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: AppSpace.md),
                    for (final i in siteItems)
                      _OverlayMenuTile(
                        item: items[i],
                        selected: i == activeIndex,
                        onTap: () => onSelect(i),
                      ),
                    const SizedBox(height: AppSpace.lg),
                    const Divider(height: 1, color: AppTokens.border),
                    const SizedBox(height: AppSpace.lg),
                    const Text(
                      'Cabinet',
                      style: TextStyle(color: AppTokens.textMuted, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: AppSpace.md),
                    for (final i in cabinetItems)
                      _OverlayMenuTile(
                        item: items[i],
                        selected: i == activeIndex,
                        onTap: () => onSelect(i),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OverlayMenuTile extends StatelessWidget {
  final AppNavItem item;
  final bool selected;
  final VoidCallback onTap;

  const _OverlayMenuTile({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: selected ? AppTokens.primary : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: selected ? AppTokens.primary : AppTokens.border),
          ),
          child: Row(
            children: [
              Icon(
                item.icon,
                size: 18,
                color: selected ? Colors.white : AppTokens.primaryDark,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  item.title,
                  style: TextStyle(
                    color: selected ? Colors.white : AppTokens.text,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrandDot extends StatelessWidget {
  const _BrandDot();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTokens.primary, AppTokens.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: const Text(
        'N',
        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800, height: 1),
      ),
    );
  }
}
