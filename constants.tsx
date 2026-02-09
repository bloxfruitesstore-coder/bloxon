
import { Product, SiteSettings } from './types';

export const INITIAL_SETTINGS: SiteSettings = {
  binanceWallet: '',
  binanceQR: '',
  robloxGamePassUrl: 'https://www.roblox.com/game-pass/configure',
  importantNote: 'يرجى التأكد من ادخال اسم المستخدم الصحيح.',
  welcomeMessage: 'مرحباً بكم في متجر Bloxon',
  serverStatus: 'ONLINE',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: ''
};

export const INITIAL_PRODUCTS: Product[] = [
  // --- ACCOUNTS ---
  {
    id: 'acc-custom',
    name: 'طلب حساب خاص (Custom Order)',
    description: 'صمم حسابك بنفسك! اطلب ليفل معين (مثلاً 2550)، فواكه محددة (Kitsune)، أو سيوف نادرة. اكتب تفاصيل طلبك في خانة "الملاحظات" عند الدفع وسيتم تحديد السعر.',
    image: 'https://api.a0.dev/assets/image?text=mystery%20box%20glowing%20with%20question%20mark%20blox%20fruits%20style%20dark%20background%20treasure',
    price: 0, // 0 indicates custom pricing
    type: 'ACCOUNT',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 999
  },

  // ================= FIGHTING STYLES (الأساليب) =================
  {
    id: 'style-godhuman',
    name: 'أسلوب الإله البشر (Godhuman)',
    description: 'الأسلوب الأقوى في اللعبة حالياً. كومبو خيالي، سرعة مرعبة، وضربات تحطم الدفاع.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/4/41/Godhuman.png/revision/latest/scale-to-width-down/125?cb=20220913103851',
    price: 2500,
    type: 'STYLE',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 5
  },
  {
    id: 'style-sanguine',
    name: 'الفن الدموي (Sanguine Art)',
    description: 'أسلوب مصاصي الدماء. يمتاز بسرقة الحياة (Life Steal) ومدى ضربات واسع.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/8/83/Sanguine_Art.png/revision/latest/scale-to-width-down/125?cb=20231025151119',
    price: 2200,
    type: 'STYLE',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 5
  },
  {
    id: 'style-dragontalon',
    name: 'مخلب التنين (Dragon Talon)',
    description: 'نيران التنين الحارقة. ضرر (Damage) عالي جداً، وصناديق اصطدام (Hitboxes) ممتازة.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/e/e9/Dragon_Talon.png/revision/latest/scale-to-width-down/125?cb=20220228215538',
    price: 1500,
    type: 'STYLE',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 10
  },
  {
    id: 'style-electricclaw',
    name: 'المخلب الكهربائي (Electric Claw)',
    description: 'الأسرع في الحركة والهجوم. مثالي للمطاردة والضغط المستمر على الخصم.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/0/00/Electric_Claw.png/revision/latest/scale-to-width-down/125?cb=20220228215956',
    price: 1200,
    type: 'STYLE',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 10
  },
  {
    id: 'style-sharkman',
    name: 'كاراتيه الرجل القرش (Sharkman Karate)',
    description: 'ملك السرعة في الضربات العادية (M1). الأفضل بلا منازع لتجميع الموارد (Grinding) مع البودا.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/b/b3/Sharkman_Karate.png/revision/latest/scale-to-width-down/125?cb=20220228233224',
    price: 800,
    type: 'STYLE',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 15
  },

  // ================= SWORDS (السيوف) =================
  {
    id: 'sword-cdk',
    name: 'سيف CDK (Cursed Dual Katana)',
    description: 'السيف الأسطوري المزدوج. يعتبر أقوى سيف في اللعبة للـ PvP. ضرر عالي جداً وكسر هاكي.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/7/74/Cursed_Dual_Katana.png/revision/latest/scale-to-width-down/110?cb=20241223032242',
    price: 1800,
    type: 'SWORD',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 5
  },
 
  {
    id: 'sword-sharkanchor',
    name: 'مرساة القرش (Shark Anchor)',
    description: 'سلاح أسطوري بمهارات سحب الخصم. ممتاز للسيطرة على المعركة والكومبوهات الجوية.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/e/ee/Shark_Anchor.png/revision/latest/scale-to-width-down/110?cb=20241223143202',
    price: 1400,
    type: 'SWORD',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 8
  },
  {
    id: 'sword-ttk',
    name: 'ثلاثية الكاتانا الحقيقية (True Triple Katana)',
    description: 'أسلوب زورو الشهير. ثلاث سيوف بضرر فتاك وإعصار تنين مدمر.',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/b/b2/True_Triple_Katana.png/revision/latest/scale-to-width-down/110?cb=20241223032727',
    price: 1100,
    type: 'SWORD',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 10
  },
  {
    id: 'sword-hallowscythe',
    name: 'منجل الهالوين (Hallow Scythe)',
    description: 'سلاح سريع جداً ومناسب للكومبوهات السريعة. (Mythical Sword).',
    image: 'https://static.wikia.nocookie.net/roblox-blox-piece/images/c/c5/Hallow_Scythe.png/revision/latest/scale-to-width-down/110?cb=20241223061516',
    price: 900,
    type: 'SWORD',
    paymentMethods: ['ROBLOX'],
    inStock: true,
    stockQuantity: 6
  }
];
