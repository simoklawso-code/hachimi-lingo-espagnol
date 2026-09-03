import type { Item } from "./lingo";

export type Theme = { id: string; title: string; es: string; icon: string; level: "A1" | "A2" | "B1"; items: Item[] };

/** Leçons thématiques — español latino + traduction arabe */
export const themes: Theme[] = [
  {
    id: "viaje",
    title: "السفر",
    es: "Viaje",
    icon: "✈️",
    level: "A1",
    items: [
      { es: "el aeropuerto", ar: "المطار", pr: "إل أيروبويرتو" },
      { es: "el boleto", ar: "التذكرة", pr: "إل بوليتو" },
      { es: "la maleta", ar: "الحقيبة", pr: "لا ماليتا" },
      { es: "el pasaporte", ar: "جواز السفر", pr: "إل باسابورتي" },
      { es: "el vuelo", ar: "الرحلة الجوية", pr: "إل بويلو" },
      { es: "la estación", ar: "المحطة", pr: "لا إستاسيون" },
      { es: "el autobús", ar: "الحافلة", pr: "إل أوتوبوس" },
      { es: "el taxi", ar: "سيارة الأجرة", pr: "إل تاكسي" },
      { es: "¿Dónde está la salida?", ar: "أين المخرج؟", pr: "دوندي إستا لا ساليدا" },
      { es: "Quiero un boleto de ida y vuelta", ar: "أريد تذكرة ذهاب وإياب", pr: "كييرو أون بوليتو دي إيدا إي بويلتا" },
      { es: "¿A qué hora sale?", ar: "متى ينطلق؟", pr: "آ كي أورا سالي" },
      { es: "Estoy perdido", ar: "أنا تائه", pr: "إستوي بيرديدو" },
    ],
  },
  {
    id: "restaurante",
    title: "المطعم",
    es: "Restaurante",
    icon: "🍽️",
    level: "A1",
    items: [
      { es: "el menú", ar: "قائمة الطعام", pr: "إل مينو" },
      { es: "la mesa", ar: "الطاولة", pr: "لا ميسا" },
      { es: "el mesero", ar: "النادل", pr: "إل ميسيرو" },
      { es: "la cuenta", ar: "الحساب", pr: "لا كوينتا" },
      { es: "el agua", ar: "الماء", pr: "إل أغوا" },
      { es: "el pollo", ar: "الدجاج", pr: "إل بويو" },
      { es: "el arroz", ar: "الأرز", pr: "إل أروس" },
      { es: "Quisiera ordenar", ar: "أود أن أطلب", pr: "كيسييرا أوردينار" },
      { es: "¿Qué me recomienda?", ar: "بماذا تنصحني؟", pr: "كي مي ريكوميندا" },
      { es: "La cuenta, por favor", ar: "الحساب من فضلك", pr: "لا كوينتا بور فابور" },
      { es: "Está delicioso", ar: "إنه لذيذ", pr: "إستا ديليسيوسو" },
      { es: "Sin picante, por favor", ar: "بدون حار من فضلك", pr: "سين بيكانتي بور فابور" },
    ],
  },
  {
    id: "hotel",
    title: "الفندق",
    es: "Hotel",
    icon: "🏨",
    level: "A1",
    items: [
      { es: "la habitación", ar: "الغرفة", pr: "لا آبيتاسيون" },
      { es: "la llave", ar: "المفتاح", pr: "لا يابي" },
      { es: "la recepción", ar: "الاستقبال", pr: "لا ريسيبسيون" },
      { es: "la reserva", ar: "الحجز", pr: "لا ريسيربا" },
      { es: "el desayuno", ar: "الفطور", pr: "إل ديسايونو" },
      { es: "la toalla", ar: "المنشفة", pr: "لا توايا" },
      { es: "Tengo una reserva", ar: "لدي حجز", pr: "تينغو أونا ريسيربا" },
      { es: "¿Cuánto cuesta la noche?", ar: "كم سعر الليلة؟", pr: "كوانتو كويستا لا نوتشي" },
      { es: "¿Hay wifi?", ar: "هل يوجد واي فاي؟", pr: "آي ويفي" },
      { es: "El aire acondicionado no funciona", ar: "المكيف لا يعمل", pr: "إل آيري أكونديسيونادو نو فونسيونا" },
      { es: "¿A qué hora es la salida?", ar: "متى موعد المغادرة؟", pr: "آ كي أورا إس لا ساليدا" },
      { es: "Una habitación doble", ar: "غرفة مزدوجة", pr: "أونا آبيتاسيون دوبلي" },
    ],
  },
  {
    id: "trabajo",
    title: "العمل",
    es: "Trabajo",
    icon: "💼",
    level: "A2",
    items: [
      { es: "el trabajo", ar: "العمل", pr: "إل ترابخو" },
      { es: "la oficina", ar: "المكتب", pr: "لا أوفيسينا" },
      { es: "el jefe", ar: "المدير", pr: "إل خيفي" },
      { es: "el compañero", ar: "الزميل", pr: "إل كومبانييرو" },
      { es: "la reunión", ar: "الاجتماع", pr: "لا ريونيون" },
      { es: "el sueldo", ar: "الراتب", pr: "إل سويلدو" },
      { es: "el horario", ar: "التوقيت", pr: "إل أوراريو" },
      { es: "la entrevista", ar: "المقابلة", pr: "لا إنتريبيستا" },
      { es: "Busco trabajo", ar: "أبحث عن عمل", pr: "بوسكو ترابخو" },
      { es: "Trabajo desde casa", ar: "أعمل من المنزل", pr: "ترابخو ديسدي كاسا" },
      { es: "Tengo una reunión", ar: "لدي اجتماع", pr: "تينغو أونا ريونيون" },
      { es: "¿Cuál es tu profesión?", ar: "ما هي مهنتك؟", pr: "كوال إس تو بروفيسيون" },
    ],
  },
  {
    id: "familia",
    title: "العائلة",
    es: "Familia",
    icon: "👨‍👩‍👧",
    level: "A1",
    items: [
      { es: "la familia", ar: "العائلة", pr: "لا فاميليا" },
      { es: "el padre", ar: "الأب", pr: "إل بادري" },
      { es: "la madre", ar: "الأم", pr: "لا مادري" },
      { es: "el hermano", ar: "الأخ", pr: "إل إرمانو" },
      { es: "la hermana", ar: "الأخت", pr: "لا إرمانا" },
      { es: "el hijo", ar: "الابن", pr: "إل إيخو" },
      { es: "la hija", ar: "الابنة", pr: "لا إيخا" },
      { es: "el abuelo", ar: "الجد", pr: "إل أبويلو" },
      { es: "la abuela", ar: "الجدة", pr: "لا أبويلا" },
      { es: "el esposo", ar: "الزوج", pr: "إل إسبوسو" },
      { es: "Tengo dos hermanos", ar: "لدي أخوان", pr: "تينغو دوس إرمانوس" },
      { es: "Mi familia es grande", ar: "عائلتي كبيرة", pr: "مي فاميليا إس غراندي" },
    ],
  },
];

