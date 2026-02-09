
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Product, User, Order, SiteSettings } from '../types';
import { ShoppingCart, CheckCircle, Info, X as CloseIcon, Swords, Star, ShieldCheck, Trophy, Sparkles, Trash2, LayoutGrid, UserCircle, ArrowUp, Heart, ShoppingBag, Globe, Copy, Instagram, MessageSquare, StickyNote, Mail, Sword } from 'lucide-react';

// Custom TikTok Icon
const TikTokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.394 6.394 0 0 0-5.394 10.137 6.362 6.362 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

interface ShopProps {
  products: Product[];
  currentUser: User | null;
  cart: Product[];
  addToCart: (p: Product) => void;
  clearCart: () => void;
  onOrderCreate: (order: Order) => Promise<void>;
  settings: SiteSettings;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
}

const Shop: React.FC<ShopProps> = ({ products, currentUser, cart, addToCart, clearCart, onOrderCreate, settings, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filter, setFilter] = useState<'ALL' | 'ACCOUNT' | 'STYLE' | 'SWORD'>('ALL');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'DETAILS' | 'PLATFORM'>('DETAILS');
  
  const [robloxUsername, setRobloxUsername] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // State to hold order details for the summary view
  const [lastOrderInfo, setLastOrderInfo] = useState<{ids: string[], items: Product[], total: number} | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
    }
    if (location.state?.openCheckout) {
      setIsCheckoutOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    const isOutOfStock = !product.inStock || ((product.type === 'STYLE' || product.type === 'SWORD') && product.stockQuantity <= 0);
    if (isOutOfStock) {
      alert('عذراً، هذا المنتج غير متوفر حالياً.');
      return;
    }
    addToCart(product);
  };

  const handleSubmitOrders = async () => {
    const orderEmail = currentUser?.email || email;
    if (cart.length === 0 || !robloxUsername || !country || !orderEmail) {
        alert("يرجى تعبئة جميع البيانات المطلوبة");
        return;
    }
    
    // 1. Prepare Data
    const generatedIds: string[] = [];
    const orderItems = [...cart]; 
    const currentTotal = orderItems.reduce((acc, curr) => acc + curr.price, 0);

    const ordersToCreate = cart.map(product => {
      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      generatedIds.push(orderId);
      
      return {
        id: orderId,
        userId: currentUser?.id, 
        userName: currentUser?.username || 'Guest',
        userEmail: orderEmail,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        paymentMethod: 'ROBLOX' as const,
        status: 'PENDING_PAYMENT' as const,
        robloxUsername: robloxUsername,
        country: country,
        notes: notes,
        createdAt: new Date().toISOString()
      };
    });

    // 2. Update UI Immediately (Instant Feedback)
    setLastOrderInfo({
      ids: generatedIds,
      items: orderItems,
      total: currentTotal
    });
    
    clearCart();
    setCheckoutStep('PLATFORM');
    
    // 3. Save to DB in background (Fire & Forget)
    Promise.all(ordersToCreate.map(o => onOrderCreate(o)))
      .catch(err => console.error("Background Save Error:", err));
  };

  const generateOrderText = () => {
    if (!lastOrderInfo) return '';
    const orderEmail = currentUser?.email || email;
    
    const itemsList = lastOrderInfo.items.map(p => `- ${p.name} (${p.price > 0 ? p.price + ' R' : 'حسب الطلب'})`).join('\n');
    
    return `مرحباً، أريد إتمام طلبي من المتجر 🛒
------------------
👤 المستخدم: ${robloxUsername}
🌍 الدولة: ${country}
📧 الإيميل: ${orderEmail}

📦 الطلبات:
${itemsList}

📝 ملاحظات: ${notes || 'لا يوجد'}

💰 المجموع: ${lastOrderInfo.total > 0 ? lastOrderInfo.total + ' Robux' : 'يحدد لاحقاً'}
🆔 أرقام الطلب: ${lastOrderInfo.ids.join(', ')}
------------------
يرجى تزويدي بطريقة الدفع لإكمال العملية.`;
  };

  const handleCopyText = async () => {
    const text = generateOrderText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const filteredProducts = products.filter(p => filter === 'ALL' || p.type === filter);

  return (
    <div className="min-h-screen bg-[#020202] py-16 px-4 relative">
      <div className="max-w-7xl mx-auto mb-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-500 px-4 py-1.5 rounded-full border border-blue-900/30">
          <Sparkles size={16} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">المتجر الرسمي</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
          سوق <span className="text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]">Bloxon</span>
        </h1>
        <p className="text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed">
          حسابات ليفل ماكس، وأساليب قتالية، وسيوف نادرة. تسليم آمن وسريع 100%.
        </p>
      </div>

      <div className="max-w-7xl mx-auto mb-12 flex flex-wrap justify-center gap-4">
        <button onClick={() => setFilter('ALL')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-[#111] text-gray-500 hover:bg-[#1a1a1a]'}`}><LayoutGrid size={18} /> الكل</button>
        <button onClick={() => setFilter('ACCOUNT')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${filter === 'ACCOUNT' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-[#111] text-gray-500 hover:bg-[#1a1a1a]'}`}><UserCircle size={18} /> الحسابات</button>
        <button onClick={() => setFilter('STYLE')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${filter === 'STYLE' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-[#111] text-gray-500 hover:bg-[#1a1a1a]'}`}><Swords size={18} /> الأساليب</button>
        <button onClick={() => setFilter('SWORD')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${filter === 'SWORD' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-[#111] text-gray-500 hover:bg-[#1a1a1a]'}`}><Sword size={18} /> السيوف</button>
      </div>

      <div className="max-w-7xl mx-auto min-h-[400px]">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
             <div className="w-32 h-32 bg-[#0a0a0a] rounded-full flex items-center justify-center text-gray-700 mb-8 border border-gray-800">
                <ShoppingBag size={64} />
             </div>
             <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">لا توجد منتجات حالياً</h2>
             <p className="text-gray-500 font-bold max-w-xs">عذراً، المتجر فارغ في هذا القسم حالياً. يرجى العودة لاحقاً!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((product) => {
              const isOutOfStock = !product.inStock || ((product.type === 'STYLE' || product.type === 'SWORD') && product.stockQuantity <= 0);
              const isInCart = cart.some(p => p.id === product.id);
              const isWishlisted = wishlist.includes(product.id);
              
              const getButtonText = () => {
                if (isOutOfStock) return 'نفذ';
                if (isInCart) return 'في السلة';
                if (product.type === 'ACCOUNT') return 'Buy Account';
                if (product.type === 'STYLE') return 'Buy Style';
                return 'Buy Sword';
              };

              // Determine color scheme based on type
              const getTypeColor = () => {
                 if (product.type === 'ACCOUNT') return 'bg-orange-600';
                 if (product.type === 'STYLE') return 'bg-red-600';
                 if (product.type === 'SWORD') return 'bg-purple-600';
                 return 'bg-blue-600';
              };
              
              const typeColorClass = getTypeColor();
              const badgeText = product.type === 'ACCOUNT' ? 'حساب أسطوري' : product.type === 'STYLE' ? 'أسلوب قتالي' : 'سيف نادر';

              return (
                <div key={product.id} className={`group relative bg-[#0a0a0a] rounded-[3.5rem] border border-gray-800 shadow-lg transition-all duration-500 hover:border-blue-900/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-3 flex flex-col ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
                  <div className="relative h-80 m-4 rounded-[2.8rem] overflow-hidden bg-[#111]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-6 left-6 p-3 rounded-2xl transition-all shadow-xl backdrop-blur-md z-10 border border-white/10 ${isWishlisted ? 'bg-red-600 text-white scale-110' : 'bg-black/60 text-gray-400 hover:text-red-500 hover:bg-black/80'}`}
                    >
                      <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>

                    <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                      <div className={`backdrop-blur px-5 py-2 rounded-2xl text-[10px] font-black shadow-xl flex items-center gap-2 border border-white/10 ${product.type === 'ACCOUNT' ? 'bg-orange-600/90 text-white' : product.type === 'STYLE' ? 'bg-red-600/80 text-white' : 'bg-purple-600/80 text-white'}`}>
                         <ShieldCheck size={14} />
                         {badgeText}
                      </div>
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <span className="bg-white text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl">نفذ</span>
                      </div>
                    )}
                  </div>

                  <div className="p-10 pt-4 flex flex-col flex-grow text-right">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">PRO: {product.id}</span>
                    </div>
                    
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">{product.name}</h3>
                    <p className="text-gray-500 text-sm font-bold mb-8 leading-relaxed line-clamp-2">{product.description}</p>

                    <div className="mt-auto space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-left">القيمة</span>
                          <span className="text-4xl font-black text-green-500 tracking-tighter">{product.price > 0 ? `${product.price} Robux` : 'حسب الطلب'}</span>
                        </div>
                        {product.level && (
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">المستوى</span>
                            <span className="text-xl font-black text-blue-500">LVL {product.level}</span>
                          </div>
                        )}
                      </div>

                      <button onClick={() => handleAddToCart(product)} disabled={isOutOfStock || isInCart} className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${isOutOfStock ? 'bg-[#151515] text-gray-600 cursor-not-allowed shadow-none' : isInCart ? 'bg-green-900/20 text-green-500 border border-green-900/50' : `${typeColorClass} text-white hover:opacity-90`}`}>
                        {isInCart ? <CheckCircle size={20} /> : <ShoppingCart size={20} />}
                        {getButtonText()}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={scrollToTop} className={`fixed bottom-8 right-8 z-[100] p-4 bg-blue-600 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:-translate-y-2 transition-all duration-300 flex items-center justify-center group ${showScrollTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`} aria-label="العودة للأعلى">
        <ArrowUp size={24} className="group-hover:animate-bounce" />
      </button>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111] w-full max-w-2xl rounded-[4rem] shadow-2xl border border-gray-800 overflow-hidden relative transition-all duration-300">
            <div className="bg-blue-600 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <button onClick={() => { setIsCheckoutOpen(false); setCheckoutStep('DETAILS'); }} className="absolute top-8 left-8 p-3 bg-black/20 rounded-full hover:bg-black/40 transition-colors z-20"><CloseIcon size={24} /></button>
              <div className="text-right relative z-10">
                <span className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2 block">
                  {checkoutStep === 'DETAILS' ? 'الخطوة 1 من 2' : 'الخطوة 2 من 2'}
                </span>
                <h3 className="text-4xl font-black tracking-tighter">
                  {checkoutStep === 'DETAILS' ? 'بيانات الطلب' : 'تأكيد وإرسال'}
                </h3>
              </div>
            </div>

            <div className="p-10">
                {checkoutStep === 'DETAILS' ? (
                  <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="bg-[#151515] p-5 rounded-3xl border border-gray-800 text-right">
                        <p className="text-gray-400 font-bold text-xs leading-relaxed">
                          يرجى تعبئة البيانات بدقة. سيتم استخدام اسم Roblox لتسليم الطلب. يمكنك إضافة أي ملاحظات أو تخصيصات في خانة الملاحظات.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="relative group">
                             <UserCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                             <input type="text" value={robloxUsername} onChange={(e) => setRobloxUsername(e.target.value)} placeholder="اسمك في Roblox (Username)..." className="w-full px-8 py-5 pr-14 rounded-[2rem] border border-gray-700 bg-[#151515] focus:bg-[#1a1a1a] focus:border-blue-500 outline-none font-black text-right text-white placeholder-gray-600 transition-all" />
                        </div>
                        <div className="relative group">
                             <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                             <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="الدولة / Country..." className="w-full px-8 py-5 pr-14 rounded-[2rem] border border-gray-700 bg-[#151515] focus:bg-[#1a1a1a] focus:border-blue-500 outline-none font-black text-right text-white placeholder-gray-600 transition-all" />
                        </div>
                        <div className="relative group">
                             <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني..." className="w-full px-8 py-5 pr-14 rounded-[2rem] border border-gray-700 bg-[#151515] focus:bg-[#1a1a1a] focus:border-blue-500 outline-none font-black text-right text-white placeholder-gray-600 transition-all" />
                        </div>
                        <div className="relative group">
                             <StickyNote className="absolute right-5 top-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                             <textarea 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)} 
                                placeholder="ملاحظات إضافية (تخصيص الحساب، الفواكه المطلوبة، إلخ)..." 
                                className="w-full px-8 py-5 pr-14 rounded-[2rem] border border-gray-700 bg-[#151515] focus:bg-[#1a1a1a] focus:border-blue-500 outline-none font-bold text-right text-white placeholder-gray-600 transition-all min-h-[120px] resize-none"
                             />
                        </div>
                    </div>

                    <button onClick={handleSubmitOrders} disabled={!robloxUsername || !country || !email || cart.length === 0} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl disabled:bg-gray-800 disabled:text-gray-600 text-lg hover:bg-blue-500 transition-all mt-4 flex items-center justify-center gap-2">
                      متابعة <ArrowUp className="-rotate-90" size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
                        <CheckCircle size={40} />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white">تم إنشاء الطلب بنجاح!</h3>
                        <p className="text-gray-500 font-bold text-sm max-w-md mx-auto">
                            الخطوة الأخيرة: انسخ تفاصيل الطلب أدناه وأرسلها لنا عبر انستقرام أو تيك توك لإتمام عملية الدفع والاستلام.
                        </p>
                    </div>

                    <div className="w-full relative group">
                        <textarea 
                            readOnly 
                            value={generateOrderText()} 
                            className="w-full h-48 bg-[#151515] border border-gray-800 rounded-3xl p-6 text-right text-sm font-mono text-gray-300 outline-none resize-none focus:border-blue-500/50 transition-colors"
                        />
                        <button 
                            onClick={handleCopyText}
                            className={`absolute bottom-4 left-4 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                        >
                            {copied ? 'تم النسخ!' : 'نسخ النص'} <Copy size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <a 
                            href="https://www.instagram.com/bloxstore87?igsh=MWh4bTM0d3I0OTgwcA==" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gradient-to-tr from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-pink-900/20"
                        >
                            <Instagram size={20} /> انستقرام
                        </a>
                        <a 
                            href="https://tiktok.com/@bloxon.market" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-black text-white border border-gray-800 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#111] transition-colors shadow-lg"
                        >
                            <TikTokIcon size={20} /> تيك توك
                        </a>
                    </div>
                    
                    <button onClick={() => { setIsCheckoutOpen(false); setCheckoutStep('DETAILS'); }} className="text-gray-500 text-xs font-bold hover:text-white transition-colors mt-4">
                        إغلاق النافذة
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
