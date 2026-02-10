
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product, User, Order, SiteSettings, OrderStatus } from '../types';
import { 
  LayoutDashboard, ShoppingCart, Settings, X, Loader2, 
  Plus, Edit, Trash2, Users, Package, DollarSign, 
  Ban, CheckCircle, Search, Save, Image as ImageIcon,
  AlertTriangle, Mail, Truck, Clock, ShoppingBag, Shield, Menu, RefreshCcw, Upload
} from 'lucide-react';
import { supabase } from '../supabase';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from '../constants';

interface AdminProps {
  currentUser: User | null;
  products: Product[];
  setProducts: (p: Product[]) => void;
  orders: Order[];
  setOrders: (o: Order[]) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  refreshData: () => Promise<void>;
}

interface ProductFormData extends Partial<Product> {
    fruitsInput: string;
    rareItemsInput: string;
}

const AdminDashboard: React.FC<AdminProps> = ({ 
  currentUser, products, setProducts, users, orders, settings, setSettings, refreshData
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'USERS' | 'ORDERS' | 'SETTINGS'>('OVERVIEW');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMounted = useRef(true);
  
  // Product Management State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '', price: 0, description: '', image: '', type: 'ACCOUNT', stockQuantity: 1,
    level: 1, fruitsInput: '', rareItemsInput: ''
  });
  const [uploading, setUploading] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // UseEffect to populate form data on edit
  useEffect(() => {
    if (editingProduct) {
        setFormData({
            ...editingProduct,
            fruitsInput: editingProduct.fruits ? editingProduct.fruits.join(', ') : '',
            rareItemsInput: editingProduct.rareItems ? editingProduct.rareItems.join(', ') : ''
        });
    } else {
        setFormData({
            name: '', price: 0, description: '', image: '', type: 'ACCOUNT', stockQuantity: 1,
            level: 1, fruitsInput: '', rareItemsInput: ''
        });
    }
  }, [editingProduct, isProductModalOpen]);

  // --- Handlers ---

  const showSuccess = (msg: string) => {
      setSuccessMsg(msg);
      setTimeout(() => { if (isMounted.current) setSuccessMsg('') }, 4000);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, userId: string, productName: string) => {
    setIsProcessing(true);
    try {
        const { error: orderError } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        
        if (orderError) throw orderError;

        let notifTitle = '';
        let notifMsg = '';

        switch (newStatus) {
            case 'PENDING_DELIVERY':
                notifTitle = 'تم استلام الدفع ✅';
                notifMsg = `تم التحقق من عملية الدفع لطلبك "${productName}". جاري العمل على التسليم.`;
                break;
            case 'DELIVERED':
                notifTitle = 'تم تسليم الطلب 🎉';
                notifMsg = `ألف مبروك! تم تسليم طلبك "${productName}" بنجاح. شكراً لثقتكم بنا.`;
                break;
            default:
                notifTitle = 'تحديث حالة الطلب';
                notifMsg = `تم تحديث حالة طلبك "${productName}" إلى ${newStatus}.`;
        }

        const { error: notifError } = await supabase
            .from('notifications')
            .insert({
                userId: userId,
                title: notifTitle,
                message: notifMsg,
                isRead: false
            });

        if (notifError) console.error("Notification failed", notifError);

        await refreshData();
        showSuccess(`تم تحديث الحالة إلى ${newStatus} ✅`);

    } catch (err: any) {
        alert('حدث خطأ: ' + err.message);
    } finally {
        if (isMounted.current) setIsProcessing(false);
    }
  };

  const handleSaveSettings = async (customSettings?: SiteSettings) => {
    setIsProcessing(true);
    const s = customSettings || settings;
    try {
      const { error } = await supabase.from('site_settings').update({ 
        robloxGamePassUrl: s.robloxGamePassUrl, 
        serverStatus: s.serverStatus,
        emailjsServiceId: s.emailjsServiceId,
        emailjsTemplateId: s.emailjsTemplateId,
        emailjsPublicKey: s.emailjsPublicKey
      }).eq('id', 1);
      
      if (error) throw error;
      await refreshData();
      showSuccess('تم حفظ الإعدادات');
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('تحذير: هذا سيقوم بحذف جميع المنتجات الحالية واستبدالها بالقائمة الافتراضية (الحسابات، الأساليب، والسيوف). هل أنت متأكد؟')) return;
    setIsProcessing(true);
    try {
        // 1. Delete all products
        const { error: deleteError } = await supabase.from('products').delete().neq('id', '0'); // Delete everything
        if (deleteError) throw deleteError;

        // 2. Insert Initial Products
        // Need to map keys to lowercase for DB
        const payload = INITIAL_PRODUCTS.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            type: p.type,
            level: p.level || null,
            fruits: p.fruits || null,
            rareitems: p.rareItems || null,
            paymentmethods: p.paymentMethods,
            instock: p.inStock,
            stockquantity: p.stockQuantity
        }));

        const { error: insertError } = await supabase.from('products').insert(payload);
        if (insertError) throw insertError;

        await refreshData();
        showSuccess('تمت استعادة المنتجات الافتراضية بنجاح');
    } catch (err: any) {
        alert('خطأ: ' + err.message);
    } finally {
        if (isMounted.current) setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      // Update local state immediately for better UX
      setProducts(products.filter(p => p.id !== id));
      
      showSuccess('تم حذف المنتج');
      
      // Refresh in background
      refreshData().catch(e => console.error("Background refresh failed:", e));
      
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes("The resource was not found") || uploadError.message.includes("Bucket not found")) {
             throw new Error("سلة التخزين 'product-images' غير موجودة. يرجى مراجعة ملف supabase.ts لتشغيل كود SQL لإنشاء السلة.");
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      
      setFormData({ ...formData, image: data.publicUrl });
      showSuccess('تم رفع الصورة بنجاح');
      
    } catch (error: any) {
      alert('خطأ في رفع الصورة: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent double clicks
    
    setIsProcessing(true);
    
    // Safety timeout in case of network hang
    const safetyTimeout = setTimeout(() => {
        if (isMounted.current && isProcessing) {
             setIsProcessing(false);
             alert("استغرق الطلب وقتاً طويلاً. يرجى التحقق من اتصال الإنترنت.");
        }
    }, 20000); // 20 seconds

    try {
      const priceVal = Number(formData.price);
      const stockVal = Number(formData.stockQuantity);
      
      if (isNaN(priceVal) || isNaN(stockVal)) {
          throw new Error("الرجاء إدخال أرقام صحيحة للسعر والكمية");
      }

      const fruitsArray = formData.fruitsInput 
        ? formData.fruitsInput.split(',').map(s => s.trim()).filter(s => s !== '') 
        : [];
      
      const rareItemsArray = formData.rareItemsInput
        ? formData.rareItemsInput.split(',').map(s => s.trim()).filter(s => s !== '')
        : [];

      // Construct Payload with Lowercase keys for Postgres compatibility
      const payload = {
        name: formData.name,
        description: formData.description || '',
        price: priceVal,
        image: formData.image,
        type: formData.type,
        stockquantity: stockVal,
        instock: stockVal > 0,
        paymentmethods: ['ROBLOX'],
        level: formData.type === 'ACCOUNT' ? Number(formData.level) : null,
        fruits: formData.type === 'ACCOUNT' ? fruitsArray : null,
        rareitems: formData.type === 'ACCOUNT' ? rareItemsArray : null
      };

      console.log("Sending payload to DB:", payload);

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const newId = Math.random().toString(36).substr(2, 9);
        const { error } = await supabase
          .from('products')
          .insert([{ id: newId, ...payload }]);
        if (error) throw error;
      }
      
      clearTimeout(safetyTimeout);
      
      if (isMounted.current) {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          showSuccess(editingProduct ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح');
          setIsProcessing(false); // Stop loading BEFORE refresh to unblock UI
      }
      
      // Trigger background refresh
      await refreshData();

    } catch (err: any) {
      clearTimeout(safetyTimeout);
      console.error("Product Submit Error:", err);
      if (isMounted.current) {
          setIsProcessing(false);
          
          if (err.code === '42P01') {
             alert("خطأ: جدول المنتجات غير موجود. انسخ كود SQL من ملف supabase.ts وقم بتشغيله.");
          } else if (err.code === '42703') {
             alert("خطأ: بعض الأعمدة غير موجودة في قاعدة البيانات (مثل stockquantity). تأكد من تحديث الجدول.");
          } else {
             alert('حدث خطأ أثناء الحفظ: ' + (err.message || 'غير معروف'));
          }
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const toggleUserBan = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm('تأكيد تغيير حالة الحظر؟')) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('profiles').update({ isBanned: !currentStatus }).eq('id', userId);
      if (error) throw error;
      await refreshData();
      showSuccess(currentStatus ? 'تم رفع الحظر' : 'تم الحظر');
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="bg-[#111] p-12 rounded-3xl shadow-xl border border-gray-800 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Access Denied</h2>
          <Link to="/" className="text-blue-500 font-bold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((acc, order) => acc + (order.productPrice || 0), 0);
  const totalUsers = users.length;
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col lg:flex-row relative font-sans">
      {/* Success Banner */}
      {successMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-in slide-in-from-top-4 font-black flex items-center gap-2 border border-blue-400">
              <CheckCircle size={20} />
              {successMsg}
          </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden p-4 flex items-center justify-between border-b border-gray-900 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <LayoutDashboard size={18} />
          </div>
          <span className="font-black text-lg">لوحة التحكم</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 w-72 bg-[#0a0a0a] border-l border-gray-900 z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen flex flex-col p-6 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">DASHBOARD</h2>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'OVERVIEW', icon: LayoutDashboard, label: 'نظرة عامة' },
            { id: 'ORDERS', icon: ShoppingBag, label: 'الطلبات' },
            { id: 'PRODUCTS', icon: Package, label: 'المنتجات' },
            { id: 'USERS', icon: Users, label: 'المستخدمين' },
            { id: 'SETTINGS', icon: Settings, label: 'الإعدادات' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all border border-transparent ${
                activeTab === item.id 
                ? 'bg-blue-600/10 text-blue-500 border-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                : 'text-gray-500 hover:bg-[#151515] hover:text-gray-300'
              }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-gray-900 text-center text-gray-600 text-xs font-mono">
          BLOXON v2.1
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>}

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden bg-[#050505]">
        {isProcessing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <span className="text-blue-500 font-bold animate-pulse">جاري المعالجة...</span>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black mb-8 text-white tracking-tight">لوحة القيادة</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'إجمالي المبيعات (Robux)', value: totalRevenue, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'المستخدمين المسجلين', value: totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'عدد المنتجات', value: totalProducts, icon: Package, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#0e0e0e] p-8 rounded-[2rem] border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-all group">
                  <div>
                    <p className="text-gray-500 font-bold text-xs mb-2 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={28} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'ORDERS' && (
           <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-black text-white">إدارة الطلبات</h1>
               <div className="relative">
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                 <input 
                   type="text" 
                   placeholder="بحث..." 
                   className="pl-4 pr-12 py-3 rounded-xl bg-[#111] border border-gray-800 text-white outline-none focus:border-blue-600 w-64 transition-all focus:bg-[#151515]"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
             </div>

             <div className="bg-[#0e0e0e] rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl shadow-black/50">
               <div className="overflow-x-auto">
                 <table className="w-full text-right min-w-[800px]">
                   <thead className="bg-[#151515]">
                     <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                       <th className="p-6">رقم الطلب</th>
                       <th className="p-6">المنتج</th>
                       <th className="p-6">المشتري</th>
                       <th className="p-6">حساب Roblox</th>
                       <th className="p-6">الدولة</th>
                       <th className="p-6">الحالة</th>
                       <th className="p-6">إجراءات</th>
                     </tr>
                   </thead>
                   <tbody className="text-gray-300 font-medium">
                     {orders
                        .filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.robloxUsername?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(order => (
                       <tr key={order.id} className="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition-colors">
                         <td className="p-6 font-mono text-xs text-gray-500">{order.id}</td>
                         <td className="p-6">
                            <div className="text-white font-bold">{order.productName}</div>
                            <div className="text-xs text-green-400">{order.productPrice} R</div>
                         </td>
                         <td className="p-6 text-sm">{order.userName}</td>
                         <td className="p-6">
                             <div className="bg-[#1a1a1a] px-3 py-1 rounded-lg text-xs font-mono text-gray-300 inline-block border border-gray-800">
                                {order.robloxUsername || '-'}
                             </div>
                         </td>
                         <td className="p-6 text-sm text-blue-400">{order.country || '-'}</td>
                         <td className="p-6">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                             order.status === 'NEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                             order.status === 'PENDING_PAYMENT' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                             order.status === 'PENDING_DELIVERY' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                             'bg-green-500/10 text-green-500 border-green-500/20'
                           }`}>
                             {order.status.replace('_', ' ')}
                           </span>
                         </td>
                         <td className="p-6">
                            {order.status !== 'DELIVERED' && (
                                <div className="flex gap-2">
                                    {order.status === 'PENDING_PAYMENT' && (
                                        <button 
                                          onClick={() => handleUpdateOrderStatus(order.id, 'PENDING_DELIVERY', order.userId, order.productName)}
                                          className="bg-orange-500/20 text-orange-500 p-2 rounded-lg hover:bg-orange-500/30 transition-colors"
                                          title="تأكيد الدفع"
                                        >
                                            <Truck size={18} />
                                        </button>
                                    )}
                                    <button 
                                      onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED', order.userId, order.productName)}
                                      className="bg-green-500/20 text-green-500 p-2 rounded-lg hover:bg-green-500/30 transition-colors"
                                      title="تم التسليم"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                </div>
                            )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <h1 className="text-3xl font-black text-white">إدارة المنتجات</h1>
              <div className="flex gap-4">
                 <button onClick={handleRestoreDefaults} className="bg-red-900/20 text-red-500 border border-red-900/50 px-6 py-3 rounded-xl font-bold hover:bg-red-900/30 transition-all flex items-center gap-2">
                    <RefreshCcw size={18} /> استعادة الافتراضي
                 </button>
                 <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all flex items-center gap-2">
                    <Plus size={20} /> إضافة منتج
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-[#0e0e0e] p-5 rounded-[2rem] border border-gray-800 flex flex-col group hover:border-blue-600/30 transition-all">
                  <div className="relative h-48 mb-4 rounded-3xl overflow-hidden bg-[#151515]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                      {product.type}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                  <p className="text-green-500 font-mono font-bold text-xl mb-4">{product.price} R</p>
                  
                  <div className="mt-auto flex gap-3 pt-4 border-t border-gray-800">
                    <button onClick={() => openEditModal(product)} className="flex-1 bg-[#151515] text-blue-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors border border-gray-800">
                      <Edit size={16} /> تعديل
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 bg-[#151515] text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors border border-gray-800">
                      <Trash2 size={16} /> حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'USERS' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black text-white">المستخدمين</h1>
              <div className="relative">
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                 <input 
                   type="text" 
                   placeholder="بحث..." 
                   className="pl-4 pr-12 py-3 rounded-xl bg-[#111] border border-gray-800 text-white outline-none focus:border-blue-600 w-64 transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>

            <div className="bg-[#0e0e0e] rounded-[2rem] border border-gray-800 overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-[#151515]">
                  <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <th className="p-6">المستخدم</th>
                    <th className="p-6">البريد</th>
                    <th className="p-6">الدور</th>
                    <th className="p-6">الحالة</th>
                    <th className="p-6">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                    <tr key={user.id} className="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#222] rounded-full flex items-center justify-center text-gray-400">
                          <Users size={16} />
                        </div>
                        {user.username}
                      </td>
                      <td className="p-6 font-mono text-sm text-gray-500">{user.email}</td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${user.role === 'ADMIN' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-6">
                        {user.isBanned ? (
                          <span className="text-red-500 flex items-center gap-1 text-xs font-bold"><Ban size={14} /> BANNED</span>
                        ) : (
                          <span className="text-green-500 flex items-center gap-1 text-xs font-bold"><CheckCircle size={14} /> ACTIVE</span>
                        )}
                      </td>
                      <td className="p-6">
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => toggleUserBan(user.id, user.isBanned)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${user.isBanned ? 'bg-green-900/20 text-green-400 border-green-500/30 hover:bg-green-900/40' : 'bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40'}`}
                          >
                            {user.isBanned ? 'UNBAN' : 'BAN'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <h1 className="text-3xl font-black mb-8 text-white">إعدادات النظام</h1>
             <div className="bg-[#0e0e0e] p-10 rounded-[2.5rem] border border-gray-800 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 mr-2 block uppercase tracking-wider">رابط Game Pass</label>
                      <input type="text" value={settings.robloxGamePassUrl} onChange={e => setSettings({...settings, robloxGamePassUrl: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#151515] border border-gray-800 font-bold text-white outline-none focus:border-blue-600 focus:bg-[#1a1a1a] transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 mr-2 block uppercase tracking-wider">حالة السيرفر</label>
                      <select 
                        value={settings.serverStatus} 
                        onChange={e => setSettings({...settings, serverStatus: e.target.value as any})}
                        className="w-full px-6 py-4 rounded-2xl bg-[#151515] border border-gray-800 font-bold text-white outline-none focus:border-blue-600 appearance-none"
                      >
                        <option value="ONLINE">ONLINE (نشط)</option>
                        <option value="MAINTENANCE">MAINTENANCE (صيانة)</option>
                        <option value="OFFLINE">OFFLINE (متوقف)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 mr-2 block">EmailJS Service ID</label>
                      <input type="text" value={settings.emailjsServiceId} onChange={e => setSettings({...settings, emailjsServiceId: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#151515] border border-gray-800 font-bold text-white outline-none focus:border-blue-600" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 mr-2 block">EmailJS Template ID</label>
                      <input type="text" value={settings.emailjsTemplateId} onChange={e => setSettings({...settings, emailjsTemplateId: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#151515] border border-gray-800 font-bold text-white outline-none focus:border-blue-600" />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-blue-500 mr-2 block">EmailJS Public Key</label>
                      <input type="text" value={settings.emailjsPublicKey} onChange={e => setSettings({...settings, emailjsPublicKey: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#111] border-2 border-blue-900/30 font-bold text-white outline-none focus:border-blue-500" />
                   </div>
                </div>
                <button 
                  onClick={() => handleSaveSettings()}
                  className="mt-10 bg-blue-600 text-white font-black px-12 py-4 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all flex items-center gap-2 mx-auto"
                >
                  <Save size={20} /> حفظ التغييرات
                </button>
             </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111] w-full max-w-lg rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-gray-800 p-8 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsProductModalOpen(false)} className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-white mb-8 text-right pr-2 border-r-4 border-blue-600">
              {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
            </h2>
            
            <form onSubmit={handleProductSubmit} className="space-y-5 text-right">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block mr-2 uppercase">اسم المنتج</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-gray-800 outline-none focus:border-blue-600 text-white placeholder-gray-600 focus:bg-[#222] transition-all" placeholder="..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block mr-2">السعر (R)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-gray-800 outline-none focus:border-blue-600 text-white placeholder-gray-600" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-2 block mr-2">الكمية</label>
                   <input required type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="w-full px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-gray-800 outline-none focus:border-blue-600 text-white placeholder-gray-600" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block mr-2">النوع</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-gray-800 outline-none focus:border-blue-600 text-white">
                  <option value="ACCOUNT">حساب (Account)</option>
                  <option value="STYLE">أسلوب (Style)</option>
                  <option value="SWORD">سيف (Sword)</option>
                  <option value="LEVELING">تطوير (Leveling)</option>
                </select>
              </div>
              
              {formData.type === 'ACCOUNT' && (
                <div className="space-y-4 bg-[#161616] p-4 rounded-2xl border border-gray-800">
                    <div>
                        <label className="text-xs font-bold text-blue-500 mb-2 block mr-2">مستوى الحساب</label>
                        <input type="number" value={formData.level} onChange={e => setFormData({...formData, level: Number(e.target.value)})} className="w-full px-5 py-3 rounded-2xl bg-[#0a0a0a] border border-gray-800 outline-none focus:border-blue-600 text-white" placeholder="2550" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-blue-500 mb-2 block mr-2">الفواكه (مفصول بفاصلة)</label>
                        <input type="text" value={formData.fruitsInput} onChange={e => setFormData({...formData, fruitsInput: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-[#0a0a0a] border border-gray-800 outline-none focus:border-blue-600 text-white" placeholder="Kitsune, Dragon..." />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-blue-500 mb-2 block mr-2">عناصر نادرة</label>
                        <input type="text" value={formData.rareItemsInput} onChange={e => setFormData({...formData, rareItemsInput: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-[#0a0a0a] border border-gray-800 outline-none focus:border-blue-600 text-white" placeholder="CDK, Soul Guitar..." />
                    </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block mr-2">صورة المنتج</label>
                <div className="space-y-3">
                    <div className="relative">
                        <ImageIcon size={20} className="absolute top-3 left-4 text-gray-600" />
                        <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full pl-12 pr-5 py-3 rounded-2xl bg-[#1a1a1a] border border-gray-800 outline-none focus:border-blue-600 text-left text-white placeholder-gray-600" placeholder="رابط الصورة أو قم بالرفع..." />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <label className={`flex-1 cursor-pointer bg-[#151515] border border-dashed border-gray-700 hover:border-blue-500 hover:bg-[#1a1a1a] transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                            <span className="text-xs font-bold">{uploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                        </label>
                        {formData.image && (
                            <div className="w-20 h-20 rounded-2xl bg-[#111] border border-gray-800 overflow-hidden relative group">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block mr-2">الوصف</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-gray-800 outline-none focus:border-blue-600 h-24 text-white placeholder-gray-600" placeholder="وصف المنتج..." />
              </div>

              <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all flex items-center justify-center gap-3">
                {isProcessing ? (
                  <>
                     <Loader2 className="animate-spin" size={20} /> جاري المعالجة...
                  </>
                ) : (
                  'حفظ البيانات'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
