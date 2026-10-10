/**
 * Official catalog extracted from https://www.babalagha.com/menu (audited 2026-10-11).
 *
 * Source of truth rules:
 * - `nameAr` and `packageAr` are copied verbatim from the official menu.
 * - `nameEn` is a translation prepared for this project and MUST be approved by the company
 *   (see docs/MISSING-INFORMATION.md). It is not taken from an official source.
 * - No descriptions, ingredients, nutrition, weights or shelf-life are published here because
 *   none were available on the official website.
 * - `image` is the Wix media id of the company's own product photo on the official site.
 */

export type OfficialCategory = {
  slug: string;
  nameAr: string;
  nameEn: string;
  /** Short line shown under the category name. Only text found on the official site. */
  taglineAr?: string;
  image: string;
  order: number;
};

export type OfficialProduct = {
  slug: string;
  category: string;
  nameAr: string;
  nameEn: string;
  /** Package text exactly as listed on the official menu, e.g. "كيس 8 قطع". */
  packageAr?: string;
  image: string;
  featured?: boolean;
};

export const officialCategories: OfficialCategory[] = [
  {
    slug: "bread-and-samoon",
    nameAr: "الخبز والصمون",
    nameEn: "Bread & Samoon",
    taglineAr: "جميع انواع الخبز والصمون",
    image: "65d6f5_33f06a2d989b40828466f925bd75df56~mv2.jpg",
    order: 1,
  },
  {
    slug: "toast-and-healthy-bread",
    nameAr: "التوست والخبز الصحي",
    nameEn: "Toast & Healthy Bread",
    image: "65d6f5_06594365b3ea4727b48a423d1d8fef56~mv2.jpg",
    order: 2,
  },
  {
    slug: "oriental-sweets",
    nameAr: "الحلويات",
    nameEn: "Sweets",
    image: "65d6f5_9ae987251fad4cb8a3dbe57f7088a143~mv2.jpg",
    order: 3,
  },
  {
    slug: "pastries-and-kleicha",
    nameAr: "المعجنات والكليجة",
    nameEn: "Pastries & Kleicha",
    image: "65d6f5_b7d83aae42f949328cc2830c27dfae73~mv2.jpg",
    order: 4,
  },
  {
    slug: "cakes-and-trifle",
    nameAr: "الكيك والترايفل",
    nameEn: "Cakes & Trifle",
    image: "65d6f5_b17f94be3f3f41c1bc293a3c22700b12~mv2.jpg",
    order: 5,
  },
];

