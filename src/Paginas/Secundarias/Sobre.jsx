import React from 'react';
import Layout from './Layout';
import { Zap, Globe, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

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
  red:         '#EF4444',
  redSoft:     '#FEF2F2',
  surface:     '#FFFFFF',
  bg:          '#F7F8FC',
  border:      '#E8EAEF',
  text:        '#0F1117',
  muted:       '#6B7280',
  subtle:      '#9CA3AF',
};

const card = {
  background: t.surface,
  borderRadius: 20,
  border: `1px solid ${t.border}`,
  boxShadow: '0 2px 12px rgba(15,17,23,0.05)',
};

/* ─── Data ───────────────────────────────────────────────────── */
const offerings = [
  { emoji: '📚', title: 'Testes Diversificados',       description: 'Questões em múltiplas áreas do conhecimento, desde programação até história, com diferentes níveis de dificuldade.', accent: t.primary,  soft: t.primarySoft },
  { emoji: '📊', title: 'Acompanhamento de Progresso', description: 'Dashboard completo com gráficos e estatísticas para monitorar seu desenvolvimento ao longo do tempo.',                accent: t.success,  soft: t.successSoft },
  { emoji: '🏆', title: 'Sistema de Ranking',          description: 'Competição saudável com rankings globais e por áreas, incentivando a superação pessoal.',                            accent: t.amber,    soft: t.amberSoft   },
  { emoji: '👥', title: 'Comunidade Ativa',            description: 'Conecte-se com outros estudantes, compartilhe conhecimentos e aprenda em conjunto.',                                  accent: t.purple,   soft: t.purpleSoft  },
];

const founders = [
  {
    name: 'Cornélio Mbongo',
    role: 'Arquiteto de Sistemas',
    description: 'Especialista em backend e arquitetura de dados, responsável por construir a base robusta e escalável que sustenta toda a plataforma.',
    img: 'https://nappy.co/photo/N_Ayxnji-zQ9w0r_QKQj5',
    accent: t.primary,
    soft: t.primarySoft,
  },
  {
    name: 'Esménio Manuel',
    role: 'Designer de Experiência',
    description: 'Com foco na UX e no design de interfaces, moldou a jornada visual e interativa que torna o aprendizado no COMAES envolvente e intuitivo.',
    img: 'https://nappy.co/photo/wd7DvPDbBGNmhFy-qQ_qY',
    accent: t.purple,
    soft: t.purpleSoft,
  },
  {
    name: 'José Mariche',
    role: 'Especialista em Conteúdo',
    description: 'Pedagogo e pesquisador que desenvolveu a metodologia dos testes, garantindo a qualidade e relevância acadêmica de todo o conteúdo.',
    img: 'https://nappy.co/photo/etcnq-2iS4xaqRQ3SQWvj',
    accent: t.success,
    soft: t.successSoft,
  },
];

const timeline = [
  { num: '01', title: 'O Início',    text: 'Fundado em 2023 por estudantes universitários que identificaram a necessidade de uma plataforma prática para testar conhecimentos acadêmicos.', accent: t.primary },
  { num: '02', title: 'Crescimento', text: 'Em menos de um ano, alcançamos milhares de usuários em diversas universidades, expandindo para múltiplas áreas do conhecimento.',              accent: t.purple  },
  { num: '03', title: 'Hoje',        text: 'Continuamos inovando, adicionando novos recursos e mantendo nosso compromisso com a educação acessível e de qualidade.',                      accent: t.success },
];

const values = [
  { title: 'Acessibilidade', desc: 'Educação gratuita e de qualidade para todos',                    accent: t.primary },
  { title: 'Inovação',       desc: 'Sempre buscando novas formas de melhorar a aprendizagem',        accent: t.purple  },
  { title: 'Comunidade',     desc: 'Juntos aprendemos mais e melhor',                                accent: t.success },
  { title: 'Qualidade',      desc: 'Conteúdo rigoroso e atualizado constantemente',                  accent: t.amber   },
];

