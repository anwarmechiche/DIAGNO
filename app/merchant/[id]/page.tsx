"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ChevronLeft, ShieldCheck, MapPin, Globe, ArrowUpRight, 
  ShoppingBag, Zap, Award, Factory, Truck, Users, 
  CheckCircle, Phone, Mail, Clock, Star, Package,
  ChevronRight, Search, Menu, X
} from "lucide-react";

export default function SiteVitrinePremium() {
  const { id } = useParams();
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("accueil");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      const { data: mData } = await supabase.from("merchants").select("*").eq("id", id).single();
      const { data: pData } = await supabase.from("products").select("*").eq("merchant_id", id).order('created_at', { ascending: false });
      setMerchant(mData);
      setProducts(pData || []);
      setLoading(false);
    };
    fetchAllData();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-blue-500 rounded-full animate-spin" style={{animationDirection: "reverse", animationDuration: "1s"}}></div>
      </div>
      <p className="mt-8 text-white/60 font-medium tracking-wide">Chargement de l'expérience...</p>
    </div>
  );

  const navItems = [
    { id: "accueil", label: "Accueil" },
    { id: "catalogue", label: "Catalogue" },
    { id: "entreprise", label: "L'Entreprise" },
    { id: "valeurs", label: "Nos Valeurs" },
    { id: "contact", label: "Contact" }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans antialiased">
      
      {/* ============ NAVIGATION PREMIUM STYLE APPLE ============ */}
      <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
        scrolled ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-black/5" : "bg-transparent"
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="h-16 flex items-center justify-between">
            
            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <Factory className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-black tracking-tight">{merchant?.name}</h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Official Site</p>
              </div>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <a 
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-5 py-2 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-300 ${
                    activeSection === item.id 
                      ? "bg-black text-white" 
                      : "text-[#1d1d1f] hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* CTA + MOBILE MENU */}
            <div className="flex items-center gap-4">
              <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30">
                <Phone size={16} /> Nous contacter
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-black/5 shadow-2xl">
            <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-2">
              {navItems.map(item => (
                <a 
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block px-5 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION - CINEMATIC ============ */}
      <section id="accueil" className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        
        {/* GRID PATTERN BACKGROUND */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>

        {/* GLOWING ORBS */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: "1s"}}></div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center space-y-8">
          
          {/* BADGE CERTIFICATION */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-bold text-white animate-fade-in">
            <ShieldCheck size={18} className="text-blue-400" />
            Partenaire Certifié Affar Market
            <ChevronRight size={16} />
          </div>

          {/* TITRE PRINCIPAL */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-none">
            {merchant?.name}
            <span className="text-blue-500">.</span>
          </h1>

          {/* SOUS-TITRE */}
          <p className="max-w-3xl mx-auto text-xl md:text-3xl text-slate-300 font-medium leading-relaxed">
            {merchant?.description || "Excellence industrielle. Innovation constante. Livraison garantie."}
          </p>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a 
              href="#catalogue"
              className="group px-10 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl shadow-white/20 flex items-center justify-center gap-2"
            >
              Explorer le catalogue
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
            <a 
              href="#entreprise"
              className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Découvrir l'entreprise
            </a>
          </div>

          {/* STATS BAR */}
          <div className="flex flex-wrap justify-center gap-8 pt-16 text-white">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-blue-400">{products.length}+</div>
              <div className="text-sm text-slate-400 font-medium mt-1">Produits</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-blue-400">100%</div>
              <div className="text-sm text-slate-400 font-medium mt-1">Certifié</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-blue-400">48h</div>
              <div className="text-sm text-slate-400 font-medium mt-1">Livraison</div>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* ============ SECTION VALEURS - BENTO GRID PREMIUM ============ */}
      <section id="valeurs" className="relative py-32 bg-[#f5f5f7]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">Pourquoi nous choisir<span className="text-blue-600">?</span></h2>
            <p className="text-2xl text-slate-600 font-medium max-w-2xl mx-auto">
              Une expertise reconnue au service de votre réussite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1 - LARGE */}
            <div className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[3rem] p-12 text-white flex flex-col justify-between min-h-[500px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
                  <Zap size={32} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Livraison express.</h3>
                <p className="text-xl text-blue-100 font-medium leading-relaxed">
                  Logistique optimisée pour des délais records partout en Algérie. Suivi en temps réel inclus.
                </p>
              </div>
              <div className="relative z-10 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Clock size={18} />
                  Livraison sous 24-48h dans toute l'Algérie
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[240px] group border border-black/5">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award size={28} className="text-yellow-600" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-3">Qualité Premium</h4>
                <p className="text-slate-600 font-medium">Certifications ISO et contrôles qualité stricts</p>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[240px] group border border-black/5">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle size={28} className="text-green-600" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-3">Stock garanti</h4>
                <p className="text-slate-600 font-medium">Disponibilité immédiate sur tous nos produits</p>
              </div>
            </div>

            {/* CARD 4 */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[3rem] p-10 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 flex flex-col justify-between min-h-[240px] group">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-3">Support dédié</h4>
                <p className="text-slate-400 font-medium">Équipe commerciale à votre écoute 7j/7</p>
              </div>
            </div>

            {/* CARD 5 */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[240px] group border border-black/5">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package size={28} className="text-purple-600" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-3">Prix compétitifs</h4>
                <p className="text-slate-600 font-medium">Tarifs directs usine sans intermédiaire</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============ CATALOGUE VIRTUEL - STYLE GALERIE APPLE ============ */}
      <section id="catalogue" className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          {/* HEADER */}
          <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-4">Notre Catalogue<span className="text-blue-600">.</span></h2>
              <p className="text-2xl text-slate-600 font-medium">Découvrez nos produits phares</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..."
                  className="pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none w-full md:w-80 font-medium"
                />
              </div>
            </div>
          </div>

          {/* GRID PRODUITS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div 
                key={product.id}
                className="group bg-slate-50 rounded-[2.5rem] overflow-hidden hover:bg-white hover:shadow-2xl transition-all duration-700 border-2 border-transparent hover:border-blue-600/20"
                style={{animationDelay: `${index * 100}ms`}}
              >
                {/* IMAGE */}
                <div className="aspect-[4/3] bg-white overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg">
                    NOUVEAU
                  </div>
                </div>

                {/* INFO */}
                <div className="p-8 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 font-bold">(4.9)</span>
                      </div>
                      <h3 className="text-2xl font-black mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{product.description || "Produit de qualité supérieure avec garantie constructeur"}</p>
                    </div>
                  </div>

                  {/* PRIX + CTA */}
                  <div className="flex items-end justify-between pt-4 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Prix TTC</div>
                      <div className="text-3xl font-black">{product.price.toLocaleString()}<span className="text-lg text-slate-500"> DA</span></div>
                    </div>
                    <button className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:bg-blue-700 hover:scale-110 transition-all shadow-lg shadow-blue-600/30">
                      <ShoppingBag size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA VOIR PLUS */}
          {products.length > 6 && (
            <div className="text-center mt-16">
              <button className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl inline-flex items-center gap-2">
                Voir tous les produits
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============ SECTION ENTREPRISE ============ */}
      <section id="entreprise" className="py-32 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* TEXTE */}
            <div className="space-y-8">
              <div>
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-6">
                  À PROPOS DE NOUS
                </div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                  L'excellence industrielle depuis des années<span className="text-blue-600">.</span>
                </h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  {merchant?.name} est un acteur majeur du secteur industriel en Algérie. 
                  Notre engagement : fournir des produits de qualité supérieure avec un service client irréprochable.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-black/5">
                  <Factory size={32} className="text-blue-600 mb-4" strokeWidth={2.5} />
                  <h4 className="font-black text-lg mb-2">Production locale</h4>
                  <p className="text-sm text-slate-600 font-medium">Usine moderne en Algérie</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-black/5">
                  <Truck size={32} className="text-green-600 mb-4" strokeWidth={2.5} />
                  <h4 className="font-black text-lg mb-2">Livraison nationale</h4>
                  <p className="text-sm text-slate-600 font-medium">Couverture 58 wilayas</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30">
                  Demander un devis
                </button>
                <button className="px-8 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-bold hover:bg-slate-900 hover:text-white transition-all">
                  Télécharger le catalogue PDF
                </button>
              </div>
            </div>

            {/* IMAGE / VISUAL */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-blue-800 rounded-[3rem] overflow-hidden shadow-2xl">
                {products[0]?.image && (
                  <img 
                    src={products[0].image} 
                    alt="Featured product"
                    className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <Factory size={80} className="mx-auto mb-6 opacity-90" strokeWidth={1.5} />
                    <h3 className="text-4xl font-black mb-4">Infrastructure moderne</h3>
                    <p className="text-xl font-medium opacity-90">Équipements de pointe</p>
                  </div>
                </div>
              </div>

              {/* FLOATING BADGE */}
              <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-3xl shadow-2xl border border-black/5">
                <div className="text-center">
                  <div className="text-5xl font-black text-blue-600 mb-2">100%</div>
                  <div className="text-sm font-bold text-slate-600">Satisfaction client</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION CONTACT / FOOTER PREMIUM ============ */}
      <footer id="contact" className="relative bg-slate-950 text-white overflow-hidden">
        
        {/* GRID BACKGROUND */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>

        {/* CTA SECTION */}
        <div className="relative z-10 py-32 border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center space-y-8">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">
              Prêt à passer commande<span className="text-blue-500">?</span>
            </h2>
            <p className="text-2xl text-slate-400 font-medium max-w-2xl mx-auto">
              Contactez notre équipe commerciale pour un devis personnalisé
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button className="px-12 py-6 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3">
                <Phone size={24} />
                Appeler maintenant
              </button>
              <button className="px-12 py-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                <Mail size={24} />
                Envoyer un email
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="relative z-10 py-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* COLONNE 1 - BRANDING */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <Factory className="text-white" size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black">{merchant?.name}</h3>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Official Site by Affar</p>
                  </div>
                </div>
                <p className="text-slate-400 font-medium leading-relaxed max-w-md">
                  Site vitrine officiel géré par la plateforme Affar Market. 
                  Fournisseur certifié avec garantie qualité et livraison rapide.
                </p>
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                    <Globe size={20} />
                  </div>
                  <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                    <Mail size={20} />
                  </div>
                  <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                    <Phone size={20} />
                  </div>
                </div>
              </div>

              {/* COLONNE 2 - LIENS */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Navigation</h4>
                <ul className="space-y-3">
                  {navItems.map(item => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="text-slate-400 hover:text-white transition-colors font-medium">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COLONNE 3 - CONTACT */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Contact</h4>
                <div className="space-y-3 text-slate-400 font-medium">
                  <p className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                    {merchant?.location || "Algérie"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={18} className="text-blue-500 flex-shrink-0" />
                    +213 XXX XX XX XX
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={18} className="text-blue-500 flex-shrink-0" />
                    contact@{merchant?.name?.toLowerCase()}.dz
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="relative z-10 border-t border-white/10 py-8">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
            <p>© 2024 {merchant?.name}. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <span>Propulsé par</span>
              <span className="font-black text-white">Affar Market</span>
              <ShieldCheck size={16} className="text-blue-500" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}