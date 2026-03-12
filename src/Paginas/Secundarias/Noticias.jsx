import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import {
  Newspaper, TrendingUp, Calendar, User, Clock,
  ExternalLink, BookOpen, Trophy, Zap, Share2,
  Bookmark, BookmarkCheck, Filter, Search, Eye, X
} from 'lucide-react';

/* ─── Design tokens ──────────────────────────────────────────── */
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

/* ─── Category config ────────────────────────────────────────── */
const catConfig = {
  novidade:    { label: '🎉 Novidade',    bg: t.primarySoft, color: t.primary,  accent: t.primary,  badgeBg: '#DBEAFE', badgeColor: '#1D4ED8' },
  'atualização':{ label: '🔄 Atualização',bg: t.successSoft, color: t.success,  accent: t.success,  badgeBg: '#D1FAE5', badgeColor: '#065F46' },
  evento:      { label: '📅 Evento',      bg: t.purpleSoft,  color: t.purple,   accent: t.purple,   badgeBg: '#EDE9FE', badgeColor: '#5B21B6' },
  dica:        { label: '💡 Dica',        bg: t.amberSoft,   color: t.amber,    accent: '#D97706',  badgeBg: '#FEF3C7', badgeColor: '#92400E' },
};

const ALL_CATS = [
  { id: 'all',          label: 'Todas',        emoji: '📰' },
  { id: 'novidade',     label: 'Novidades',    emoji: '🎉' },
  { id: 'atualização',  label: 'Atualizações', emoji: '🔄' },
  { id: 'evento',       label: 'Eventos',      emoji: '📅' },
  { id: 'dica',         label: 'Dicas',        emoji: '💡' },
];

/* ─── Helpers ────────────────────────────────────────────────── */
const cardBase = {
  background: t.surface,
  borderRadius: 18,
  border: `1px solid ${t.border}`,
  boxShadow: '0 2px 12px rgba(15,17,23,0.05)',
  overflow: 'hidden',
};

/* ─── Pill badge ─────────────────────────────────────────────── */
function Badge({ cat }) {
  const cfg = catConfig[cat] || catConfig['novidade'];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: cfg.badgeBg, color: cfg.badgeColor,
      letterSpacing: '0.02em',
    }}>
      {cfg.label}
    </span>
  );
}