export type Verb = {
  es: string;
  ar: string;
  note: string;
  forms: { p: string; es: string; ar: string }[];
};

/** Grammaire rapide — verbes les plus utiles (español latino) */
export const verbs: Verb[] = [
  {
    es: "SER",
    ar: "يكون (صفة دائمة)",
    note: "للهوية، الأصل، المهنة والصفات الثابتة: Soy marroquí.",
    forms: [
      { p: "yo", es: "soy", ar: "أنا أكون" },
      { p: "tú", es: "eres", ar: "أنت تكون" },
      { p: "él / ella", es: "es", ar: "هو/هي يكون" },
      { p: "nosotros", es: "somos", ar: "نحن نكون" },
      { p: "ustedes", es: "son", ar: "أنتم تكونون" },
      { p: "ellos", es: "son", ar: "هم يكونون" },
    ],
  },
  {
    es: "ESTAR",
    ar: "يكون (حالة/مكان)",
    note: "للحالة المؤقتة والمكان: Estoy cansado. / Estoy en casa.",
    forms: [
      { p: "yo", es: "estoy", ar: "أنا" },
      { p: "tú", es: "estás", ar: "أنت" },
      { p: "él / ella", es: "está", ar: "هو/هي" },
      { p: "nosotros", es: "estamos", ar: "نحن" },
      { p: "ustedes", es: "están", ar: "أنتم" },
      { p: "ellos", es: "están", ar: "هم" },
    ],
  },
  {
    es: "TENER",
    ar: "يملك / عنده",
    note: "للملكية والعمر: Tengo 20 años.",
    forms: [
      { p: "yo", es: "tengo", ar: "عندي" },
      { p: "tú", es: "tienes", ar: "عندك" },
      { p: "él / ella", es: "tiene", ar: "عنده/عندها" },
      { p: "nosotros", es: "tenemos", ar: "عندنا" },
      { p: "ustedes", es: "tienen", ar: "عندكم" },
      { p: "ellos", es: "tienen", ar: "عندهم" },
    ],
  },
  {
    es: "IR",
    ar: "يذهب",
    note: "للمستقبل القريب: Voy a estudiar = سأدرس.",
    forms: [
      { p: "yo", es: "voy", ar: "أذهب" },
      { p: "tú", es: "vas", ar: "تذهب" },
      { p: "él / ella", es: "va", ar: "يذهب/تذهب" },
      { p: "nosotros", es: "vamos", ar: "نذهب" },
      { p: "ustedes", es: "van", ar: "تذهبون" },
      { p: "ellos", es: "van", ar: "يذهبون" },
    ],
  },
  {
    es: "HACER",
    ar: "يفعل / يصنع",
    note: "للأنشطة والطقس: ¿Qué haces? / Hace calor.",
    forms: [
      { p: "yo", es: "hago", ar: "أفعل" },
      { p: "tú", es: "haces", ar: "تفعل" },
      { p: "él / ella", es: "hace", ar: "يفعل" },
      { p: "nosotros", es: "hacemos", ar: "نفعل" },
      { p: "ustedes", es: "hacen", ar: "تفعلون" },
      { p: "ellos", es: "hacen", ar: "يفعلون" },
    ],
  },
  {
    es: "QUERER",
    ar: "يريد / يحب",
    note: "للطلب المهذب: Quisiera un café.",
    forms: [
      { p: "yo", es: "quiero", ar: "أريد" },
      { p: "tú", es: "quieres", ar: "تريد" },
      { p: "él / ella", es: "quiere", ar: "يريد" },
      { p: "nosotros", es: "queremos", ar: "نريد" },
      { p: "ustedes", es: "quieren", ar: "تريدون" },
      { p: "ellos", es: "quieren", ar: "يريدون" },
    ],
  },
];

