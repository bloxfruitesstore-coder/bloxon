
import React from 'react';
import { Link } from 'react-router-dom';
import { Order, User, OrderStatus } from '../types';
import { Clock, CheckCircle, Truck, AlertCircle, ShoppingCart } from 'lucide-react';

const MyOrders: React.FC<{ orders: Order[], currentUser: User | null }> = ({ orders, currentUser }) => {
  if (!currentUser) return null;

  const myOrders = orders.filter(o => o.userId === currentUser.id);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'NEW': return <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider border border-blue-900/50"><Clock size={12} /> جديد</span>;
      case 'PENDING_PAYMENT': return <span className="bg-yellow-900/30 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider border border-yellow-900/50"><Clock size={12} /> بانتظار الدفع</span>;
      case 'PENDING_DELIVERY': return <span className="bg-orange-900/30 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider border border-orange-900/50"><Truck size={12} /> بانتظار التسليم</span>;
      case 'DELIVERED': return <span className="bg-green-900/30 text-green-500 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider border border-green-900/50"><CheckCircle size={12} /> تم التسليم</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 bg-[#020202] min-h-screen">
      <div className="text-right mb-12">
        <h2 className="text-4xl font-black text-white flex items-center justify-end gap-3 tracking-tighter">
          سجل طلباتي
          <Clock className="text-blue-600" size={32} />
        </h2>
        <p className="text-gray-500 font-bold mt-2">يمكنك متابعة حالة جميع مشترياتك هنا.</p>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-[#0a0a0a] p-20 rounded-[3rem] border border-gray-800 text-center flex flex-col items-center shadow-sm">
          <div className="w-24 h-24 bg-[#111] rounded-full flex items-center justify-center text-gray-600 mb-8 border border-gray-800">
            <ShoppingCart size={48} />
          </div>
          <p className="text-gray-500 font-black text-xl mb-8">لم تقم بإجراء أي طلبات بعد.</p>
          <Link to="/shop" className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 transition-all">ابدأ التسوق الآن</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
            <div key={order.id} className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-900/40 transition-all group">
              <div className="text-right">
                <div className="flex items-center justify-end gap-3 mb-2">
                  <span className="text-[10px] font-mono text-gray-600 tracking-widest">{order.id}</span>
                  {getStatusBadge(order.status)}
                </div>
                <h3 className="text-xl font-black text-gray-200 mb-1">{order.productName}</h3>
                <p className="text-xs text-gray-500 font-bold">التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              
              <div className="flex items-center gap-8 border-t md:border-t-0 pt-6 md:pt-0 border-gray-900">
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block font-black uppercase tracking-widest">المبلغ المدفوع</span>
                  <span className="text-3xl font-black text-green-500 tracking-tighter">{order.productPrice} Robux</span>
                </div>
                <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center text-blue-600 shadow-inner border border-gray-800">
                  <span className="text-xl font-black">R</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