/* ─── News Card ──────────────────────────────────────────────── */
function NewsCard({ id, category, title, excerpt, author, date, readTime, views, isBookmarked, onBookmark, imageUrl, tags = [] }) {
  const cfg = catConfig[category] || catConfig['novidade'];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...cardBase,
        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
        boxShadow: hovered ? '0 8px 32px rgba(15,17,23,0.10)' : cardBase.boxShadow,
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {imageUrl && (
        <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
          <img src={imageUrl} alt={title} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }} />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(to top, rgba(15,17,23,0.5), transparent)',
          }} />
          {/* Category badge over image */}
          <div style={{ position: 'absolute', top: 14, left: 14 }}>
            <Badge cat={category} />
          </div>
          {/* Bookmark */}
          <button onClick={() => onBookmark(id)} style={{
            position: 'absolute', top: 10, right: 12,
            background: isBookmarked ? t.amber : 'rgba(255,255,255,0.9)',
            border: 'none', borderRadius: '50%',
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'background 0.2s',
            color: isBookmarked ? '#fff' : t.subtle,
          }}>
            {isBookmarked ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>}
          </button>
        </div>
      )}

      <div style={{ padding: '20px 22px' }}>
        {/* Top row (no image fallback) */}
        {!imageUrl && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Badge cat={category} />
            <button onClick={() => onBookmark(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: isBookmarked ? t.amber : t.subtle,
            }}>
              {isBookmarked ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}
            </button>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={{
                fontSize: 11, color: cfg.color, background: cfg.bg,
                borderRadius: 6, padding: '2px 8px', fontWeight: 500,
              }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 style={{
          fontSize: 17, fontWeight: 700, color: t.text,
          lineHeight: 1.45, marginBottom: 8,
          transition: 'color 0.15s',
          ...(hovered ? { color: cfg.accent } : {}),
        }}>{title}</h3>

        {/* Excerpt */}
        <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.65, marginBottom: 16 }}>
          {excerpt}
        </p>

        {/* Meta footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 14, borderTop: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: t.subtle }}>
              <User size={12}/> {author}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: t.subtle }}>
              <Calendar size={12}/> {date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: t.subtle }}>
              <Clock size={12}/> {readTime}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: t.subtle }}>
              <Eye size={12}/> {views}
            </span>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 600, color: t.primary,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 10px', borderRadius: 8,
              background: t.primarySoft,
              transition: 'opacity 0.15s',
            }}>
              Ler <ExternalLink size={12}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Featured Hero Card ─────────────────────────────────────── */
function FeaturedCard({ title, description, imageUrl, category = 'novidade', ctaText = 'Saiba mais' }) {
  const gradients = {
    novidade:    'linear-gradient(135deg, #4F6EF7 0%, #6B8BF5 100%)',
    'atualização':'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    evento:      'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    dica:        'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  };

  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden', position: 'relative',
      minHeight: 240,
    }}>
      {/* BG image */}
      {imageUrl && (
        <img src={imageUrl} alt={title} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        }}/>
      )}
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: imageUrl
          ? 'linear-gradient(135deg, rgba(15,17,23,0.75) 0%, rgba(15,17,23,0.4) 100%)'
          : (gradients[category] || gradients['novidade']),
      }}/>

      {/* Content */}
      <div style={{ position: 'relative', padding: '36px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Trophy size={16} color="rgba(255,255,255,0.8)"/>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Destaque
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 10 }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 22, maxWidth: 420 }}>{description}</p>
        <button style={{
          padding: '10px 22px', background: 'rgba(255,255,255,0.95)',
          color: t.text, border: 'none', borderRadius: 10,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e=>e.target.style.background='#fff'}
        onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.95)'}>
          {ctaText} →
        </button>
      </div>
    </div>
  );
}

