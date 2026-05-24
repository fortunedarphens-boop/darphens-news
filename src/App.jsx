import React, { useState, useEffect } from 'react';
import { Home, Bookmark, Shirt, Share2, ChevronRight, Clock, ArrowLeft, RefreshCw, WifiOff } from 'lucide-react';

const WP_API_URL = 'https://darphensnews.wordpress.com/wp-json/wp/v2';

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#8230;/g, '…').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getFeaturedImage = (post) => post?._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
const getCategory = (post) => post?._embedded?.['wp:term']?.[0]?.[0]?.name || 'Actualité';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  </div>
);

const PostCard = ({ post, onSelect, isFavorite, onToggleFavorite }) => {
  const image = getFeaturedImage(post);
  const category = getCategory(post);
  const title = stripHtml(post.title?.rendered);
  const excerpt = stripHtml(post.excerpt?.rendered);
  const date = formatDate(post.date);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group transition-all duration-200 hover:shadow-md active:scale-[0.99]" onClick={() => onSelect(post)}>
      <div className="relative h-44 bg-gradient-to-br from-[#0b2240] to-[#1a3a6b] overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/15 text-6xl font-black">DN</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-[#cc1818] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">{category}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(post.id); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform active:scale-90">
          <Bookmark size={14} className={isFavorite ? 'fill-[#cc1818] text-[#cc1818]' : 'text-gray-400'} />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <h2 className="text-sm font-bold text-[#0b2240] leading-snug line-clamp-2 group-hover:text-[#cc1818] transition-colors">{title}</h2>
        {excerpt && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{excerpt}</p>}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
          <Clock size={11} /><span>{date}</span>
        </div>
      </div>
    </div>
  );
};

const PostDetail = ({ post, isFavorite, onToggleFavorite }) => {
  const image = getFeaturedImage(post);
  const category = getCategory(post);
  const title = stripHtml(post.title?.rendered);
  const date = formatDate(post.date);
  const content = post.content?.rendered || '';

  const handleShare = async () => {
    const url = post.link || window.location.href;
    if (navigator.share) { try { await navigator.share({ title, url }); } catch (_) {} }
    else { try { await navigator.clipboard.writeText(url); alert('Lien copié !'); } catch (_) {} }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="relative h-56 bg-gradient-to-br from-[#0b2240] to-[#1a3a6b] shrink-0">
        {image && <img src={image} alt={title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
        <div className="absolute bottom-4 left-4">
          <span className="bg-[#cc1818] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">{category}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-5 space-y-4">
          <h1 className="text-lg font-black text-[#0b2240] leading-tight">{title}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400"><Clock size={12} /><span>{date}</span></div>
            <div className="flex gap-2">
              <button onClick={() => onToggleFavorite(post.id)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center active:scale-90 transition-transform">
                <Bookmark size={14} className={isFavorite ? 'fill-[#cc1818] text-[#cc1818]' : 'text-gray-400'} />
              </button>
              <button onClick={handleShare} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center active:scale-90 transition-transform">
                <Share2 size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="article-content text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
          {post.link && (
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0b2240] text-white text-sm font-semibold rounded-xl py-3.5 px-5 w-full justify-center mt-4 hover:bg-[#0d2a50] transition-all">
              Lire l'article complet <ChevronRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const MerchTab = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-24 h-24 rounded-full bg-[#0b2240]/10 flex items-center justify-center mx-auto mb-5 border-2 border-[#0b2240]/10">
      <Shirt size={40} className="text-[#0b2240]" />
    </div>
    <h2 className="text-xl font-black text-[#0b2240] mb-2">Boutique Darphens</h2>
    <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">T-shirts, casquettes et accessoires — bientôt disponibles !</p>
    <span className="bg-[#cc1818]/10 border border-[#cc1818]/20 text-[#cc1818] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">Bientôt disponible</span>
  </div>
);

const FavoritesTab = ({ posts, favorites, onSelect, onToggleFavorite }) => {
  const saved = posts.filter((p) => favorites.includes(p.id));
  if (saved.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-3">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
          <Bookmark size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Aucun article sauvegardé</p>
        <p className="text-xs text-gray-300 max-w-[200px]">Appuie sur l'icône 🔖 pour retrouver tes articles ici</p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {saved.map((post) => <PostCard key={post.id} post={post} onSelect={onSelect} isFavorite={true} onToggleFavorite={onToggleFavorite} />)}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('news');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dn_favorites') || '[]'); } catch { return []; }
  });
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => {
    try { localStorage.setItem('dn_favorites', JSON.stringify(favorites)); } catch (_) {}
  }, [favorites]);

  const fetchPosts = async () => {
    try {
      setLoading(true); setError(false);
      const res = await fetch(`${WP_API_URL}/posts?_embed&per_page=12`);
      if (!res.ok) throw new Error();
      setPosts(await res.json());
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  const toggleFavorite = (id) => setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const tabs = [
    { id: 'news', label: 'Accueil', Icon: Home },
    { id: 'favorites', label: 'Sauvegardés', Icon: Bookmark },
    { id: 'merch', label: 'Boutique', Icon: Shirt },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-2xl border-x border-gray-200 overflow-hidden" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <header className="bg-[#0b2240] text-white px-4 py-3.5 sticky top-0 z-50 flex justify-between items-center shadow-lg shrink-0">
        {selectedPost ? (
          <>
            <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={18} />Retour
            </button>
            <span className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold">Darphens News</span>
            <div className="w-16" />
          </>
        ) : (
          <>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-[#cc1818] uppercase tracking-[0.22em] font-bold mb-0.5">Cap-Haïtien</span>
              <span className="text-[18px] font-black tracking-tight leading-none">Darphens News</span>
            </div>
            <button onClick={fetchPosts} disabled={loading} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <RefreshCw size={15} className={loading ? 'animate-spin text-white/40' : 'text-white/70'} />
            </button>
          </>
        )}
      </header>

      {selectedPost ? (
        <PostDetail post={selectedPost} isFavorite={favorites.includes(selectedPost.id)} onToggleFavorite={toggleFavorite} />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {activeTab === 'news' && (
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-4">
                  <WifiOff size={40} className="text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400">Impossible de charger les articles</p>
                  <button onClick={fetchPosts} className="flex items-center gap-1.5 text-sm text-[#cc1818] font-semibold">
                    <RefreshCw size={14} /> Réessayer
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4 pb-6">
                  {posts.map((post) => <PostCard key={post.id} post={post} onSelect={setSelectedPost} isFavorite={favorites.includes(post.id)} onToggleFavorite={toggleFavorite} />)}
                </div>
              )}
            </div>
          )}
          {activeTab === 'favorites' && <FavoritesTab posts={posts} favorites={favorites} onSelect={setSelectedPost} onToggleFavorite={toggleFavorite} />}
          {activeTab === 'merch' && <MerchTab />}
        </div>
      )}

      {!selectedPost && (
        <nav className="bg-white border-t border-gray-100 px-1 py-2 shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex justify-around">
            {tabs.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)} className="flex flex-col items-center gap-0.5 flex-1 py-1 transition-all active:scale-95">
                  <Icon size={22} className={active ? 'text-[#cc1818]' : 'text-gray-400'} strokeWidth={active ? 2.2 : 1.6} />
                  <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-[#cc1818]' : 'text-gray-400'}`}>{label}</span>
                  {active && <span className="w-1 h-1 rounded-full bg-[#cc1818]" />}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
  }
