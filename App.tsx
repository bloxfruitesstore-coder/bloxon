
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, User as UserIcon, LogOut, Menu, X, LayoutDashboard, History, Lock, UserPlus, LogIn, Mail, Loader2, Bell, CheckCircle2, Shield, AlertTriangle, ShoppingCart, Trash2, Heart, ArrowRight, XCircle, Instagram, Globe } from 'lucide-react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import MyOrders from './pages/MyOrders';
import WishlistPage from './pages/Wishlist';
import About from './pages/About';
import { Product, User, Order, SiteSettings, Notification } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './constants';
import { supabase } from './supabase';
import { useLanguage } from './LanguageContext';

const LOGO_URL = "https://api.a0.dev/assets/image?text=Bloxon%20logo%20purple%20devil%20fruit%20gold%20circle%20coins%20dark%20background%20vector%20style";

// Custom Social Icons
const TikTokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.394 6.394 0 0 0-5.394 10.137 6.362 6.362 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

const App: React.FC = () => {
  const { t, language, setLanguage, dir } = useLanguage();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Initialize Cart and Wishlist from LocalStorage
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('blox_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('blox_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // We use a ref to prevent infinite loops when syncing state <-> DB
  const isHydratingFromDB = useRef(false);

  // 1. Persist Cart to LocalStorage & Supabase
  useEffect(() => {
    localStorage.setItem('blox_cart', JSON.stringify(cart));
    
    if (currentUser && !isHydratingFromDB.current) {
      const timer = setTimeout(() => {
        supabase.from('profiles').update({ cart_data: cart }).eq('id', currentUser.id)
          .then(({ error }) => { if(error) console.error("Auto-save cart error:", error); });
      }, 500); // Debounce saves (0.5s)
      return () => clearTimeout(timer);
    }
  }, [cart, currentUser]);

  // 2. Persist Wishlist to LocalStorage & Supabase
  useEffect(() => {
    localStorage.setItem('blox_wishlist', JSON.stringify(wishlist));
    
    if (currentUser && !isHydratingFromDB.current) {
      const timer = setTimeout(() => {
        supabase.from('profiles').update({ wishlist_data: wishlist }).eq('id', currentUser.id)
          .then(({ error }) => { if(error) console.error("Auto-save wishlist error:", error); });
      }, 500); // Debounce saves (0.5s)
      return () => clearTimeout(timer);
    }
  }, [wishlist, currentUser]);

  const fetchInitialData = useCallback(async () => {
    try {
      setDbError(null);
      
      // Create promises for all fetches
      const pPromise = supabase.from('products').select('*').order('name');
      const oPromise = supabase.from('orders').select('*').order('createdAt', { ascending: false });
      const sPromise = supabase.from('site_settings').select('*').single();
      const uPromise = supabase.from('profiles').select('*');

      // Create a timeout promise (15 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database connection timed out")), 15000)
      );

      // Race the data fetch against the timeout
      const [pRes, oRes, sRes, uRes] = await Promise.race([
        Promise.all([pPromise, oPromise, sPromise, uPromise]),
        timeoutPromise
      ]) as any;

      const { data: pData, error: pError } = pRes || {};
      const { data: oData, error: oError } = oRes || {};
      const { data: sData, error: sError } = sRes || {};
      const { data: userData, error: uError } = uRes || {};

      if (pError || oError || uError) {
        // Check for specific "relation does not exist" error
        const err = pError || oError || uError;
        if (err?.code === '42P01') {
          setDbError("جداول قاعدة البيانات غير موجودة. يرجى مراجعة ملف supabase.ts وتشغيل كود SQL.");
          console.error("Missing Tables Error:", err);
          return;
        }
      }

      // Merge Logic: Combine Initial Products with DB Products
      if (pData) {
        const mappedProducts = pData.map((p: any) => ({
            ...p,
            stockQuantity: p.stockQuantity ?? p.stockquantity ?? 0,
            inStock: p.inStock ?? p.instock ?? false,
            paymentMethods: p.paymentMethods ?? p.paymentmethods ?? ['ROBLOX'],
            rareItems: p.rareItems ?? p.rareitems ?? []
        }));

        const combinedMap = new Map();
        
        // 1. Add Initial Products first (Base Layer)
        INITIAL_PRODUCTS.forEach(p => combinedMap.set(p.id, p));

        // 2. Overwrite with DB products (DB Layer - takes precedence for edits)
        mappedProducts.forEach((p: Product) => combinedMap.set(p.id, p));

        setProducts(Array.from(combinedMap.values()));
      } else {
        setProducts(INITIAL_PRODUCTS);
      }

      if (oData) setOrders(oData as Order[]);
      if (sData) setSettings(sData as SiteSettings);
      
      if (userData) {
         const mappedUsers = userData.map((u: any) => ({
             ...u,
             isBanned: u.isBanned ?? u.isbanned ?? false,
             createdAt: u.createdAt ?? u.createdat
         }));
         setUsers(mappedUsers as User[]);
      }
    } catch (err) {
      console.warn("Supabase fetch skipped or timed out. Using local data.");
      // Fallback to initial products without showing a scary error in UI if it's just a timeout/connection issue
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async (userId: string) => {
    try {
        const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(20);
        if (data) setNotifications(data as Notification[]);
    } catch (e) {
        console.error("Notif fetch error", e);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: any, session: any) => {
      if (session) {
        const isAdminEmail = session.user.email?.toLowerCase() === 'asmar1samar2@gmail.com';
        
        // Try to fetch profile
        let profile = null;
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" - acceptable here
                console.warn("Profile fetch error:", error);
            }
            profile = data;
        } catch (e) {
            console.error("Unexpected profile fetch error", e);
        }

        // If profile doesn't exist, create it (Robust Fallback)
        if (!profile) {
          console.log("Profile missing on auth change, creating...");
          
          const metadataUsername = session.user.user_metadata?.username;
          const emailBase = session.user.email?.split('@')[0] || 'Player';
          const baseUsername = metadataUsername || emailBase;
          
          let newProfile = {
            id: session.user.id, 
            username: baseUsername, 
            email: session.user.email, 
            role: isAdminEmail ? 'ADMIN' : 'USER', 
            isBanned: false,
            cart_data: [],
            wishlist_data: []
          };

          try {
            // Attempt creation
            let { data: createdProfile, error: createErr } = await supabase.from('profiles').upsert(newProfile).select().single();
            
            // Handle Username Collision (Unique Constraint - Code 23505)
            if (createErr && createErr.code === '23505') {
               const randomSuffix = Math.floor(1000 + Math.random() * 9000);
               newProfile.username = `${baseUsername}_${randomSuffix}`;
               const retry = await supabase.from('profiles').upsert(newProfile).select().single();
               if (retry.data) createdProfile = retry.data;
               if (retry.error) createErr = retry.error;
            }

            if (createErr) {
                console.error("Create profile failed:", createErr);
                // Fallback to local object so user can at least proceed
                profile = newProfile;
            } else {
                profile = createdProfile || newProfile;
            }
          } catch (e) {
              console.error("Profile creation exception", e);
              profile = newProfile;
          }
        }

        if (profile) {
          // Fix camelCase keys for profile usage if needed
          if (profile.isbanned !== undefined) profile.isBanned = profile.isbanned;

          // CRITICAL FIX: Enforce Admin Role if email matches
          if (isAdminEmail && profile.role !== 'ADMIN') {
              // Try update DB but don't block
              supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', session.user.id).then(() => {});
              profile.role = 'ADMIN';
          }

          if (profile.isBanned) {
            await (supabase.auth as any).signOut();
            setCurrentUser(null);
            alert('حسابك محظور');
          } else {
            setCurrentUser(profile as User);
            fetchNotifications(profile.id);

            // SMART MERGE: DB Data + Local Data
            isHydratingFromDB.current = true;
            
            const serverCart = (profile.cart_data as Product[]) || [];
            const serverWishlist = (profile.wishlist_data as string[]) || [];

            setCart(prevLocal => {
              const combined = [...prevLocal, ...serverCart];
              const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
              return unique;
            });

            setWishlist(prevLocal => {
              const combined = [...prevLocal, ...serverWishlist];
              return [...new Set(combined)];
            });

            setTimeout(() => { isHydratingFromDB.current = false; }, 500);
          }
        }
      } else {
        setCurrentUser(null);
        setNotifications([]);
      }
    });
    return () => { subscription.unsubscribe(); };
  }, [fetchInitialData, fetchNotifications]);

  const handleLogout = async () => {
    if (currentUser) {
        await Promise.all([
            supabase.from('profiles').update({ cart_data: cart }).eq('id', currentUser.id),
            supabase.from('profiles').update({ wishlist_data: wishlist }).eq('id', currentUser.id)
        ]);
    }
    await (supabase.auth as any).signOut();
    setCurrentUser(null);
    setIsCartOpen(false);
    setCart([]);
    setWishlist([]);
    navigate('/');
  };

  const addToCart = (product: Product) => {
    if (cart.some(p => p.id === product.id)) {
      alert('هذا المنتج موجود بالفعل في السلة');
      return;
    }
    setCart(prev => [...prev, product]);
    setIsCartOpen(true);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
      ? prev.filter(id => id !== productId) 
      : [...prev, productId]
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((acc, curr) => acc + curr.price, 0);

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    navigate('/shop', { state: { openCheckout: true } });
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-500 font-black">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
        <div className="bg-[#111] p-8 rounded-3xl shadow-xl text-center max-w-lg border border-red-900/30">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">تنبيه النظام</h2>
          <p className="text-gray-400 font-bold mb-6">{dbError}</p>
          <div className="text-left bg-black text-green-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-40 mb-4 border border-gray-800" dir="ltr">
            {`Error: relation "profiles" does not exist`}
          </div>
          <p className="text-sm text-gray-500">قم بنسخ كود SQL من ملف <code>supabase.ts</code> وقم بتشغيله في لوحة تحكم Supabase.</p>
        </div>
      </div>
    );
  }

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className={`min-h-screen flex flex-col relative bg-[#020202] text-white ${language === 'ar' ? 'font-tajawal' : 'font-sans'}`} dir={dir}>
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-blue-900/20 shadow-lg shadow-blue-900/5">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Bloxon Logo" className="h-16 w-16 object-contain rounded-2xl p-1 bg-black/50 border border-blue-900/30" />
            <div className={`flex flex-col ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <span className="text-2xl font-black text-white tracking-tighter">Blox<span className="text-blue-600">on</span></span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Marketplace</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="font-bold text-gray-300 px-4 py-2 hover:text-blue-500 transition-colors">{t('nav_home')}</Link>
            <Link to="/shop" className="font-bold text-gray-300 px-4 py-2 hover:text-blue-500 transition-colors">{t('nav_shop')}</Link>
            {currentUser && <Link to="/orders" className="font-bold text-gray-300 px-4 py-2 hover:text-blue-500 transition-colors">{t('nav_orders')}</Link>}
            {currentUser?.role === 'ADMIN' && <Link to="/admin" className="font-bold text-gray-300 px-4 py-2 hover:text-blue-500 transition-colors">{t('nav_admin')}</Link>}
            
            <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'mr-4 pl-4 border-l' : 'ml-4 pr-4 border-r'} border-gray-800`}>
               <button onClick={toggleLanguage} className="p-2.5 rounded-xl bg-[#151515] text-gray-400 hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700 flex items-center gap-2 font-bold text-xs">
                 <Globe size={18} />
                 <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
               </button>

               <Link to="/wishlist" className="relative p-2.5 rounded-xl bg-[#151515] text-gray-400 hover:bg-red-900/20 hover:text-red-500 transition-all border border-transparent hover:border-red-900/30">
                  <Heart size={20} className={wishlist.length > 0 ? "text-red-500 fill-current" : ""} />
                  {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#151515]">{wishlist.length}</span>}
               </Link>

               <button onClick={() => setIsCartOpen(!isCartOpen)} className="relative p-2.5 rounded-xl bg-[#151515] text-gray-400 hover:bg-blue-900/20 hover:text-blue-500 transition-all border border-transparent hover:border-blue-900/30">
                  <ShoppingCart size={20} />
                  {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#151515]">{cart.length}</span>}
               </button>

               {currentUser && (
                <div className="relative">
                  <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2.5 rounded-xl bg-[#151515] text-gray-400 hover:bg-blue-900/20 hover:text-blue-500 transition-all relative border border-transparent hover:border-blue-900/30">
                    <Bell size={20} />
                    {notifications.filter(n => !n.isRead).length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#151515] animate-pulse">{notifications.filter(n => !n.isRead).length}</span>}
                  </button>
                </div>
              )}

              {currentUser && (
                <div className="flex items-center gap-3">
                  <div className={`text-${dir === 'rtl' ? 'right' : 'left'}`}>
                    <span className="text-xs text-gray-500 block">{t('welcome')}</span>
                    <span className="text-sm font-bold text-gray-300">{currentUser.username}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-900/20 rounded-full transition-colors"><LogOut size={20} /></button>
                </div>
              )}
            </div>
          </nav>

          <button className="md:hidden p-2 text-gray-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top-10">
           <div className="flex flex-col gap-6 text-center text-xl font-black">
              <Link to="/" className="text-gray-300 hover:text-blue-500 py-2 border-b border-gray-800">{t('nav_home')}</Link>
              <Link to="/shop" className="text-gray-300 hover:text-blue-500 py-2 border-b border-gray-800">{t('nav_shop')}</Link>
              {currentUser && <Link to="/orders" className="text-gray-300 hover:text-blue-500 py-2 border-b border-gray-800">{t('nav_orders')}</Link>}
              {currentUser?.role === 'ADMIN' && <Link to="/admin" className="text-gray-300 hover:text-blue-500 py-2 border-b border-gray-800">{t('nav_admin')}</Link>}
              <Link to="/about" className="text-gray-300 hover:text-blue-500 py-2 border-b border-gray-800">{t('nav_about')}</Link>
              
              <button onClick={toggleLanguage} className="text-gray-300 hover:text-blue-500 py-2 border-b border-gray-800 flex items-center justify-center gap-2">
                 <Globe size={20} /> {language === 'ar' ? 'Switch to English' : 'تغيير للعربية'}
              </button>

              {currentUser && (
                 <button onClick={handleLogout} className="text-red-500 py-2 mt-4 font-bold flex items-center justify-center gap-2">
                    <LogOut size={20} /> {t('nav_logout')}
                 </button>
              )}

              <div className="flex justify-center gap-6 mt-8">
                  <a href="https://www.instagram.com/bloxstore87?igsh=MWh4bTM0d3I0OTgwcA==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center text-pink-500 border border-gray-800"><Instagram size={20} /></a>
                  <a href="https://tiktok.com/@blox.store92" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center text-white border border-gray-800"><TikTokIcon size={20} /></a>
              </div>
           </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)}>
          <div className={`absolute top-0 ${dir === 'rtl' ? 'left-0 border-r' : 'right-0 border-l'} h-full w-full max-w-md bg-[#0a0a0a] shadow-2xl border-gray-800 animate-in ${dir === 'rtl' ? 'slide-in-from-left' : 'slide-in-from-right'} duration-300`} onClick={e => e.stopPropagation()}>
            <div className="h-full flex flex-col">
              <div className="p-8 border-b border-gray-800 flex items-center justify-between">
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[#151515] rounded-full text-gray-400 transition-colors">
                  <X size={24} />
                </button>
                <div className={`text-${dir === 'rtl' ? 'right' : 'left'}`}>
                  <h2 className={`text-2xl font-black text-white flex items-center ${dir === 'rtl' ? 'justify-end' : 'justify-start'} gap-3`}>
                    {t('cart_title')} <ShoppingCart size={24} className="text-blue-600" />
                  </h2>
                  <p className="text-xs text-gray-500 font-bold mt-1">{t('cart_items_count').replace('{{count}}', cart.length.toString())}</p>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                    <div className="w-24 h-24 bg-[#111] rounded-full flex items-center justify-center text-gray-600 border border-gray-800">
                      <ShoppingBag size={48} />
                    </div>
                    <p className="text-gray-500 font-black text-xl">{t('cart_empty')}</p>
                    <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold text-sm underline">{t('cart_start_shopping')}</button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-[#111] p-4 rounded-3xl border border-gray-800 group hover:border-blue-900/50 transition-colors">
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 transition-colors self-center p-2 opacity-0 group-hover:opacity-100">
                        <Trash2 size={20} />
                      </button>
                      <div className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <h4 className="font-black text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.type === 'ACCOUNT' ? t('account') : item.type === 'STYLE' ? t('style') : t('sword')}</p>
                        <p className="text-lg font-black text-green-500 mt-2">{item.price > 0 ? `${item.price} Robux` : t('cart_custom_price')}</p>
                      </div>
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-700" />
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-[#111] border-t border-gray-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-500 tracking-tighter">{totalPrice > 0 ? `${totalPrice} Robux` : t('cart_custom_price')}</span>
                    <span className="text-gray-400 font-black">{t('cart_total')}</span>
                  </div>
                  <button 
                    onClick={handleGoToCheckout}
                    className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {t('cart_checkout')} <ArrowRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home settings={settings} products={products} />} />
          <Route path="/shop" element={<Shop products={products} currentUser={currentUser} cart={cart} addToCart={addToCart} clearCart={clearCart} onOrderCreate={async (o) => { await supabase.from('orders').insert(o); fetchInitialData(); }} settings={settings} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} cart={cart} />} />
          <Route path="/orders" element={<MyOrders orders={orders} currentUser={currentUser} />} />
          <Route path="/admin/*" element={<AdminDashboard currentUser={currentUser} products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} users={users} setUsers={setUsers} settings={settings} setSettings={setSettings} refreshData={fetchInitialData} />} />
          <Route path="/login" element={<Auth setCurrentUser={setCurrentUser} currentUser={currentUser} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer className="bg-[#050505] border-t border-blue-900/20 py-12 text-center text-gray-500 text-xs">
        <div className="flex justify-center gap-4 mb-8">
            <a href="https://www.instagram.com/bloxstore87?igsh=MWh4bTM0d3I0OTgwcA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#111] rounded-xl flex items-center justify-center text-pink-500 hover:scale-110 transition-all border border-gray-800 hover:border-pink-500/50 shadow-sm hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                <Instagram size={20} />
            </a>
            <a href="https://tiktok.com/@blox.store92" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#111] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all border border-gray-800 hover:border-white/50 shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <TikTokIcon size={20} />
            </a>
        </div>

        <div className="flex justify-center gap-6 mb-4 font-bold">
            <Link to="/" className="hover:text-blue-500 transition-colors">{t('nav_home')}</Link>
            <Link to="/shop" className="hover:text-blue-500 transition-colors">{t('nav_shop')}</Link>
            <Link to="/about" className="hover:text-blue-500 transition-colors">{t('nav_about')}</Link>
        </div>
        &copy; {new Date().getFullYear()} Bloxon Market. {t('footer_rights')}.
      </footer>
    </div>
  );
};