/* ─── Quick Update ───────────────────────────────────────────── */
function QuickUpdateCard({ icon: Icon, title, description, date, color = 'blue' }) {
  const colors = {
    blue:   { bg: t.primarySoft, color: t.primary },
    green:  { bg: t.successSoft, color: t.success },
    purple: { bg: t.purpleSoft,  color: t.purple  },
    orange: { bg: t.amberSoft,   color: t.amber   },
  };
  const c = colors[color] || colors.blue;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px',
      background: t.bg, borderRadius: 12,
      transition: 'background 0.15s',
    }}
    onMouseEnter={e=>e.currentTarget.style.background='#EDEEF5'}
    onMouseLeave={e=>e.currentTarget.style.background=t.bg}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: c.bg, color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16}/>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginBottom: 4 }}>{description}</div>
        <div style={{ fontSize: 11, color: t.subtle }}>{date}</div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function News() {
  const [news, setNews]           = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [catCounts, setCatCounts] = useState({});

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/noticias');
        const result = await response.json();
        if (result.success) {
          const transformed = result.data.map(item => {
            let category = 'novidade';
            if (item.tags) {
              const tagsArr = Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || '[]');
              if (tagsArr.some(t => t.toLowerCase().includes('evento'))) category = 'evento';
              else if (tagsArr.some(t => t.toLowerCase().includes('atualização') || t.toLowerCase().includes('update'))) category = 'atualização';
              else if (tagsArr.some(t => t.toLowerCase().includes('dica'))) category = 'dica';
            }
            return {
              id: item.id, category,
              title: item.titulo,
              excerpt: item.resumo || item.conteudo.substring(0, 150) + '…',
              author: item.usuario?.nome || 'Equipe COMAES',
              date: item.publicado_em
                ? new Date(item.publicado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
                : 'Recentemente',
              readTime: Math.ceil(item.conteudo.split(' ').length / 200) + ' min',
              views: Math.floor(Math.random() * 1000) + 100,
              isBookmarked: false,
              imageUrl: item.url_capa || 'https://images.unsplash.com/photo-1504711432869-5d39a110fdd7?auto=format&fit=crop&w=800',
              tags: Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || '[]'),
            };
          });
          setNews(transformed);
          setCatCounts({
            all: transformed.length,
            novidade:      transformed.filter(n => n.category === 'novidade').length,
            'atualização': transformed.filter(n => n.category === 'atualização').length,
            evento:        transformed.filter(n => n.category === 'evento').length,
            dica:          transformed.filter(n => n.category === 'dica').length,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const filteredNews = news.filter(item => {
    const matchFilter = filter === 'all' || item.category === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const toggleBookmark = (id) => {
    setBookmarked(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
    setNews(prev => prev.map(n =>
      n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n
    ));
  };

  const featuredNews = (news.filter(n => n.tags.some(tg => tg.toLowerCase().includes('destaque'))) || news).slice(0, 2);
  const displayFeatured = featuredNews.length > 0 ? featuredNews : news.slice(0, 2);
  const quickUpdates = news.filter(n => n.category === 'atualização' || n.category === 'novidade').slice(0, 3);
  const popular = [...news].sort((a,b) => b.views - a.views).slice(0, 4);

  if (loading) {
    return (
      <Layout>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:16 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:`3px solid ${t.border}`, borderTopColor:t.primary, animation:'spin 0.8s linear infinite' }}/>
          <span style={{ color:t.muted, fontSize:15 }}>Carregando notícias…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div className="anim" style={{ marginBottom: 32, animationDelay:'0ms' }}>
          <div style={{
            background: `linear-gradient(135deg, ${t.primary} 0%, #6B8BF5 100%)`,
            borderRadius: 24, padding: '36px 40px', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap:'wrap', gap:20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', top:-50, right:-50, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }}/>
            <div style={{ position:'absolute', bottom:-60, right:120, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
            <div style={{ position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <Newspaper size={14} style={{ opacity:0.75 }}/>
                <span style={{ fontSize:12, opacity:0.75, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  Notícias COMAES
                </span>
              </div>
              <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Notícias da Plataforma</h1>
              <p style={{ fontSize:14, opacity:0.8 }}>Fique por dentro das novidades, atualizações e eventos</p>
            </div>
            <div style={{ display:'flex', gap:24, position:'relative' }}>
              {[
                { label:'Publicações', value: news.length },
                { label:'Salvos', value: bookmarked.length },
              ].map(s => (
                <div key={s.label} style={{
                  background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 20px', textAlign:'center', backdropFilter:'blur(8px)',
                }}>
                  <div style={{ fontSize:24, fontWeight:800 }}>{s.value}</div>
                  <div style={{ fontSize:12, opacity:0.75, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="anim" style={{ marginBottom:28, animationDelay:'50ms' }}>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            {/* Search */}
            <div style={{ position:'relative', flex:1, minWidth:220 }}>
              <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:t.subtle }}/>
              <input
                type="text"
                placeholder="Pesquisar notícias, tags…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width:'100%', padding:'12px 16px 12px 42px',
                  border:`1.5px solid ${t.border}`, borderRadius:12,
                  fontSize:14, color:t.text, background:t.surface,
                  outline:'none', boxSizing:'border-box',
                  transition:'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = t.primary}
                onBlur={e => e.target.style.borderColor = t.border}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:t.subtle,
                }}>
                  <X size={14}/>
                </button>
              )}
            </div>

            {/* Category pill filters */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {ALL_CATS.map(cat => {
                const active = filter === cat.id;
                const cfg = catConfig[cat.id];
                return (
                  <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                    padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer',
                    border: active ? 'none' : `1.5px solid ${t.border}`,
                    background: active ? (cfg ? cfg.accent : t.primary) : t.surface,
                    color: active ? '#fff' : t.muted,
                    transition:'all 0.18s',
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                    <span>{cat.emoji}</span>
                    {cat.label}
                    <span style={{
                      fontSize:11, fontWeight:700, padding:'1px 6px',
                      borderRadius:999,
                      background: active ? 'rgba(255,255,255,0.25)' : t.bg,
                      color: active ? '#fff' : t.subtle,
                    }}>
                      {catCounts[cat.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Featured strip ── */}
        {displayFeatured.length > 0 && (
          <div className="anim" style={{
            display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
            gap:18, marginBottom:32, animationDelay:'100ms',
          }}>
            {displayFeatured.map(f => (
              <FeaturedCard key={f.id} title={f.title} description={f.excerpt}
                imageUrl={f.imageUrl} category={f.category} />
            ))}
          </div>
        )}

        {/* ── Main layout ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 310px', gap:24, alignItems:'start' }}>

          {/* Left: news list */}
          <div>
            {/* List header */}
            <div className="anim" style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              marginBottom:18, animationDelay:'140ms',
            }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:700, color:t.text }}>
                  {ALL_CATS.find(c => c.id === filter)?.label || 'Todas'}{' '}
                  <span style={{ color:t.subtle, fontWeight:400 }}>({filteredNews.length})</span>
                </h3>
                {search && (
                  <p style={{ fontSize:12, color:t.muted, marginTop:2 }}>
                    Resultados para "<strong>{search}</strong>"
                  </p>
                )}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <button style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:t.primary, background:'none', border:'none', cursor:'pointer' }}>
                  <Share2 size={14}/> Compartilhar
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:t.muted }}>
                  <BookmarkCheck size={14} style={{ color:t.amber }}/> {bookmarked.length} salvos
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="anim" style={{ display:'flex', flexDirection:'column', gap:18, animationDelay:'180ms' }}>
              {filteredNews.length > 0 ? (
                filteredNews.map(item => (
                  <NewsCard
                    key={item.id} {...item}
                    isBookmarked={bookmarked.includes(item.id)}
                    onBookmark={toggleBookmark}
                  />
                ))
              ) : (
                <div style={{
                  ...cardBase, padding:'60px 24px', textAlign:'center',
                }}>
                  <Newspaper size={40} style={{ color:t.border, margin:'0 auto 14px' }}/>
                  <h4 style={{ fontSize:16, fontWeight:600, color:t.text, marginBottom:6 }}>Nenhuma notícia encontrada</h4>
                  <p style={{ fontSize:14, color:t.muted }}>Tente alterar os filtros ou termos de busca</p>
                  <button onClick={() => { setFilter('all'); setSearch(''); }} style={{
                    marginTop:16, padding:'9px 20px', background:t.primarySoft,
                    color:t.primary, border:'none', borderRadius:10,
                    fontSize:13, fontWeight:600, cursor:'pointer',
                  }}>
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredNews.length > 6 && (
              <div className="anim" style={{ display:'flex', justifyContent:'center', gap:8, marginTop:28, animationDelay:'220ms' }}>
                {['Anterior', '1', '2', '3', '…', 'Próxima'].map((p, i) => (
                  <button key={i} style={{
                    padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer',
                    border:`1.5px solid ${p === '1' ? t.primary : t.border}`,
                    background: p === '1' ? t.primary : t.surface,
                    color: p === '1' ? '#fff' : t.muted,
                    transition:'all 0.15s',
                  }}
                  onMouseEnter={e => { if(p !== '1') { e.currentTarget.style.background=t.bg; e.currentTarget.style.color=t.text; } }}
                  onMouseLeave={e => { if(p !== '1') { e.currentTarget.style.background=t.surface; e.currentTarget.style.color=t.muted; } }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="anim" style={{ display:'flex', flexDirection:'column', gap:18, position:'sticky', top:24, animationDelay:'160ms' }}>

            {/* Quick updates */}
            <div style={{ ...cardBase, padding:'22px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, paddingBottom:14, borderBottom:`1px solid ${t.border}` }}>
                <Zap size={16} color={t.amber}/>
                <span style={{ fontSize:15, fontWeight:700, color:t.text }}>Atualizações Recentes</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {quickUpdates.map((n, i) => (
                  <QuickUpdateCard key={i}
                    icon={n.category === 'atualização' ? TrendingUp : Zap}
                    title={n.title}
                    description={n.excerpt.substring(0, 65) + '…'}
                    date={n.date}
                    color={n.category === 'atualização' ? 'blue' : 'green'}
                  />
                ))}
              </div>
            </div>

            {/* Categories sidebar */}
            <div style={{ ...cardBase, padding:'22px 20px' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${t.border}` }}>
                Categorias
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {ALL_CATS.map(cat => {
                  const active = filter === cat.id;
                  const cfg = catConfig[cat.id];
                  return (
                    <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'10px 12px', borderRadius:10, cursor:'pointer',
                      background: active ? (cfg?.bg || t.primarySoft) : 'transparent',
                      border: active ? `1.5px solid ${cfg?.accent || t.primary}20` : '1.5px solid transparent',
                      color: active ? (cfg?.accent || t.primary) : t.muted,
                      transition:'all 0.15s',
                    }}
                    onMouseEnter={e => { if(!active) e.currentTarget.style.background=t.bg; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:16 }}>{cat.emoji}</span>
                        <span style={{ fontSize:13, fontWeight:600 }}>{cat.label}</span>
                      </div>
                      <span style={{
                        fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999,
                        background: active ? (cfg?.accent || t.primary) + '20' : t.bg,
                        color: active ? (cfg?.accent || t.primary) : t.subtle,
                      }}>
                        {catCounts[cat.id] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular */}
            <div style={{ ...cardBase, padding:'22px 20px' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${t.border}` }}>
                Mais Populares
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {popular.map((item, i) => (
                  <div key={item.id} style={{
                    display:'flex', gap:12, alignItems:'flex-start',
                    padding:'10px', borderRadius:10,
                    transition:'background 0.15s', cursor:'pointer',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=t.bg}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{
                      width:42, height:42, borderRadius:10, overflow:'hidden', flexShrink:0,
                      background:t.bg,
                    }}>
                      {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{
                        fontSize:13, fontWeight:600, color:t.text, lineHeight:1.4,
                        marginBottom:4,
                        overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                      }}>
                        {item.title}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:t.subtle }}>
                        <Eye size={10}/> {item.views}
                        <Clock size={10}/> {item.date}
                      </div>
                    </div>
                    <div style={{
                      width:22, height:22, borderRadius:6, background:t.bg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:800, color:t.subtle, flexShrink:0,
                    }}>
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div style={{
              borderRadius:18, overflow:'hidden', position:'relative',
              background:'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 100%)',
              padding:'26px 22px',
            }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }}/>
              <div style={{ position:'relative' }}>
                <div style={{ fontSize:18, marginBottom:8 }}>📬</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:8 }}>Receba Novidades</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', marginBottom:18, lineHeight:1.55 }}>
                  Inscreva-se para receber as principais notícias por email
                </p>
                <input type="email" placeholder="Seu email"
                  style={{
                    width:'100%', padding:'10px 14px', borderRadius:10,
                    border:'none', fontSize:13, marginBottom:10,
                    boxSizing:'border-box', outline:'none',
                  }}
                />
                <button style={{
                  width:'100%', padding:'11px 0',
                  background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)',
                  borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
                  backdropFilter:'blur(8px)', transition:'background 0.2s',
                }}
                onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.25)'}
                onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.15)'}>
                  Inscrever-se →
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}