export type CategorySlug = 'skincare' | 'hair' | 'makeup' | 'slimming';

export interface ProductVariationOption {
  id: string;
  label: string;
  price: number;
}

export interface ProductVariations {
  name: string;
  options: ProductVariationOption[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number | null;
  description: string | null;
  image: string;
  imageSmall: string;
  variations?: ProductVariations;
  featured: boolean;
  concerns: string[];
}

export const products: Product[] = [
  {
    "id": 17014,
    "slug": "كريم-التفتيح",
    "name": "كريم التفتيح",
    "category": "skincare",
    "price": 75000,
    "description": null,
    "image": "/images/products/17014.webp",
    "imageSmall": "/images/products/17014-sm.webp",
    "featured": true,
    "concerns": [
      "تفتيح",
      "كلف",
      "توحيد اللون"
    ]
  },
  {
    "id": 8599,
    "slug": "روتين-البشرة-الدهنية",
    "name": "روتين البشرة الدهنية",
    "category": "skincare",
    "price": 160000,
    "description": "مكوّن من (ماسك الطين + غسول لاكتيك+ مقطر الأعشاب الغني بالأعشاب الطبيعية والتي تخفف من الإفرازات الدهنية) .. أولاً: نغسل الوجه بالغسول مرة صباحاً ومرة مساءاً.. نضع رغوة الغسول مع الماء على الوجه وتبقى دقيقتين ثم يشطف الوجه بالماء .. ثانياً: بعد الغسول نبخ مقطر الأعشاب على الوجه .. ويوضع ثلاث مرات يومياً صباحاً-مساءاً-ظهراً .. ثالثاً: بعد مقطر الأعشاب نضع ماسك الطين على كامل الوجه ماعدا تحت العين ونبقى بوضعية الراحة نصف ساعة ثم نشطف الماسك بالماء وننظف الوجه بالغسول ثم نبخ مقطر الأعشاب ..نستخم ماسك الطين ثلاث مرات بالأسبوع … ملاحظات : ((الماسك بوضعية الراحة ممنوع الضحك أو الحكي _ وعند صعوبة مد الماسك على الوجه نبخ فوق الماسك مقطر الأعشاب ))",
    "image": "/images/products/8599.webp",
    "imageSmall": "/images/products/8599-sm.webp",
    "featured": true,
    "concerns": [
      "دهنية",
      "حبوب",
      "مسام"
    ]
  },
  {
    "id": 8597,
    "slug": "غسول-البشرة-بالكولاجين",
    "name": "غسول البشرة بالكولاجين",
    "category": "skincare",
    "price": 60000,
    "description": null,
    "image": "/images/products/8597.webp",
    "imageSmall": "/images/products/8597-sm.webp",
    "featured": false,
    "concerns": [
      "تنظيف",
      "ترطيب"
    ]
  },
  {
    "id": 8595,
    "slug": "غسول-لاكتيك-اسيد",
    "name": "غسول لاكتيك اسيد",
    "category": "skincare",
    "price": 60000,
    "description": null,
    "image": "/images/products/8595.webp",
    "imageSmall": "/images/products/8595-sm.webp",
    "featured": false,
    "concerns": [
      "تنظيف",
      "حبوب",
      "تقشير لطيف"
    ]
  },
  {
    "id": 8593,
    "slug": "كريم-الشد",
    "name": "كريم الشد",
    "category": "skincare",
    "price": 150000,
    "description": "يحتوي على المادة الأولى عالميا في الشد يناسب كل البشرات في حال بشره جافه منستخدم معو مرطب غني بالزيوت او كريم الاكزيما للترطيب او الكريم المرطب في حال بشره دهنيه فينا نستخدمو مع روتين البشره الدهنيه في حال بشره مختلطه وحساسه فينا نستخدمو مع الروتين الخاص فينا",
    "image": "/images/products/8593.webp",
    "imageSmall": "/images/products/8593-sm.webp",
    "featured": true,
    "concerns": [
      "شد",
      "تجاعيد",
      "ترطيب"
    ]
  },
  {
    "id": 8591,
    "slug": "كريم-الكلف-المعند-3",
    "name": "كريم الكلف المعند 3",
    "category": "skincare",
    "price": 250000,
    "description": null,
    "image": "/images/products/8591.webp",
    "imageSmall": "/images/products/8591-sm.webp",
    "featured": false,
    "concerns": [
      "كلف",
      "تفتيح"
    ]
  },
  {
    "id": 8589,
    "slug": "خلاصة-الأوليفيرا-للترطيب-والأكزيما",
    "name": "خلاصة الأوليفيرا للترطيب والأكزيما",
    "category": "skincare",
    "price": 75000,
    "description": null,
    "image": "/images/products/8589.webp",
    "imageSmall": "/images/products/8589-sm.webp",
    "featured": true,
    "concerns": [
      "ترطيب",
      "حساسية",
      "أكزيما",
      "تهيج"
    ]
  },
  {
    "id": 8588,
    "slug": "كريم-الكلف-المعند-2",
    "name": "كريم الكلف المعند 2",
    "category": "skincare",
    "price": 200000,
    "description": null,
    "image": "/images/products/8588.webp",
    "imageSmall": "/images/products/8588-sm.webp",
    "featured": false,
    "concerns": [
      "كلف",
      "تفتيح"
    ]
  },
  {
    "id": 8586,
    "slug": "كريم-الكلف-المعند-1",
    "name": "كريم الكلف المعند 1",
    "category": "skincare",
    "price": 150000,
    "description": "علاج الكلف كحد وسطي 6 شهور الكورس الأول يعطي نتيجة 50% تقريبا ثم يبقى من رحلة العلاج 5شهور كل شهر يكون هناك كورس كل شهر يعطي نتائج (5-6-10%)لأنه يدخل على الطبقات الداخلية ويعالجها الالتزام بالواقي الشمسي يجب أن يتجدد كل ساعتين ويمكن أن نبخ مقطر تحت الواقي الشمسي ممنوع منعا باتا التقشير أو الجلسات (أي بنت بتعمل تقشير مابكفيلا علاج)",
    "image": "/images/products/8586.webp",
    "imageSmall": "/images/products/8586-sm.webp",
    "featured": false,
    "concerns": [
      "كلف",
      "تفتيح"
    ]
  },
  {
    "id": 8584,
    "slug": "كريم-البوتوكس",
    "name": "كريم البوتوكس",
    "category": "skincare",
    "price": 100000,
    "description": "يحتوي على كمية كبيرة من الزيوت والكافيار والحلزون بالتالي يشد الوجه بشكل كبير يناسب البشرة الجافة يعطي ترطيب وشد يوضع لمدة 6ساعات ضمن البيت ويتم الغسيل في حال الخروج",
    "image": "/images/products/8584.webp",
    "imageSmall": "/images/products/8584-sm.webp",
    "featured": false,
    "concerns": [
      "شد",
      "ترطيب",
      "نضارة"
    ]
  },
  {
    "id": 8582,
    "slug": "أعشاب-التنحيف",
    "name": "أعشاب التنحيف",
    "category": "slimming",
    "price": 200000,
    "description": "يجب اتباع نظام غذائي يقسم يومنا لقسمين( صيام متقطع) وتكون الفترة المثالية للأكل 11 ل 6 أو 10 ل 5 أو 12 ل 7 حسب ما يناسب كل شخص وروتينه اليومي فاصل بين الحبوب والأكل ساعة أو نصف ساعة حبتين مع كأس ماء كبيرة الأكل 6 ساعات والباقي صيام وجبة الفطور حبتين قبل الطعام مع نصف لتر ماء بعد نصف أو ثلاث أرباع ساعة نبدأ الأكل تكون وجبة الفطور مكونة من رغيف خبز نخالة كامل أسمر مع( لبنة جبنة زيتون بيض مع كمية زيت قليلة) ويمكن تناول وجبة خفيفة ثلاث حبات تمر حبة فواكه لبن أو سلطة أو قطعة بسكويت دايجستيف الغداء قبل تناول الطعام حبتين أعشاب تنحيف مع نصف لتر ماء بعد نصف ساعة لثلاث أرباع الساعة ويمكن تناول أي وجبة مطبوخة كانت ما عدا المقالي والخبز الأبيض والوجبات السريعة إذا كان لازم العشاء قبل الطعام حبتين مع نصف لتر ماء بعد نصف ساعة فواكه خيار بلبن خضار سلطة شوربة ثم بعدها صيام مشروبات زهورات أو ماء فقط أي شيء لا يحتاج استقلاب ملاحظات: ممنوع تناول الخبز الأبيض والسكر إذا احتجنا للسكر نضع بداله عسل ملعقة واحدة باليوم وتخفيف خبز رغيف واحد باليوم",
    "image": "/images/products/8582.webp",
    "imageSmall": "/images/products/8582-sm.webp",
    "featured": true,
    "concerns": [
      "تنحيف",
      "وزن"
    ]
  },
  {
    "id": 8580,
    "slug": "كرياتين-طبيعي",
    "name": "كرياتين طبيعي",
    "category": "hair",
    "price": null,
    "description": "كرياتين طبيعي لايشبه الكرياتين الذي يسبل الشعر ولكن يعطي نفس الفعالية في تخفيف نفشة الشعر وإضافة نعومة وانسيابية للشعر لأنه غني بالزيوت والفيتامينات التي تغذي وتنمي الشعر ويمكن استخدامه للشعر السابل والكيرلي(المجعد) حيث يخفف الهيشان ويعطي لكل نوع شعر مظهر متناسق وناعم ورونق جذاب … يوضع من الجذور إلى الأطراف وينقع 12 ساعة ثم يحمم الشعر .. يستخدم مرتين بالاسبوع ..",
    "image": "/images/products/8580.webp",
    "imageSmall": "/images/products/8580-sm.webp",
    "featured": false,
    "concerns": [
      "شعر",
      "نعومة",
      "تطويل"
    ]
  },
  {
    "id": 8578,
    "slug": "خلطة-السبع-زيوت",
    "name": "خلطة السبع زيوت",
    "category": "hair",
    "price": 100000,
    "description": null,
    "image": "/images/products/8578.webp",
    "imageSmall": "/images/products/8578-sm.webp",
    "featured": false,
    "concerns": [
      "شعر",
      "تغذية",
      "نعومة"
    ]
  },
  {
    "id": 8576,
    "slug": "بديل-الزيت",
    "name": "بديل الزيت",
    "category": "hair",
    "price": 150000,
    "description": "يوضع على الشعر دون الاقتراب على الجذور مرة بالأسبوع",
    "image": "/images/products/8576.webp",
    "imageSmall": "/images/products/8576-sm.webp",
    "featured": false,
    "concerns": [
      "شعر",
      "ترطيب",
      "تطويل"
    ]
  },
  {
    "id": 8573,
    "slug": "بخاخ-تطويل-الشعر",
    "name": "بخاخ تطويل الشعر",
    "category": "hair",
    "price": 60000,
    "description": "نبخ 3 مرات باليوم على الجذور مع التدليك لفروة الرأس",
    "image": "/images/products/8573.webp",
    "imageSmall": "/images/products/8573-sm.webp",
    "featured": false,
    "concerns": [
      "شعر",
      "تطويل",
      "كثافة"
    ]
  },
  {
    "id": 8569,
    "slug": "مجموعة-العناية-بالشعر",
    "name": "مجموعة العناية بالشعر",
    "category": "hair",
    "price": 310000,
    "description": "نحمم الشعر بالشامبو بطريقة عادية أما(بديل الزيت) نضعه من نص الشعر وللأسفل ونتركه عشر دقايق ونغسله و اليوم الذي نريد أن نضع الزيت مرة في الأسبوع قبل بخ الزيت يجب بخ مقطرات الأعشاب للشعر قليلا ثم نبلل الشعر بالزيت بشكل كتير منيح ونضع البوند ثم نوجه السيشوار عالشعر ونترك الزيت على الشعر لمدة 12 ساعة أو 9ساعات ثم نغسله جيدا ونحممه بالشامبو بديل الزيت بالنسبة لمقطر الأعشاب نبخها على جلدة الرأس 3مرات باليوم وندلكها",
    "image": "/images/products/8569.webp",
    "imageSmall": "/images/products/8569-sm.webp",
    "featured": true,
    "concerns": [
      "شعر",
      "روتين متكامل",
      "تغذية"
    ]
  },
  {
    "id": 8567,
    "slug": "ماسك-الورد",
    "name": "ماسك الورد",
    "category": "skincare",
    "price": 50000,
    "description": "يتميز بخاصية تفتيح وترطيب ويعطي نعومة ونضارة طريقة الاستخدام : بخ مقطر أعشاب قبل الماسك وبعده بعد غسل الوجه ثم نضع الماسك على كامل الوجه آمن لتحت العين نتركه لمدة نص ساعة ثم نغسله ونبخ مقطر الأعشاب يستخدم مرة أو مرتين في الأسبوع",
    "image": "/images/products/8567.webp",
    "imageSmall": "/images/products/8567-sm.webp",
    "featured": false,
    "concerns": [
      "تفتيح",
      "ترطيب",
      "نضارة"
    ]
  },
  {
    "id": 8565,
    "slug": "طينة-البحر-الميت",
    "name": "طينة البحر الميت",
    "category": "skincare",
    "price": 50000,
    "description": "ممتاز في حالة حب الشباب وحالة الحبوب الناعمة نبخ مقطرات الأعشاب وندهن الماسك على كامل الوجه لانقربه على منطقة تحت العين ولا نعطي أي تعبير لا ضحك ولا عبسة ونغسله بعد نص ساعة بماء فقط ثم نبخ مقطرات الوجه يستخدم مرة أو مرتين في الأسبوع 1-تقشير البشرة. 2 إزالة الخلايا الميتة في داخل الجلد. 3 تجديد الخلايا. 4تصفية الوجه من الشوائب وعمل له تنظيف عميق. 5 تبييض البشرة وزيادة نضارتها. 6تنعيم ملمس البشرة. 7 شد تجاعيد الوجه. 8تخليص البشرة من الدهون الزائدة. 9علاج الهالات السوداء وانتفاخ العين. 10 حماية البشرة من الجفاف. 11 إزالة الحبوب الحمراء الصغيرة. 12 تغذية البشرة. 13 تنظيف الشعر وزيادة لمعانها وليونتها.",
    "image": "/images/products/8565.webp",
    "imageSmall": "/images/products/8565-sm.webp",
    "featured": false,
    "concerns": [
      "حبوب",
      "تنظيف",
      "دهنية",
      "مسام"
    ]
  },
  {
    "id": 8563,
    "slug": "ماسك-الفحم",
    "name": "ماسك الفحم",
    "category": "skincare",
    "price": 50000,
    "description": "يستخدم للرؤوس السوداء ويعطي بياض لأن أحد مكوناته عرق السوس طريقة الاستخدام: نبخ مقطرات الأعشاب ثم ندهن الماسك على كامل الوجه لمدة نص ساعة ثم نغسله ونبخ مقطرات الأعشاب (يمكن غسله بغسول) يستخدم مرة أو مرتين في الأسبوع",
    "image": "/images/products/8563.webp",
    "imageSmall": "/images/products/8563-sm.webp",
    "featured": false,
    "concerns": [
      "حبوب",
      "رؤوس سوداء",
      "تنظيف"
    ]
  },
  {
    "id": 8561,
    "slug": "قاشط-الأعشاب",
    "name": "قاشط الأعشاب",
    "category": "skincare",
    "price": 75000,
    "description": "طريقة الاستخدام : مرة كل 15 يوم أو مرة كل شهر حسب الوقت المناسب (ممنوع منعا باتا الخروج من المنزل للمسا لمدة 4 أيام ) يستخدم لإزالة الجلد الميت عن الوجه والأكواع والركب وآمن للمنطقة الحساسة وإزالة آثار الحبوب والتصبغات يستخدم ليلا حيث يغسل الوجه جيدا ويجفف ويدهن الوجه بزيت الزيتون وبعد ثلت ساعة يوضع القاشط على قطعة ويدلك الوجه باستمرار بعكس عقارب الساعة لمدة ثلاث دقائق بعدها يغسل الوجه ويوضع كريم مرمم( بانتينول سيراميد …الخ) وبعد ساعتين يوضع سيروم بعد نصف ساعة يمكن استخدام أي نوع من الكريمات ملاحظة: عند استخدام القاشط يمنع التعرض لوهج حراري لمدة ثلاث أيام وكل ساعتين يدهن بانتينول ويمكن استخدام سيروم وبعد نصف ساعة الكريم يعاد استخدامه لأي سؤال الاتصال مكالمة حصرا على رقمي",
    "image": "/images/products/8561.webp",
    "imageSmall": "/images/products/8561-sm.webp",
    "featured": false,
    "concerns": [
      "تقشير",
      "تفتيح",
      "آثار الحبوب"
    ]
  },
  {
    "id": 8559,
    "slug": "سيروم-حول-العين",
    "name": "سيروم حول العين",
    "category": "skincare",
    "price": 75000,
    "description": "سيروم حول العين نضعه بعد الغسول الخاص ببشرتنا ونضع المقطر فوق وتحت العين ثم نضع الكريم او السيروم يلي وصفتلكون اياه",
    "image": "/images/products/8559.webp",
    "imageSmall": "/images/products/8559-sm.webp",
    "featured": false,
    "concerns": [
      "هالات",
      "ترطيب",
      "نضارة"
    ]
  },
  {
    "id": 8441,
    "slug": "سيروم-لاكتيك-اسيد",
    "name": "سيروم لاكتيك اسيد",
    "category": "skincare",
    "price": 75000,
    "description": null,
    "image": "/images/products/8441.webp",
    "imageSmall": "/images/products/8441-sm.webp",
    "featured": false,
    "concerns": [
      "تفتيح",
      "تقشير لطيف",
      "كلف"
    ]
  },
  {
    "id": 8439,
    "slug": "سيروم-هيالورنيك-و-كولاجين",
    "name": "سيروم هيالورنيك و كولاجين",
    "category": "skincare",
    "price": 75000,
    "description": null,
    "image": "/images/products/8439.webp",
    "imageSmall": "/images/products/8439-sm.webp",
    "featured": false,
    "concerns": [
      "ترطيب",
      "نضارة",
      "شد"
    ]
  },
  {
    "id": 8437,
    "slug": "سيروم-الكافيار-والحلزون",
    "name": "سيروم الكافيار والحلزون",
    "category": "skincare",
    "price": 75000,
    "description": null,
    "image": "/images/products/8437.webp",
    "imageSmall": "/images/products/8437-sm.webp",
    "featured": true,
    "concerns": [
      "نضارة",
      "شد",
      "ترطيب"
    ]
  },
  {
    "id": 8435,
    "slug": "مقطر-الاعشاب-للوجه",
    "name": "مقطر الاعشاب للوجه",
    "category": "skincare",
    "price": 50000,
    "description": null,
    "image": "/images/products/8435.webp",
    "imageSmall": "/images/products/8435-sm.webp",
    "featured": false,
    "concerns": [
      "ترطيب",
      "تنظيف",
      "تهدئة"
    ]
  },
  {
    "id": 8432,
    "slug": "مسك-الطهارة-أورانج",
    "name": "مسك الطهارة (أورانج)",
    "category": "skincare",
    "price": 60000,
    "description": "مسك الطهارة بلون أورانج … رائحة مميزة وقوية جداً جداً طيبة في نفس الوقت.. وتمنحك … . إحساس بالانتعاش يدوم طوال اليوم",
    "image": "/images/products/8432.webp",
    "imageSmall": "/images/products/8432-sm.webp",
    "featured": false,
    "concerns": [
      "عطور",
      "انتعاش"
    ]
  },
  {
    "id": 8430,
    "slug": "مسك-الطهارة-أبيض",
    "name": "مسك الطهارة (أبيض)",
    "category": "skincare",
    "price": 40000,
    "description": "مسك الطهارة الأبيض برائحة المسك الأصلية . رائحة نفاذة وطيبة في نفس الوقت وتمنحك إحساس بالانتعاش يدوم طوال اليوم",
    "image": "/images/products/8430.webp",
    "imageSmall": "/images/products/8430-sm.webp",
    "featured": false,
    "concerns": [
      "عطور",
      "انتعاش"
    ]
  },
  {
    "id": 8428,
    "slug": "جل-رموش",
    "name": "جل رموش",
    "category": "makeup",
    "price": 75000,
    "description": "جل لتغذية الرموش وتطويلها يستخدم للرموش العلوية والسفلية، لا يؤذي الجفون اذا لامسها أبدأ على العكس يعمل على شدّها، وتظهر النتائج بعد 15 يوم من الاستخدام اليومي المستمر قبل النوم، ويمكن استخدامه مرتين يومياً .. بعد شهرين نحصل على نتيجة رائعة وخارقة وفرق كبير ..",
    "image": "/images/products/8428.webp",
    "imageSmall": "/images/products/8428-sm.webp",
    "featured": false,
    "concerns": [
      "رموش",
      "تطويل",
      "تغذية"
    ]
  },
  {
    "id": 8426,
    "slug": "جل-حواجب",
    "name": "جل حواجب",
    "category": "makeup",
    "price": 60000,
    "description": null,
    "image": "/images/products/8426.webp",
    "imageSmall": "/images/products/8426-sm.webp",
    "featured": false,
    "concerns": [
      "حواجب",
      "تثبيت"
    ]
  },
  {
    "id": 8424,
    "slug": "مزيل-مكياج",
    "name": "مزيل مكياج",
    "category": "makeup",
    "price": 60000,
    "description": null,
    "image": "/images/products/8424.webp",
    "imageSmall": "/images/products/8424-sm.webp",
    "featured": false,
    "concerns": [
      "تنظيف",
      "مكياج"
    ]
  },
  {
    "id": 8421,
    "slug": "مورد-الخدود-والشفاه",
    "name": "مورد الخدود والشفاه",
    "category": "makeup",
    "price": 50000,
    "description": "عند الابتسام يرتفع الخد ونبقي الابتسامة حتى ندهن التنت على الخدود والشفايف بفرشاة سميكة أو باليد",
    "image": "/images/products/8421.webp",
    "imageSmall": "/images/products/8421-sm.webp",
    "featured": false,
    "concerns": [
      "مكياج",
      "توهج"
    ]
  },
  {
    "id": 8418,
    "slug": "برايمر",
    "name": "برايمر",
    "category": "makeup",
    "price": 60000,
    "description": "يستخدم على بشرة نظيفة قبل وضع المكياج بدقيقتين",
    "image": "/images/products/8418.webp",
    "imageSmall": "/images/products/8418-sm.webp",
    "featured": false,
    "concerns": [
      "مكياج",
      "تثبيت"
    ]
  },
  {
    "id": 8415,
    "slug": "فوند-طبي-واقي-من-الشمس",
    "name": "فوند طبي واقي من الشمس",
    "category": "makeup",
    "price": 150000,
    "description": "تكفي العلبة لمدة سنة نقطة واحدة كافية لتغطية الوجه نتيجته تظهر بعد ربع ساعة",
    "image": "/images/products/8415.webp",
    "imageSmall": "/images/products/8415-sm.webp",
    "variations": {
      "name": "الدرجة",
      "options": [
        {
          "id": "16972",
          "label": "فاتح",
          "price": 150000
        },
        {
          "id": "16973",
          "label": "غامق",
          "price": 150000
        }
      ]
    },
    "featured": true,
    "concerns": [
      "مكياج",
      "حماية من الشمس",
      "تغطية"
    ]
  }
];

export const getProduct = (slugOrId: string) =>
  products.find((product) => product.slug === slugOrId || String(product.id) === slugOrId);

export const getRelatedProducts = (product: Product, limit = 4) =>
  products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