const Auth: React.FC<{ setCurrentUser: (u: User | null) => void; currentUser: User | null }> = ({ setCurrentUser, currentUser }) => {
  const { t, dir } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/shop', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { data, error: loginErr } = await (supabase.auth as any).signInWithPassword({ 
            email: email.trim(), 
            password: password.trim() 
        });
        
        if (loginErr) throw loginErr;
        
        if (data.session) {
           navigate('/shop', { replace: true });
        }
      } else {
        const { data: signupData, error: signupErr } = await (supabase.auth as any).signUp({ 
          email: email.trim(), 
          password: password.trim(), 
          options: { data: { username: username, full_name: username } } 
        });
        
        if (signupErr) throw signupErr;
        
        if (signupData.user) {
          alert(t('auth_success'));
          if (signupData.session) {
             navigate('/shop', { replace: true });
          } else {
             setIsLogin(true); 
          }
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = err.message;
      if (msg === "Invalid login credentials") msg = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      if (msg?.includes("already registered")) msg = "هذا البريد الإلكتروني مسجل بالفعل";
      if (msg?.includes("Password should be")) msg = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
      
      setError(msg || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-xl">
        <div className="bg-[#0a0a0a] rounded-[4rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-gray-800 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"></div>
          <div className={`p-10 md:p-16 text-${dir === 'rtl' ? 'right' : 'left'}`}>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-10 text-center">{isLogin ? t('login_title') : t('signup_title')}</h2>
            
            {error && <div className="mb-6 p-4 bg-red-900/20 text-red-400 rounded-2xl text-xs font-bold border border-red-500/30 text-center">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className={`w-full px-6 py-4 rounded-2xl border bg-[#151515] outline-none text-${dir === 'rtl' ? 'right' : 'left'} font-bold text-white border-gray-800 focus:border-blue-600 transition-colors placeholder-gray-600`} 
                  placeholder={t('username')}
                  required 
                />
              )}
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className={`w-full px-6 py-4 rounded-2xl border bg-[#151515] outline-none text-${dir === 'rtl' ? 'right' : 'left'} font-bold text-white border-gray-800 focus:border-blue-600 transition-colors placeholder-gray-600`} 
                placeholder={t('email')}
                required 
              />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`w-full px-6 py-4 rounded-2xl border bg-[#151515] outline-none text-${dir === 'rtl' ? 'right' : 'left'} font-bold text-white border-gray-800 focus:border-blue-600 transition-colors placeholder-gray-600`} 
                placeholder={t('password')} 
                required 
              />
              <button disabled={isLoading} type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? t('btn_login') : t('btn_signup')}
              </button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors">
              {isLogin ? t('switch_to_signup') : t('switch_to_login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
