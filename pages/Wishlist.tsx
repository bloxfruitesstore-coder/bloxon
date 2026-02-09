
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, Star } from 'lucide-react';

interface WishlistProps {
  products: Product[];
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  addToCart: (p: Product) => void;
  cart: Product[];
}

const WishlistPage: React.FC<WishlistProps> = ({ products, wishlist, toggleWishlist, addToCart, cart }) => {
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#020202] py-16 px-4">
      <div className="max-w-7xl mx-auto mb-16 text-right space-y-4">
        <div className="inline-flex items-center gap-2 bg-red-900/20 text-red-500 px-4 py-1.5 rounded-full border border-red-900/30">
          <Heart size={16} fill="currentColor" />
          <span className="text-[10px] font-black uppercase tracking-widest">قائمة الأمنيات الخاصة بك</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
          الأشياء التي <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">تحبها</span>
        </h1>
        <p className="text-gray-500 font-bold max-w-2xl ml-auto leading-relaxed">
          جميع المنتجات التي قمت بحفظها للمستقبل. يمكنك إضافتها للسلة في أي وقت.
        </p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-32 bg-[#0a0a0a] rounded-[4rem] border border-gray-800 shadow-sm animate-in zoom-in">
          <div className="w-32 h-32 bg-[#111] text-red-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-800">
             <Heart size={64} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">قائمتك فارغة حالياً</h2>
          <p className="text-gray-500 font-bold mb-10 px-8">ابدأ بتصفح المتجر وأضف ما يعجبك عبر الضغط على أيقونة القلب!</p>
          <Link to="/shop" className="inline-flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            تصفح المتجر <ArrowRight size={20} />
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {wishlistedProducts.map((product) => {
              const isInCart = cart.some(p => p.id === product.id);
              
              return (
                <div key={product.id} className="group bg-[#0a0a0a] rounded-[3.5rem] border border-gray-800 shadow-sm transition-all hover:border-red-900/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:-translate-y-2 overflow-hidden flex flex-col">
                  <div className="relative h-64 overflow-hidden bg-[#111]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90" />
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-6 left-6 p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white shadow-xl border border-white/10">
                      {product.type === 'ACCOUNT' ? 'ACCOUNT' : product.type === 'STYLE' ? 'STYLE' : 'SWORD'}
                    </div>
                  </div>

                  <div className="p-10 text-right flex flex-col flex-grow">
                    <div className="flex items-center justify-end gap-1 text-yellow-500 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm font-bold mb-8 line-clamp-2">{product.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-800 pt-6">
                      <div className="text-left">
                        <span className="text-3xl font-black text-green-500">{product.price} Robux</span>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={isInCart}
                        className={`px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center gap-2 transition-all ${isInCart ? 'bg-green-900/20 text-green-500 border border-green-900/50' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl'}`}
                      >
                        {isInCart ? 'في السلة' : 'أضف للسلة'} <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
