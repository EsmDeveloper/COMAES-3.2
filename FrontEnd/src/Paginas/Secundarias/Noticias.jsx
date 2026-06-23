import { useState, useEffect } from 'react';
import Layout from './Layout';
import {
  Newspaper, TrendingUp, Calendar, User, Clock,
  ExternalLink, Trophy, Zap, Share2,
  Bookmark, BookmarkCheck, Search, Eye, X,
  Sparkles, RefreshCw, Lightbulb, Mail,
} from 'lucide-react';

/* ─── palette ─────────────────────────────────────────────── */
const t = {
  primary:     '#4F6EF7',
  primarySoft: '#EEF1FE',
  success:     '#10B981',
  successSoft: '#ECFDF5',
  purple:      '#8B5CF6',
  purpleSoft:  '#F5F3FF',
  amber:       '#F59E0B',
  amberSoft:   '#FFFBEB',
  surface:     '#FFFFFF',
  bg:          '#F7F8FC',
  border:      '#E8EAEF',
  text:        '#0F1117',
  muted:       '#6B7280',
  subtle:      '#9CA3AF',
};

/* ─── category config ──────────────────────────────────────── */
const catConfig = {
  novidade:    { label: 'Novidade',    bg: t.primarySoft, accent: t.primary,  badgeBg: '#DBEAFE', badgeColor: '#1D4ED8', icon: Sparkles  },
  atualizacao: { label: 'Atualização', bg: t.successSoft, accent: t.success,  badgeBg: '#D1FAE5', badgeColor: '#065F46', icon: RefreshCw },
  evento:      { label: 'Evento',      bg: t.purpleSoft,  accent: t.purple,   badgeBg: '#EDE9FE', badgeColor: '#5B21B6', icon: Calendar  },
  dica:        { label: 'Dica',        bg: t.amberSoft,   accent: '#D97706',  badgeBg: '#FEF3C7', badgeColor: '#92400E', icon: Lightbulb },
};

const ALL_CATS = [
  { id: 'all',         label: 'Todas',        icon: Newspaper },
  { id: 'novidade',    label: 'Novidades',    icon: Sparkles  },
  { id: 'atualizacao', label: 'Atualizações', icon: RefreshCw },
  { id: 'evento',      label: 'Eventos',      icon: Calendar  },
  { id: 'dica',        label: 'Dicas',        icon: Lightbulb },
];

const cardBase = {
  background: t.surface, borderRadius: 16,
  border: `1px solid ${t.border}`,
  boxShadow: '0 1px 4px rgba(15,17,23,0.04)',
  overflow: 'hidden',
};

/* ─── Badge ────────────────────────────────────────────────── */
function Badge({ cat }) {
  const cfg = catConfig[cat] || catConfig.novidade;
  const Icon = cfg.icon;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: cfg.badgeBg, color: cfg.badgeColor,
      letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <Icon size={11} />{cfg.label}
    </span>
  );
}