export const officialProducts: OfficialProduct[] = [
  // الخبز والصمون
  { slug: "lebanese-bread", category: "bread-and-samoon", nameAr: "عيش لبناني", nameEn: "Lebanese Bread", packageAr: "كيس 8 قطع", image: "65d6f5_8810d35df4544436ae5fd67559a955c8~mv2.jpg", featured: true },
  { slug: "brown-lebanese-bread", category: "bread-and-samoon", nameAr: "عيش لبناني اسمر", nameEn: "Brown Lebanese Bread", packageAr: "كيس عيش لبناني اسمر", image: "65d6f5_9b4c39690efd48c8a4327bfc57ffb7a0~mv2.jpg" },
  { slug: "brown-bread", category: "bread-and-samoon", nameAr: "خبز اسمر", nameEn: "Brown Bread", packageAr: "كيس خبز اسمر 7 قطع", image: "65d6f5_ca099456f6f84a389db70f47734a3aa7~mv2.jpg" },
  { slug: "barley-bread", category: "bread-and-samoon", nameAr: "خبز شعير", nameEn: "Barley Bread", packageAr: "كيس خبز شعير خالص درجة اولى", image: "65d6f5_b74b472b2f924226ac1034b3b3372ff1~mv2.jpg", featured: true },
  { slug: "french-samoon", category: "bread-and-samoon", nameAr: "صمون فرنسي", nameEn: "French Samoon", packageAr: "كيس 8 قطع", image: "65d6f5_02500b719cb7476f938bddb68740f224~mv2.jpg", featured: true },
  // التوست والخبز الصحي
  { slug: "oat-toast", category: "toast-and-healthy-bread", nameAr: "توست بالشوفان", nameEn: "Oat Toast", image: "65d6f5_57bdd70ae238408ab86e0ede90af0786~mv2.jpg" },
  { slug: "toast", category: "toast-and-healthy-bread", nameAr: "توست", nameEn: "Toast", packageAr: "كيس توست", image: "65d6f5_5938e119fc40479598403ae1d8a066ed~mv2.jpg", featured: true },
  { slug: "healthy-corn-bread", category: "toast-and-healthy-bread", nameAr: "خبز صحي ذرة", nameEn: "Healthy Corn Bread", image: "65d6f5_e68d1b4f08fc41858e62e0acc9a0be7f~mv2.jpg" },
  // الحلويات
  { slug: "baklava", category: "oriental-sweets", nameAr: "بقلاوة", nameEn: "Baklava", image: "65d6f5_e818bc5d38874c29beffb4ecbf01ca18~mv2.jpg", featured: true },
  { slug: "znood-el-sit", category: "oriental-sweets", nameAr: "زنود الست", nameEn: "Znood El Sit", packageAr: "كيلو زنود الست", image: "65d6f5_5216fae5078a4b05b5d8208ad58a21b8~mv2.jpg" },
  { slug: "khdood-el-sit", category: "oriental-sweets", nameAr: "خدود الست", nameEn: "Khdood El Sit", packageAr: "كيلو خدود الست", image: "65d6f5_23d2b57ad97544efb26c8c156f512e16~mv2.jpg" },
  { slug: "kaab-al-ghazal", category: "oriental-sweets", nameAr: "كعب الغزال", nameEn: "Kaab Al Ghazal", packageAr: "كيلو كعب الغزال", image: "65d6f5_f0e1f7399cb847538d0857ded6403de7~mv2.jpg" },
  { slug: "zalabia", category: "oriental-sweets", nameAr: "زلابية", nameEn: "Zalabia", packageAr: "كيلو زلابية", image: "65d6f5_fe156f2fee1a408aabd5fdfcb42c740e~mv2.jpg", featured: true },
  { slug: "basbousa", category: "oriental-sweets", nameAr: "بسبوسة", nameEn: "Basbousa", packageAr: "كيلو بسبوسة", image: "65d6f5_64f1ff7b69eb452eabd0e56c1d6edf70~mv2.jpg" },
  { slug: "jazariya", category: "oriental-sweets", nameAr: "جزرية", nameEn: "Jazariya (Carrot Sweet)", packageAr: "كيلو جزرية", image: "65d6f5_9545a337c59841c6a57210bff42427b6~mv2.jpg" },
  { slug: "basbousa-with-nuts", category: "oriental-sweets", nameAr: "بسبوسة بالمكسرات", nameEn: "Basbousa with Nuts", packageAr: "كيلو بسبوسة بالمكسرات", image: "65d6f5_73b1fef1b9434db08476a03c7f1899aa~mv2.jpg" },
  { slug: "sweet-mawaleh", category: "oriental-sweets", nameAr: "موالح حلوة", nameEn: "Sweet Mawaleh", image: "65d6f5_0e7a0d92d8a1496da156821a26e41cda~mv2.jpg" },
  { slug: "crystal-baklava", category: "oriental-sweets", nameAr: "بقلاوة بلورية", nameEn: "Crystal Baklava", image: "65d6f5_88c475a83c584170a7eee224b87ff581~mv2.jpg" },
  { slug: "dehina-with-walnuts", category: "oriental-sweets", nameAr: "دهينة بالجوز", nameEn: "Dehina with Walnuts", image: "65d6f5_0a0bd1857f3243a1ac97ee47f27237f3~mv2.jpg" },
  // المعجنات والكليجة
  { slug: "biscuits", category: "pastries-and-kleicha", nameAr: "بساكت", nameEn: "Biscuits", packageAr: "كيلو بساكت", image: "65d6f5_eb38bf9396ab4fcb87fb78d5f6453f78~mv2.jpg" },
  { slug: "barazek", category: "pastries-and-kleicha", nameAr: "برازق", nameEn: "Barazek", packageAr: "كيلو برازق", image: "65d6f5_be218a376f714c33876450504ecd94e7~mv2.jpg" },
  { slug: "kleicha-with-walnuts", category: "pastries-and-kleicha", nameAr: "كليجة بالجوز", nameEn: "Kleicha with Walnuts", packageAr: "كيلو كليجة بالجوز", image: "65d6f5_de12271d24654f1791abf9796241d400~mv2.jpg", featured: true },
  { slug: "kleicha-with-dates", category: "pastries-and-kleicha", nameAr: "كليجة بالتمر", nameEn: "Kleicha with Dates", packageAr: "كيلو كليجة بالتمر", image: "65d6f5_1dff098e244c47f6871e45788364a9e2~mv2.jpg", featured: true },
  { slug: "cream-yaf", category: "pastries-and-kleicha", nameAr: "كريم ياف", nameEn: "Cream Yaf", packageAr: "قطعة كريم ياف", image: "65d6f5_8cd3298cd467411ea12cf9b2dd3de1b6~mv2.jpg" },
  // الكيك والترايفل
  { slug: "cake-size-4", category: "cakes-and-trifle", nameAr: "قالب كيك رقم 4", nameEn: "Cake No. 4", packageAr: "حجم كبير جداً", image: "65d6f5_9de8b22b12ae42c9b458c98b93d4b072~mv2.jpg" },
  { slug: "cake-size-3", category: "cakes-and-trifle", nameAr: "قالب كيك رقم 3", nameEn: "Cake No. 3", packageAr: "حجم كبير", image: "65d6f5_7a6b52209f3048b7a045acb3f74a78e1~mv2.jpg" },
  { slug: "cake-size-2", category: "cakes-and-trifle", nameAr: "قالب كيك رقم 2", nameEn: "Cake No. 2", packageAr: "حجم متوسط", image: "65d6f5_78d882cd63c64b41a9816bb502ef2000~mv2.jpg" },
  { slug: "cake-size-1", category: "cakes-and-trifle", nameAr: "قالب كيك رقم 1", nameEn: "Cake No. 1", packageAr: "حجم صغير", image: "65d6f5_2fdda4aecb5c465c9dc0c3faac3570fa~mv2.jpg" },
  { slug: "vanilla-home-cake", category: "cakes-and-trifle", nameAr: "كيك بيتي بالفانله", nameEn: "Homestyle Vanilla Cake", image: "65d6f5_c9bbfb7d3e8347abb83ac9ed50d0487b~mv2.jpg" },
  { slug: "cocoa-home-cake", category: "cakes-and-trifle", nameAr: "كيك بيتي بالكاكاو", nameEn: "Homestyle Cocoa Cake", image: "65d6f5_5ff3ea21181545cb9ba1321d5f05c849~mv2.jpg" },
  { slug: "trifle", category: "cakes-and-trifle", nameAr: "ترايفل", nameEn: "Trifle", image: "65d6f5_1e8c35087f354964afa0c5d0bbc9633f~mv2.jpg", featured: true },
  { slug: "turab-al-mulook", category: "cakes-and-trifle", nameAr: "تراب الملوك", nameEn: "Turab Al Mulook", image: "65d6f5_2a614cbfeae74651b02e9dfba2d43fe3~mv2.jpg" },
  { slug: "mini-cake", category: "cakes-and-trifle", nameAr: "ميني كيك", nameEn: "Mini Cake", image: "65d6f5_aad69879616a4160bb702096c1abd422~mv2.jpg" },
  { slug: "cake-slices", category: "cakes-and-trifle", nameAr: "قطع كيك", nameEn: "Cake Slices", image: "65d6f5_1ec45d77a80445d49be5e90e2e37ee10~mv2.jpg" },
  { slug: "cake-slices-2", category: "cakes-and-trifle", nameAr: "قطع كيك", nameEn: "Cake Slices (Assorted)", image: "65d6f5_055bc59ad8664036a4485cfdc3efea60~mv2.jpg" },
  { slug: "turjala-cake", category: "cakes-and-trifle", nameAr: "كيك ترجلة", nameEn: "Turjala Cake", image: "65d6f5_f39a2efb1fcd496c898085a9ad9e2e73~mv2.jpg" },
];