/* ─── Section header helper ──────────────────────────────────── */
function SectionHeader({ title, subtitle, center = true }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 36 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 8 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 15, color: t.muted, maxWidth: 520, margin: center ? '0 auto' : undefined, lineHeight: 1.65 }}>{subtitle}</p>}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
export default function About() {
  return (
    <Layout>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .anim  { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .card-hover:hover { box-shadow: 0 8px 32px rgba(15,17,23,0.10) !important; transform: translateY(-2px); }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Hero header ── */}
        <div className="anim" style={{ marginBottom: 28, animationDelay: '0ms' }}>
          <div style={{
            background: `linear-gradient(135deg, ${t.primary} 0%, #6B8BF5 100%)`,
            borderRadius: 24, padding: '44px 48px', color: '#fff',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -50, right: -50,  width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles size={14} style={{ opacity: 0.75 }} />
                <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Sobre a COMAES</span>
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>
                Transformando a educação<br />através da tecnologia
              </h1>
              <p style={{ fontSize: 16, opacity: 0.82, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
                Uma plataforma criada por estudantes, para estudantes — com o propósito de tornar o aprendizado mais acessível, motivador e eficaz.
              </p>
            </div>
          </div>
        </div>

        {/* ── Missão + Visão side by side ── */}
        <div className="anim" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28, animationDelay: '60ms' }}>
          {[
            {
              icon: <Zap size={20} />,
              title: 'Nossa Missão',
              text: 'Democratizar o acesso à educação de qualidade, proporcionando uma plataforma onde estudantes podem testar seus conhecimentos, acompanhar seu progresso e competir de forma saudável com outros aprendizes.',
              accent: t.primary, soft: t.primarySoft,
            },
            {
              icon: <Globe size={20} />,
              title: 'Nossa Visão',
              text: 'Ser a principal plataforma de testes de conhecimento do mundo, ajudando milhões de estudantes a alcançarem seu potencial máximo através da aprendizagem gamificada e colaborativa.',
              accent: t.success, soft: t.successSoft,
            },
          ].map(item => (
            <div key={item.title} className="card-hover" style={{ ...card, padding: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: item.soft, color: item.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                {item.icon}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 10 }}>{item.title}</h2>
              <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.7 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* ── O que oferecemos ── */}
        <div className="anim" style={{ marginBottom: 36, animationDelay: '100ms' }}>
          <SectionHeader title="O Que Oferecemos" subtitle="Ferramentas e recursos pensados para maximizar o seu potencial académico" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {offerings.map(o => (
              <div key={o.title} className="card-hover" style={{ ...card, padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: o.soft, fontSize: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {o.emoji}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 6 }}>{o.title}</h3>
                  <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.65 }}>{o.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Founders ── */}
        <div className="anim" style={{ marginBottom: 36, animationDelay: '140ms' }}>
          <SectionHeader
            title="Os Fundadores do COMAES"
            subtitle="A plataforma foi idealizada e desenvolvida por três estudantes apaixonados por educação e tecnologia, unidos pela visão de criar uma ferramenta acessível e motivadora."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {founders.map(f => (
              <div key={f.name} className="card-hover" style={{ ...card, padding: '28px 22px', textAlign: 'center' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                  <img src={f.img} alt={f.name} style={{
                    width: 84, height: 84, borderRadius: '50%', objectFit: 'cover',
                    border: `3px solid ${t.surface}`,
                    boxShadow: `0 0 0 3px ${f.accent}30`,
                  }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 4 }}>{f.name}</h3>
                <div style={{
                  display: 'inline-block', marginBottom: 12,
                  padding: '3px 12px', borderRadius: 999,
                  background: f.soft, color: f.accent,
                  fontSize: 11, fontWeight: 700,
                }}>
                  {f.role}
                </div>
                <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.65, marginBottom: 16 }}>{f.description}</p>
                <a href="#" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 13, fontWeight: 600, color: f.accent,
                  textDecoration: 'none',
                }}>
                  Conhecer mais <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="anim" style={{ marginBottom: 36, animationDelay: '180ms' }}>
          <div style={{
            ...card,
            padding: '36px 40px',
            background: t.primarySoft,
            border: `1px solid #DDE1F7`,
          }}>
            <SectionHeader title="Nossa História" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {timeline.map((item, i) => (
                <div key={item.num} style={{
                  display: 'flex', gap: 22, alignItems: 'flex-start',
                  paddingBottom: i < timeline.length - 1 ? 28 : 0,
                  position: 'relative',
                }}>
                  {/* Line */}
                  {i < timeline.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 20, top: 44,
                      width: 2, height: 'calc(100% - 20px)',
                      background: `${item.accent}30`,
                    }} />
                  )}
                  {/* Number bubble */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: item.accent, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                    boxShadow: `0 0 0 4px ${item.accent}20`,
                    zIndex: 1,
                  }}>
                    {item.num}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Values ── */}
        <div className="anim" style={{ marginBottom: 36, animationDelay: '200ms' }}>
          <SectionHeader title="Nossos Valores" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {values.map(v => (
              <div key={v.title} className="card-hover" style={{
                ...card, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${v.accent}18`, color: v.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 2 }}>{v.title}</h3>
                  <p style={{ fontSize: 12, color: t.muted }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="anim" style={{ animationDelay: '220ms' }}>
          <div style={{
            borderRadius: 24, padding: '44px 48px', textAlign: 'center',
            background: `linear-gradient(135deg, ${t.primary} 0%, ${t.purple} 100%)`,
            color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40,  width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Junte-se à Nossa Comunidade</h2>
              <p style={{ fontSize: 15, opacity: 0.82, marginBottom: 28 }}>Comece sua jornada de aprendizado hoje mesmo</p>
              <button style={{
                padding: '13px 32px',
                background: 'rgba(255,255,255,0.95)', color: t.text,
                border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.target.style.opacity = 0.88}
              onMouseLeave={e => e.target.style.opacity = 1}>
                Começar Agora →
              </button>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}