/* ─── NewsCard ─────────────────────────────────────────────── */
function NewsCard({ id, category, title, excerpt, author, date, readTime, views, isBookmarked, onBookmark, imageUrl, tags = [] }) {
  const cfg = catConfig[category] || catConfig.novidade;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...cardBase,
        transition: 'box-shadow .2s ease, transform .2s ease',
        boxShadow: hovered ? '0 4px 16px rgba(15,17,23,0.08)' : cardBase.boxShadow,
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* layout: coluna em mobile, linha em sm+ */}
      <div className="flex flex-col sm:flex-row">

        {/* Imagem — só renderiza se existir */}
        {imageUrl && (
          <div className="relative sm:w-56 md:w-64 flex-shrink-0 h-48 sm:h-auto overflow-hidden">
            <img
              src={imageUrl} alt={title}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.03)' : 'scale(1)' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-2/5"
              style={{ background: 'linear-gradient(to top, rgba(15,17,23,0.4), transparent)' }} />
            <div className="absolute top-3 left-3"><Badge cat={category} /></div>
            <button
              onClick={() => onBookmark(id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200"
              style={{
                background: isBookmarked ? t.amber : 'rgba(255,255,255,0.9)',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                color: isBookmarked ? '#fff' : t.subtle,
              }}
            >
              {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex flex-col flex-1 min-w-0 p-4">

          {/* Top row — só sem imagem */}
          {!imageUrl && (
            <div className="flex justify-between items-start mb-2.5">
              <Badge cat={category} />
              <button
                onClick={() => onBookmark(id)}
                className="cursor-pointer transition-colors"
                style={{ background: 'none', border: 'none', color: isBookmarked ? t.amber : t.subtle }}
              >
                {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            </div>
          )}

          {/* Tags extra */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 3).map((tag, i) => (
                <span key={i} style={{
                  fontSize: 10, color: cfg.accent, background: cfg.bg,
                  borderRadius: 4, padding: '1px 8px', fontWeight: 500,
                }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Título */}
          <h3 style={{
            fontSize: 15, fontWeight: 700, color: hovered ? cfg.accent : t.text,
            lineHeight: 1.4, marginBottom: 6, transition: 'color .15s',
          }}>{title}</h3>

          {/* Excerpt */}
          <p style={{
            fontSize: 13, color: t.muted, lineHeight: 1.6, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{excerpt}</p>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t flex flex-col gap-2.5" style={{ borderColor: t.border }}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {[
                [User, author],
                [Calendar, date],
                [Clock, readTime],
                [Eye, views],
              ].map(([Icon, val], i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: t.subtle }}>
                  <Icon size={11} />{val}
                </span>
              ))}
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              fontSize: 12, fontWeight: 600, color: t.primary,
              background: t.primarySoft, border: 'none', cursor: 'pointer',
              padding: '6px 14px', borderRadius: 6, width: '100%',
              transition: 'opacity .15s',
            }}>
              Ler <ExternalLink size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FeaturedCard ─────────────────────────────────────────── */
function FeaturedCard({ title, description, imageUrl, category = 'novidade' }) {
  const gradients = {
    novidade:    'linear-gradient(135deg,#4F6EF7 0%,#6B8BF5 100%)',
    atualizacao: 'linear-gradient(135deg,#10B981 0%,#34D399 100%)',
    evento:      'linear-gradient(135deg,#8B5CF6 0%,#A78BFA 100%)',
    dica:        'linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)',
  };
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[180px] sm:min-h-[200px]">
      {imageUrl && (
        <img src={imageUrl} alt={title}
          className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0"
        style={{ background: imageUrl
          ? 'linear-gradient(135deg,rgba(15,17,23,0.7) 0%,rgba(15,17,23,0.3) 100%)'
          : (gradients[category] || gradients.novidade) }} />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-1.5 mb-2">
          <Trophy size={13} color="rgba(255,255,255,0.8)" />
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em' }}>
            DESTAQUE
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight mb-2">{title}</h2>
        <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4 max-w-sm">{description}</p>
        <button className="px-4 py-2 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-xs font-bold transition-colors">
          Saiba mais →
        </button>
      </div>
    </div>
  );
}

/* ─── QuickUpdateCard ──────────────────────────────────────── */
function QuickUpdateCard({ icon: Icon, title, description, date, color = 'blue' }) {
  const colors = {
    blue:   { bg: t.primarySoft, color: t.primary  },
    green:  { bg: t.successSoft, color: t.success  },
    purple: { bg: t.purpleSoft,  color: t.purple   },
    orange: { bg: t.amberSoft,   color: t.amber    },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl transition-colors"
      style={{ background: t.bg }}
      onMouseEnter={e => e.currentTarget.style.background = '#EDEEF5'}
      onMouseLeave={e => e.currentTarget.style.background = t.bg}>
      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ background: c.bg, color: c.color }}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 1 }}>{title}</div>
        <div style={{ fontSize: 11, color: t.muted, lineHeight: 1.4, marginBottom: 2 }}>{description}</div>
        <div style={{ fontSize: 10, color: t.subtle }}>{date}</div>
      </div>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────── */
export default function News() {
  const [news, setNews]                 = useState([]);
  const [bookmarked, setBookmarked]     = useState([]);
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [catCounts, setCatCounts]       = useState({});
  const [currentPage, setCurrentPage]   = useState(1);
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [toast, setToast]               = useState({ show: false, message: '', type: 'success' });
  const itemsPerPage = 4;

  const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

  /* Carregar notícias */
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/noticias`);
        const result = await res.json();
        if (!result.success) return;

        const parseTags = (raw) => {
          if (!raw) return [];
          if (Array.isArray(raw)) return raw;
          try {
            let p = JSON.parse(raw);
            if (typeof p === 'string') p = JSON.parse(p);
            if (Array.isArray(p)) return p;
            if (typeof p === 'string') return p.split(',').map(s => s.trim()).filter(Boolean);
            return [];
          } catch {
            return String(raw).replace(/['"\\]/g, '').split(',').map(s => s.trim()).filter(Boolean);
          }
        };

        const CATS = ['novidade', 'atualizacao', 'evento', 'dica'];

        const transformed = result.data.map(item => {
          const tagsArr = parseTags(item.tags);
          // A primeira tag que corresponda a uma categoria define a categoria
          const category = tagsArr.find(tg => CATS.includes(tg)) || 'novidade';
          // As restantes tags são exibidas como etiquetas extras
          const extraTags = tagsArr.filter(tg => !CATS.includes(tg));

          return {
            id:          item.id,
            category,
            title:       item.titulo,
            excerpt:     item.resumo || item.conteudo?.substring(0, 120) + '…',
            author:      item.autor?.nome || item.usuario?.nome || 'Equipe COMAES',
            date:        item.publicado_em
              ? new Date(item.publicado_em).toLocaleDateString('pt-PT', { day:'2-digit', month:'short', year:'numeric' })
              : 'Recentemente',
            readTime:    Math.ceil(((item.conteudo || '').split(' ').length) / 200) + ' min',
            views:       item.visualizacoes ?? 0,
            isBookmarked: false,
            imageUrl:    item.url_capa || null,
            tags:        extraTags,
          };
        });

        setNews(transformed);
        setCatCounts({
          all:         transformed.length,
          novidade:    transformed.filter(n => n.category === 'novidade').length,
          atualizacao: transformed.filter(n => n.category === 'atualizacao').length,
          evento:      transformed.filter(n => n.category === 'evento').length,
          dica:        transformed.filter(n => n.category === 'dica').length,
        });

        // Incrementar visualizações
        const viewPromises = transformed.map(item =>
          fetch(`${API_BASE}/noticias/${item.id}/visualizar`, { method: 'POST' })
            .then(r => r.json())
            .then(d => ({ id: item.id, views: d.visualizacoes }))
            .catch(() => ({ id: item.id, views: null }))
        );
        const results = await Promise.all(viewPromises);
        setNews(prev => prev.map(n => {
          const r = results.find(r => r.id === n.id);
          return r?.views ? { ...n, views: r.views } : n;
        }));
      } catch (err) {
        console.error('Erro ao carregar notícias:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [filter, search]);

  const filteredNews = news.filter(item => {
    const matchCat  = filter === 'all' || item.category === filter;
    const q         = search.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const totalPages      = Math.ceil(filteredNews.length / itemsPerPage);
  const currentNewsItems = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!emailNewsletter.includes('@')) {
      setToast({ show: true, message: 'Insira um e-mail válido.', type: 'error' });
      return;
    }
    setToast({ show: true, message: 'Inscrição realizada com sucesso!', type: 'success' });
    setEmailNewsletter('');
    setTimeout(() => setToast(p => ({ ...p, show: false })), 4000);
  };

  const toggleBookmark = (id) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    setNews(prev => prev.map(n => n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n));
  };

  const displayFeatured = news.filter(n => n.tags.some(tg => tg.toLowerCase() === 'destaque')).slice(0, 2);
  const featuredList    = displayFeatured.length > 0 ? displayFeatured : news.slice(0, 2);
  const quickUpdates    = news.filter(n => n.category === 'atualizacao' || n.category === 'novidade').slice(0, 3);
  const popular         = [...news].sort((a, b) => b.views - a.views).slice(0, 4);

  if (loading) return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `3px solid ${t.border}`, borderTopColor: t.primary,
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: t.muted, fontSize: 15 }}>Carregando notícias…</span>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── HEADER ── */}
        <div className="anim mb-5" style={{ animationDelay: '0ms' }}>
          <div className="rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${t.primary} 0%,#6B8BF5 100%)`, color: '#fff' }}>
            <div className="absolute top-0 right-0 w-44 h-44 rounded-full -translate-y-1/2 translate-x-1/4 opacity-10 bg-white" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Newspaper size={11} style={{ opacity: .75 }} />
                <span style={{ fontSize: 10, opacity: .75, fontWeight: 600, letterSpacing: '0.06em' }}>
                  NOTÍCIAS COMAES
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mb-1">Notícias da Plataforma</h1>
              <p className="text-xs sm:text-sm opacity-80">Fique por dentro das novidades, atualizações e eventos</p>
            </div>
            <div className="flex gap-3 relative">
              {[{ label: 'Publicações', value: news.length }, { label: 'Salvos', value: bookmarked.length }].map(s => (
                <div key={s.label} className="text-center rounded-xl px-4 py-2 backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div className="text-xl font-extrabold">{s.value}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BUSCA + FILTROS ── */}
        <div className="anim mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center" style={{ animationDelay: '40ms' }}>
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.subtle }} />
            <input
              type="text"
              placeholder="Pesquisar notícias, tags…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl pl-9 pr-9 py-2.5 text-sm outline-none transition-colors"
              style={{ border: `1.5px solid ${t.border}`, background: t.surface, color: t.text }}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.subtle }}>
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATS.map(cat => {
              const active = filter === cat.id;
              const cfg    = catConfig[cat.id];
              const Icon   = cat.icon;
              return (
                <button key={cat.id} onClick={() => setFilter(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all whitespace-nowrap"
                  style={{
                    border: active ? 'none' : `1.5px solid ${t.border}`,
                    background: active ? (cfg?.accent || t.primary) : t.surface,
                    color: active ? '#fff' : t.muted,
                  }}>
                  <Icon size={12} />
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0 rounded-full"
                    style={{ background: active ? 'rgba(255,255,255,0.2)' : t.bg, color: active ? '#fff' : t.subtle }}>
                    {catCounts[cat.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FEATURED ── */}
        {featuredList.length > 0 && (
          <div className="anim grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5" style={{ animationDelay: '80ms' }}>
            {featuredList.map(f => (
              <FeaturedCard key={f.id} title={f.title} description={f.excerpt}
                imageUrl={f.imageUrl} category={f.category} />
            ))}
          </div>
        )}

        {/* ── LAYOUT PRINCIPAL: lista + sidebar ── */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">

          {/* Lista de notícias */}
          <div className="flex-1 min-w-0 w-full">
            <div className="anim flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-3" style={{ animationDelay: '100ms' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: t.text }}>
                  {ALL_CATS.find(c => c.id === filter)?.label || 'Todas'}
                  <span className="ml-1 font-normal" style={{ color: t.subtle }}>({filteredNews.length})</span>
                </h3>
                {search && <p className="text-[11px] mt-0.5" style={{ color: t.muted }}>Resultados para "<strong>{search}</strong>"</p>}
              </div>
              <button className="flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: t.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Share2 size={12} /> Compartilhar
              </button>
            </div>

            {/* Cards */}
            <div className="anim flex flex-col gap-3.5" style={{ animationDelay: '120ms' }}>
              {currentNewsItems.length > 0 ? (
                currentNewsItems.map(item => (
                  <NewsCard key={item.id} {...item}
                    isBookmarked={bookmarked.includes(item.id)}
                    onBookmark={toggleBookmark} />
                ))
              ) : (
                <div style={{ ...cardBase, padding: '36px 20px', textAlign: 'center' }}>
                  <Newspaper size={36} style={{ color: t.border, margin: '0 auto 12px' }} />
                  <h4 className="text-sm font-semibold mb-1" style={{ color: t.text }}>Nenhuma notícia encontrada</h4>
                  <p className="text-xs mb-3" style={{ color: t.muted }}>Tente alterar os filtros ou termos de busca</p>
                  <button onClick={() => { setFilter('all'); setSearch(''); }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    style={{ background: t.primarySoft, color: t.primary, border: 'none' }}>
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="anim flex justify-center flex-wrap gap-1.5 mt-5" style={{ animationDelay: '140ms' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity"
                  style={{ border: `1.5px solid ${t.border}`, background: t.surface, color: t.muted, opacity: currentPage === 1 ? 0.4 : 1 }}>
                  Anterior
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={i} onClick={() => setCurrentPage(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold min-w-[30px]"
                      style={{
                        border: `1.5px solid ${currentPage === p ? t.primary : t.border}`,
                        background: currentPage === p ? t.primary : t.surface,
                        color: currentPage === p ? '#fff' : t.muted,
                      }}>{p}</button>
                  );
                })}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity"
                  style={{ border: `1.5px solid ${t.border}`, background: t.surface, color: t.muted, opacity: currentPage === totalPages ? 0.4 : 1 }}>
                  Próxima
                </button>
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="anim w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4" style={{ animationDelay: '130ms' }}>

            {/* Atualizações rápidas */}
            <div style={{ ...cardBase, padding: '14px 12px' }}>
              <div className="flex items-center gap-1.5 mb-3 pb-2.5" style={{ borderBottom: `1px solid ${t.border}` }}>
                <Zap size={13} color={t.amber} />
                <span className="text-[13px] font-bold" style={{ color: t.text }}>Atualizações</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {quickUpdates.length > 0 ? quickUpdates.map((n, i) => (
                  <QuickUpdateCard key={i}
                    icon={n.category === 'atualizacao' ? TrendingUp : Zap}
                    title={n.title}
                    description={n.excerpt.substring(0, 55) + '…'}
                    date={n.date}
                    color={n.category === 'atualizacao' ? 'blue' : 'green'}
                  />
                )) : <p className="text-xs py-2 text-center" style={{ color: t.muted }}>Sem atualizações</p>}
              </div>
            </div>

            {/* Categorias */}
            <div style={{ ...cardBase, padding: '14px 12px' }}>
              <h3 className="text-[13px] font-bold pb-2.5 mb-2.5" style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}>
                Categorias
              </h3>
              <div className="flex flex-col gap-1">
                {ALL_CATS.map(cat => {
                  const active = filter === cat.id;
                  const cfg    = catConfig[cat.id];
                  const Icon   = cat.icon;
                  return (
                    <button key={cat.id} onClick={() => setFilter(cat.id)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-all text-[11px]"
                      style={{
                        background: active ? (cfg?.bg || t.primarySoft) : 'transparent',
                        border: active ? `1px solid ${cfg?.accent || t.primary}22` : '1px solid transparent',
                        color: active ? (cfg?.accent || t.primary) : t.muted,
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.bg; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                      <span className="flex items-center gap-1.5 font-semibold"><Icon size={12} />{cat.label}</span>
                      <span className="text-[9px] font-bold px-1.5 rounded-full"
                        style={{ background: active ? `${cfg?.accent || t.primary}22` : t.bg, color: active ? (cfg?.accent || t.primary) : t.subtle }}>
                        {catCounts[cat.id] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mais populares */}
            <div style={{ ...cardBase, padding: '14px 12px' }}>
              <h3 className="text-[13px] font-bold pb-2.5 mb-2.5" style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}>
                Mais Populares
              </h3>
              <div className="flex flex-col gap-2">
                {popular.map(item => (
                  <div key={item.id}
                    className="flex gap-2 items-start p-1.5 rounded-md cursor-pointer transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = t.bg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* Miniatura — só mostra se tiver imagem */}
                    {item.imageUrl && (
                      <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0" style={{ background: t.bg }}>
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold leading-tight line-clamp-2 mb-1" style={{ color: t.text }}>
                        {item.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px]" style={{ color: t.subtle }}>
                        <Eye size={9} />{item.views}
                        <Clock size={9} />{item.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div style={{ ...cardBase, padding: '14px 12px', background: `linear-gradient(135deg,${t.primary}12 0%,${t.purple}12 100%)` }}>
              <h3 className="text-[13px] font-bold mb-1" style={{ color: t.text }}>Receba Novidades</h3>
              <p className="text-[11px] mb-2.5" style={{ color: t.muted }}>Inscreva-se na nossa newsletter</p>
              <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
                <input type="email" placeholder="seu@email.com"
                  value={emailNewsletter}
                  onChange={e => setEmailNewsletter(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none box-border"
                  style={{ border: `1.5px solid ${t.border}`, background: t.surface, color: t.text }} />
                <button type="submit"
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors"
                  style={{ background: t.primary, border: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4052D4'}
                  onMouseLeave={e => e.currentTarget.style.background = t.primary}>
                  <Mail size={11} />Inscrever
                </button>
              </form>
            </div>

          </aside>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 px-4 py-3 rounded-xl text-xs font-semibold text-white shadow-lg z-50 anim"
          style={{ background: toast.type === 'success' ? t.success : '#EF4444', maxWidth: 300 }}>
          {toast.message}
        </div>
      )}
    </Layout>
  );
}
