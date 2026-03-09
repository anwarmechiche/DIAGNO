"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; // 1. IMPORT DU ROUTER
import { supabase } from "@/lib/supabase";
import { 
  MessageCircle, ShieldCheck, Search, X, Send, Bot, 
  Heart, Share2, MoreHorizontal, UserCircle, Gavel,
  MapPin, ChevronLeft, Store, Sun, Moon, LogIn
} from "lucide-react";

// --- TYPES ---
type Product = { 
  id: string; 
  name: string; 
  description: string; 
  price: number; 
  image: string | null;
  category: string | null; 
  location: string | null; 
  merchant_id: string; 
};
type Vendor = { id: string; name: string; description?: string; location?: string; };
type Message = { content: string; sender_type: 'client' | 'bot' | 'vendor'; };

export default function AffarMarketplace() {
  const router = useRouter(); // 2. INITIALISATION DU ROUTER
  const [products, setProducts] = useState<Product[]>([]);
  const [merchants, setMerchants] = useState<Vendor[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'category'>('all');
  const [selectedVal, setSelectedVal] = useState<string | null>(null);

  const [activeChat, setActiveChat] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const categories = ["Construction", "Industrie", "Agriculture", "Matériaux", "Énergie"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: vData } = await supabase.from("merchants").select("*");
      if (vData) setMerchants(vData as Vendor[]);
      const { data: pData } = await supabase.from("products").select("*");
      if (pData) { setProducts(pData as Product[]); setFilteredProducts(pData as Product[]); }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = products;
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === 'category' && selectedVal) {
      result = result.filter(p => p.category === selectedVal);
    }
    setFilteredProducts(result);
  }, [searchQuery, activeTab, selectedVal, products]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { content: newMessage, sender_type: 'client' }]);
    setNewMessage("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { content: "Votre message a été transmis au fournisseur.", sender_type: 'bot' }]);
      setIsTyping(false);
    }, 1500);
  };

  const getMerchantName = (id: string) => merchants.find(m => m.id === id)?.name || "Fournisseur";

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-[#FAFAFA] text-slate-900'} min-h-screen font-sans transition-colors duration-300`}>
      
      {/* NAVBAR */}
      <nav className={`sticky top-0 z-[50] border-b ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} backdrop-blur-xl px-4`}>
        <div className="max-w-xl mx-auto h-16 flex justify-between items-center">
          <h1 className="text-2xl font-[900] italic tracking-tighter text-blue-600 cursor-pointer" 
              onClick={() => {setActiveTab('all'); setSelectedVal(null);}}>
            Affar.
          </h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link href="/login" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              <LogIn size={18} />
              <span className="hidden sm:inline">Connexion</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* RECHERCHE & FILTRES */}
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <div className="relative group">
          <Search className={`absolute left-3 top-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
          <input 
            type="text" 
            placeholder="Chercher une usine, un produit..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border-none rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-slate-800 placeholder:text-slate-500' : 'bg-white shadow-sm placeholder:text-slate-400'}`}
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <button 
            onClick={() => {setActiveTab('all'); setSelectedVal(null);}}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white border-blue-600' : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-500')}`}>
            Tout
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => {setActiveTab('category'); setSelectedVal(cat);}}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${selectedVal === cat ? 'bg-blue-600 text-white border-blue-600' : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-500')}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FEED */}
      <main className="max-w-lg mx-auto pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className={`${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-100'} border-b sm:border sm:rounded-[2rem] overflow-hidden transition-colors`}>
                <div className="flex items-center justify-between px-4 py-3">
                  
                  {/* 3. CLIC VERS LA VITRINE REDIRIGÉ ICI */}
                  <div 
                    className="flex items-center gap-3 cursor-pointer group" 
                    onClick={() => router.push(`/merchant/${product.merchant_id}`)}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-900/20">
                      {getMerchantName(product.merchant_id).charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1 group-hover:text-blue-500">
                        {getMerchantName(product.merchant_id)} <ShieldCheck size={14} className="text-blue-500" />
                      </div>
                      <div className="text-[10px] opacity-50 font-medium">{product.location || "Algérie"}</div>
                    </div>
                  </div>
                  <MoreHorizontal size={18} className="opacity-40" />
                </div>

                <div className="aspect-square bg-slate-200 overflow-hidden cursor-pointer" onClick={() => setActiveChat(product)}>
                  <img src={product.image || ""} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>

                <div className="px-4 py-4">
                  <div className="flex gap-5 mb-3">
                    <MessageCircle size={26} className="cursor-pointer hover:text-blue-500 transition-colors" onClick={() => setActiveChat(product)} />
                    <Heart size={26} className="cursor-pointer hover:text-red-500 transition-colors" />
                    <Share2 size={26} className="cursor-pointer hover:text-green-500 transition-colors" />
                  </div>
                  <div className="text-xl font-black mb-1 text-blue-500">{product.price.toLocaleString()} DA</div>
                  <p className="text-sm font-medium"><span className="font-extrabold mr-2">{getMerchantName(product.merchant_id)}</span>{product.name}</p>
                  <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* CHAT MODAL (Inchangé) */}
      {activeChat && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className={`w-full max-w-md h-[80vh] rounded-t-[2.5rem] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 ${darkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white'}`}>
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><Bot size={20} /></div>
                <h3 className="text-sm font-bold truncate w-40">{activeChat.name}</h3>
              </div>
              <button onClick={() => setActiveChat(null)} className="p-2 opacity-50 hover:opacity-100"><X size={24}/></button>
            </div>
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${darkMode ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.sender_type === 'client' ? 'bg-blue-600 text-white rounded-br-none' : (darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700 shadow-sm')}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t">
              <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Écrire au vendeur..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
                <button onClick={handleSendMessage} className="text-blue-500 font-bold px-2">Envoyer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}