/** Brand images from the official site (company-owned). */
export const brandImages = {
  logo: "65d6f5_074383041ac246b083f8285b20c922d8~mv2_d_4000_4000_s_4_2.png",
  facade: "65d6f5_2632c2a41c194e2b8879d6e811ae73ba~mv2.jpg",
  oldBaghdad: "65d6f5_bb7ced3a22a848bfa4f5a5e1010a9424~mv2_d_5000_3000_s_4_2.jpg",
  archivalBakers: "65d6f5_dbdac01cd8854f6bad3b964136f55463~mv2.jpg",
  heroA: "65d6f5_8d71dbd50dd349249958194bf88a97c3~mv2.jpg",
  heroB: "65d6f5_0003ed7e267b4688a55e982cf1795822f000.jpg",
} as const;

/** Images from the official "معرض الصور والفيديو" page. */
export const galleryImages = [
  "65d6f5_8356f7034a024c88aa97ee99222f1daff000.jpg",
  "65d6f5_94307592c6bf49c6b73596c5ff02ef04f000.jpg",
  "65d6f5_e562541864a64ab0b266f2eb46431b93f000.jpg",
  "65d6f5_dd3f1c6579014da6ad20448f9f484208f000.jpg",
  "65d6f5_2a9c40b736c74ccf9d58bf431d2203b8f000.jpg",
  "65d6f5_c4949699e84c455a9c546e86fbafc92f~mv2.jpg",
  "65d6f5_e8bfb6a1ef2c46faae98059480dd0cb5~mv2.jpg",
  "65d6f5_cf6a05dbff5a438abf8035016f38e89d~mv2.jpg",
  "65d6f5_35ed85df0ae446529b74baf1aaada37f~mv2.jpg",
  "65d6f5_2eb94e8ae44c43bcb13c5b795781cb42~mv2.jpg",
  "65d6f5_796daf8278ce46809b3989af1bcae6e2~mv2.jpg",
  "65d6f5_94a093bb8e3b40ebb28e076ae251a0b1~mv2.jpg",
  "65d6f5_704b242ecb3c4d59b04a48adb24d5520~mv2.jpg",
  "65d6f5_239c0ed7d2014117bbe93999ede1fe61~mv2.jpg",
  "65d6f5_53f32ae7eb9d46e7bf756d30029af750~mv2.jpg",
  "65d6f5_aad0f7841e0b4e02bcfddb48363a5b56~mv2.jpg",
  "65d6f5_2afb667974d046d7971f5d6d704143d7~mv2.jpg",
  "65d6f5_d786d869db45418ab64672d310ecd307~mv2.jpg",
  "65d6f5_46260700c37c48baa7d6eae85db882ad~mv2.jpg",
  "65d6f5_fc783dba808341c4b31abd55ec07fa9b~mv2.jpg",
  "65d6f5_99c0724994a44046a724282913f3833e~mv2.jpg",
  "65d6f5_ba1863a92f0f4e0694ca62aba9beba7a~mv2.jpg",
  "65d6f5_4300e7c64eaf4ed78815b3a4bd22771b~mv2.jpg",
  "65d6f5_40f999cf39684e5bbb318cf52c9665b4~mv2.jpg",
];

