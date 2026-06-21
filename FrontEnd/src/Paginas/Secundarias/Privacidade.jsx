import React from 'react';
import Layout from './Layout';
import { Shield, Lock, Eye, Users, FileText, Mail } from 'lucide-react';

export default function Privacidade() {
  const sections = [
    {
      icon: Shield,
      title: 'Coleta de Dados',
      content: 'Coletamos informações pessoais apenas quando necessário para fornecer os serviços da plataforma COMAES. Isso inclui nome, email, data de nascimento e informações educacionais.'
    },
    {
      icon: Lock,
      title: 'Proteção de Dados',
      content: 'Seus dados são protegidos com criptografia de ponta a ponta e armazenados em servidores seguros. Nunca compartilhamos suas informações pessoais com terceiros sem consentimento explícito.'
    },
    {
      icon: Eye,
      title: 'Transparência',
      content: 'Você tem o direito de acessar, modificar ou deletar suas informações pessoais a qualquer momento. Entre em contato conosco através da página de suporte para solicitar essas ações.'
    },
    {
      icon: Users,
      title: 'Cookies e Rastreamento',
      content: 'Usamos cookies apenas para melhorar sua experiência na plataforma. Você pode desativar cookies nas configurações do seu navegador a qualquer momento.'
    },
    {
      icon: FileText,
      title: 'Política de Conformidade',
      content: 'A plataforma COMAES está em conformidade com as legislações de proteção de dados. Nos comprometemos com as melhores práticas internacionais de privacidade.'
    },
    {
      icon: Mail,
      title: 'Contacte-nos',
      content: 'Tem dúvidas sobre privacidade? Entre em contacto conosco através de suporte@comaes.ao ou use o formulário de contacto na seção de suporte.'
    }
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Shield size={48} style={{ color: '#4F6EF7' }} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0F1117', marginBottom: 12 }}>Política de Privacidade</h1>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Na COMAES, sua privacidade é fundamental. Explicamos como coletamos, usamos e protegemos seus dados.
          </p>
        </div>

        {/* Sections Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 60 }}>
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E8EAEF',
                  padding: 32,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(79, 110, 247, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      background: '#EEF1FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4F6EF7'
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F1117' }}>{section.title}</h3>
                </div>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{section.content}</p>
              </div>
            );
          })}
        </div>

        {/* Last Updated */}
        <div style={{
          background: '#F7F8FC',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          borderLeft: '4px solid #4F6EF7'
        }}>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
            <strong>Última atualização:</strong> 26 de Maio de 2026
          </p>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>
            Esta política pode ser alterada sem aviso prévio. Recomendamos verificar regularmente para atualizações.
          </p>
        </div>

        {/* Support CTA */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            Precisa de mais informações? Entre em contacto com nossa equipe de suporte.
          </p>
          <a
            href="/suporte"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#4F6EF7',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              transition: 'background 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.target.style.background = '#4052D4'}
            onMouseLeave={(e) => e.target.style.background = '#4F6EF7'}
          >
            Contacte-nos
          </a>
        </div>
      </div>
    </Layout>
  );
}
