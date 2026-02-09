
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    nav_home: "الرئيسية",
    nav_shop: "المتجر",
    nav_orders: "طلباتي",
    nav_admin: "لوحة التحكم",
    nav_wishlist: "المفضلة",
    nav_about: "من نحن",
    nav_login: "دخول",
    nav_logout: "خروج",
    cart_title: "سلة المشتريات",
    cart_items_count: "لديك {{count}} منتجات في السلة",
    cart_empty: "السلة فارغة حالياً",
    cart_start_shopping: "ابدأ التسوق الآن",
    cart_total: "المجموع الإجمالي",
    cart_checkout: "إتمام الطلب",
    cart_in_cart: "في السلة",
    cart_add: "أضف للسلة",
    cart_custom_price: "حسب الطلب",
    footer_rights: "جميع الحقوق محفوظة",
    welcome: "مرحباً",
    store_status: "حالة المتجر",
    hero_badge: "متجر Bloxon الموثوق",
    hero_title: "امتلك أقوى حسابات",
    hero_subtitle: "Bloxon",
    hero_desc: "وجهتك الأولى والموثوقة لامتلاك أقوى حسابات وأساليب Blox Fruits بأمان وسرعة خيالية.",
    hero_cta: "تصفح المتجر الآن 🛒",
    sect_guaranteed: "مضمونة 100%",
    sect_accounts: "حسابات Blox Fruits نادرة",
    view_all: "عرض الكل",
    buy_now: "اشتر الآن",
    level: "ليفل",
    no_products: "لا توجد منتجات حالياً",
    login_title: "دخول اللاعبين",
    signup_title: "إنشاء حساب",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    btn_login: "دخول",
    btn_signup: "تسجيل",
    switch_to_signup: "سجل حساباً جديداً",
    switch_to_login: "ادخل بحسابك",
    auth_success: "تم التسجيل بنجاح! جاري تسجيل الدخول...",
    account: "حساب",
    style: "أسلوب قتالي",
    sword: "سيف أسطوري",
  },
  en: {
    nav_home: "Home",
    nav_shop: "Shop",
    nav_orders: "My Orders",
    nav_admin: "Admin Panel",
    nav_wishlist: "Wishlist",
    nav_about: "About Us",
    nav_login: "Login",
    nav_logout: "Logout",
    cart_title: "Shopping Cart",
    cart_items_count: "You have {{count}} items in cart",
    cart_empty: "Your cart is currently empty",
    cart_start_shopping: "Start Shopping Now",
    cart_total: "Total Amount",
    cart_checkout: "Checkout",
    cart_in_cart: "In Cart",
    cart_add: "Add to Cart",
    cart_custom_price: "On Request",
    footer_rights: "All Rights Reserved",
    welcome: "Welcome",
    store_status: "Store Status",
    hero_badge: "Trusted Bloxon Store",
    hero_title: "Own the Strongest",
    hero_subtitle: "Bloxon Market",
    hero_desc: "Your #1 trusted destination to own the strongest Blox Fruits accounts and fighting styles safely and instantly.",
    hero_cta: "Browse Shop Now 🛒",
    sect_guaranteed: "100% Guaranteed",
    sect_accounts: "Rare Blox Fruits Accounts",
    view_all: "View All",
    buy_now: "Buy Now",
    level: "Lvl",
    no_products: "No products currently available",
    login_title: "Player Login",
    signup_title: "Create Account",
    username: "Username",
    email: "Email Address",
    password: "Password",
    btn_login: "Login",
    btn_signup: "Register",
    switch_to_signup: "Register New Account",
    switch_to_login: "Login to Account",
    auth_success: "Registered Successfully! Logging in...",
    account: "Account",
    style: "Fighting Style",
    sword: "Legendary Sword",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_lang') as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', language);
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      dir: language === 'ar' ? 'rtl' : 'ltr' 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