/** Timeline copied from the official About page ("رحلتنا مع رغيف الخبز"). */
export const officialTimeline: { year: number; titleAr: string; placeAr: string; titleEn: string; placeEn: string }[] = [
  { year: 1948, titleAr: "المخبز الملكي (الملوكي)", placeAr: "الكرخ — خلف جامع مظهر الشاوي", titleEn: "The Royal Bakery (Al-Malooki)", placeEn: "Karkh — behind Mudhhir Al-Shawi Mosque" },
  { year: 1959, titleAr: "أفران الشعب", placeAr: "الكرخ — مقابل السفارة الإيرانية", titleEn: "Al-Shaab Bakeries", placeEn: "Karkh — opposite the Iranian Embassy" },
  { year: 1967, titleAr: "أفران الصالحية", placeAr: "رأس جسر الأحرار", titleEn: "Al-Salihiya Bakeries", placeEn: "At the head of Al-Ahrar Bridge" },
  { year: 1968, titleAr: "أفران الحارثية", placeAr: "مقابل معرض بغداد", titleEn: "Al-Harthiya Bakeries", placeEn: "Opposite the Baghdad International Fair" },
  { year: 1969, titleAr: "أفران الكرامة", placeAr: "الشواكة — مقابل السفارة البريطانية", titleEn: "Al-Karama Bakeries", placeEn: "Al-Shawaka — opposite the British Embassy" },
  { year: 1971, titleAr: "أفران وأسواق الزهراء", placeAr: "مجاور جامع المأمون", titleEn: "Al-Zahraa Bakeries & Markets", placeEn: "Next to Al-Ma'mun Mosque" },
  { year: 1977, titleAr: "أفران الدورة", placeAr: "الدورة", titleEn: "Al-Dora Bakeries", placeEn: "Al-Dora" },
  { year: 1992, titleAr: "أفران الديار", placeAr: "ساحة النصر", titleEn: "Al-Diyar Bakeries", placeEn: "Al-Nasr Square" },
  { year: 1995, titleAr: "أفران الدرويش", placeAr: "بغداد الجديدة", titleEn: "Al-Darwish Bakeries", placeEn: "New Baghdad" },
  { year: 1998, titleAr: "أفران الدرويش", placeAr: "الدورة", titleEn: "Al-Darwish Bakeries", placeEn: "Al-Dora" },
  { year: 2019, titleAr: "مخابز باب الآغا", placeAr: "منطقة عويريج الصناعية — طريق بغداد–الحلة", titleEn: "Bab Al Agha Bakeries", placeEn: "Awerij Industrial Area — Baghdad–Hilla Road" },
];

/** Contact details published on https://www.babalagha.com/contact */
export const officialContact = {
  phones: [
    { key: "management", labelAr: "الإدارة", labelEn: "Management", number: "+9647801177770", display: "0780 117 7770" },
    { key: "sales", labelAr: "المبيعات", labelEn: "Sales", number: "+9647803336665", display: "0780 333 6665" },
    { key: "customer", labelAr: "خدمة الزبائن", labelEn: "Customer service", number: "+9647830003337", display: "0783 000 3337" },
  ],
  email: "info@babalagha.com",
  addressAr: "العراق – بغداد – منطقة عويريج الصناعية، الشارع العام، طريق بغداد – الحلة",
  addressEn: "Awerij Industrial Area, Baghdad–Hilla Road, Baghdad, Iraq",
  facebook: "https://www.facebook.com/babalagha.iq/",
  instagram: "https://www.instagram.com/babalagha.iq/",
};