export type Story = { id: string; title: string; ar: string; level: "A1" | "A2"; lines: { es: string; ar: string }[] };

/** Histoires courtes — español latino + arabe + audio */
export const stories: Story[] = [
  {
    id: "cafe",
    title: "En el café",
    ar: "في المقهى",
    level: "A1",
    lines: [
      { es: "Hoy es sábado y voy al café de la esquina.", ar: "اليوم السبت وأذهب إلى مقهى الزاوية." },
      { es: "El mesero me saluda: —¡Buenos días! ¿Qué desea?", ar: "يحييني النادل: صباح الخير! ماذا تريد؟" },
      { es: "—Quisiera un café con leche y un pan dulce.", ar: "أود قهوة بالحليب وخبزاً حلواً." },
      { es: "Me siento cerca de la ventana y leo un libro.", ar: "أجلس قرب النافذة وأقرأ كتاباً." },
      { es: "El café está caliente y delicioso.", ar: "القهوة ساخنة ولذيذة." },
      { es: "Al final pido la cuenta y dejo una propina.", ar: "في الأخير أطلب الحساب وأترك بقشيشاً." },
    ],
  },
  {
    id: "mercado",
    title: "En el mercado",
    ar: "في السوق",
    level: "A1",
    lines: [
      { es: "Mi madre y yo vamos al mercado el domingo.", ar: "أنا وأمي نذهب إلى السوق يوم الأحد." },
      { es: "Compramos frutas: manzanas, plátanos y naranjas.", ar: "نشتري الفواكه: تفاح، موز وبرتقال." },
      { es: "—¿Cuánto cuesta el kilo? —pregunta mi madre.", ar: "كم ثمن الكيلو؟ تسأل أمي." },
      { es: "—Veinte pesos, señora —responde el vendedor.", ar: "عشرون بيزو يا سيدتي، يجيب البائع." },
      { es: "El mercado es grande y hay mucha gente.", ar: "السوق كبير وهناك ناس كثيرون." },
      { es: "Volvemos a casa contentos.", ar: "نعود إلى البيت سعداء." },
    ],
  },
  {
    id: "viaje",
    title: "Un viaje a México",
    ar: "رحلة إلى المكسيك",
    level: "A2",
    lines: [
      { es: "El año pasado viajé a México con un amigo.", ar: "السنة الماضية سافرت إلى المكسيك مع صديق." },
      { es: "El vuelo fue largo, pero muy tranquilo.", ar: "كانت الرحلة طويلة لكنها هادئة جداً." },
      { es: "En Ciudad de México visitamos museos y plazas.", ar: "في مدينة مكسيكو زرنا متاحف وساحات." },
      { es: "La comida picante me encantó.", ar: "أعجبني الطعام الحار كثيراً." },
      { es: "La gente es muy amable y habla despacio conmigo.", ar: "الناس لطفاء جداً ويتحدثون ببطء معي." },
      { es: "Quiero regresar el próximo verano.", ar: "أريد العودة الصيف القادم." },
    ],
  },
];
