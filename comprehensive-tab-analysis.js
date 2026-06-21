#!/usr/bin/env node

/**
 * comprehensive-tab-analysis.js
 * Análise PROFUNDA de abas para identificar:
 * 1. Abas que não renderizam conteúdo quando carregam dados
 * 2. Componentes sem empty states
 * 3. Problemas de renderização específicos
 * 4. Falta de fallbacks ou loading states
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_TABS_DIR = 'FrontEnd/src/Administrador';

const TAB_COMPONENTS = {
  'AdminStats.jsx': {
    expects: ['useState', 'useEffect', 'loading', 'skeleton'],
    shouldHave: ['loading state', 'error state', 'data rendering'],
    criticalPatterns: ['return null', 'if (!stats)']
  },
  'TorneiosTab.jsx': {
    expects: ['torneios list', 'filteredTorneios', 'map'],
    shouldHave: ['empty message', 'loading indicator', 'error handling'],
    criticalPatterns: ['filteredTorneios.length === 0']
  },
  'CertificadosTab.jsx': {
    expects: ['certificados list', 'medals', 'status'],
    shouldHave: ['empty state', 'loading', 'filter'],
    criticalPatterns: ['length === 0']
  },
  'NotificationsTab.jsx': {
    expects: ['notifications list', 'users select'],
    shouldHave: ['empty message', 'loading', 'error alert'],
    criticalPatterns: ['length === 0', 'Nenhum']
  },
  'QuestoesTorneiosTab.jsx': {
    expects: ['questoes list', 'search', 'filters'],
    shouldHave: ['empty state', 'loading', 'pagina ção'],
    criticalPatterns: ['length === 0']
  },
  'QuestoesTestesTab.jsx': {
    expects: ['questoes list', 'test filter'],
    shouldHave: ['empty message', 'loading state'],
    criticalPatterns: ['length === 0']
  },
  'QuestoesPendentesTab.jsx': {
    expects: ['pending list', 'approve/reject'],
    shouldHave: ['empty state', 'loading', 'actions'],
    criticalPatterns: ['length === 0']
  },
  'QuestoesColaboradoresTab.jsx': {
    expects: ['questions list', 'collaborator filter'],
    shouldHave: ['empty state', 'loading'],
    criticalPatterns: ['length === 0']
  },
  'ColaboradoresPendentesTab.jsx': {
    expects: ['pending requests', 'approve/reject'],
    shouldHave: ['empty message', 'loading', 'modals'],
    criticalPatterns: ['length === 0', 'return null']
  },
  'ColaboradoresTab.jsx': {
    expects: ['colabs list', 'search', 'actions'],
    shouldHave: ['empty state', 'loading', 'filters'],
    criticalPatterns: ['length === 0']
  },
  'TableManager.jsx': {
    expects: ['generic table', 'CRUD operations'],
    shouldHave: ['empty state', 'loading', 'pagination'],
    criticalPatterns: ['length === 0']
  },
  'DisciplinasAdmin.jsx': {
    expects: ['disciplinas list', 'CRUD'],
    shouldHave: ['empty message', 'loading'],
    criticalPatterns: ['length === 0']
  },
  'BlocosColaboradoresTab.jsx': {
    expects: ['blocos list', 'review blocks'],
    shouldHave: ['empty state', 'loading', 'modals'],
    criticalPatterns: ['length === 0', 'return null']
  }
};

class ComprehensiveTabAnalyzer {
  constructor() {
    this.results = {
      working: [],
      issues: [],
      critical: []
    };
  }

  analyzeComponent(fileName, content) {
    const filePath = path.join(ADMIN_TABS_DIR, fileName);
    const analysis = {
      file: fileName,
      path: filePath,
      score: 100,
      problems: [],
      strengths: []
    };

    const config = TAB_COMPONENTS[fileName];
    if (!config) return null;

    // Análise 1: Verificar padrões críticos
    for (const pattern of config.criticalPatterns) {
      if (content.includes(pattern)) {
        analysis.strengths.push(`✓ Verificação de ${pattern}`);
      } else {
        analysis.problems.push(`✗ Falta verificação: ${pattern}`);
        analysis.score -= 15;
      }
    }

    // Análise 2: Verificar renderização condicional
    const hasTernary = /\?.*?:/.test(content);
    const hasShortCircuit = /&&\s*</.test(content);
    const hasIfElse = /if\s*\(.*?\)\s*{\s*return/.test(content);

    if (hasTernary || hasShortCircuit || hasIfElse) {
      analysis.strengths.push('✓ Renderização condicional implementada');
    } else {
      analysis.problems.push('✗ Sem renderização condicional');
      analysis.score -= 10;
    }

    // Análise 3: Verificar JSX no retorno
    const returnCount = (content.match(/return\s*\(/g) || []).length;
    if (returnCount < 1) {
      analysis.problems.push('⚠️  Sem retorno JSX (pode estar usando componentes reutilizáveis)');
      analysis.score -= 5;
    } else {
      analysis.strengths.push(`✓ ${returnCount} renderizações JSX encontradas`);
    }

    // Análise 4: Verificar loading state
    if (content.includes('loading') || content.includes('isLoading') || content.includes('isFetching')) {
      analysis.strengths.push('✓ Loading state detectado');
    } else {
      analysis.problems.push('⚠️  Sem loading state explícito');
      analysis.score -= 5;
    }

    // Análise 5: Verificar error handling
    if (content.includes('error') || content.includes('catch') || content.includes('try')) {
      analysis.strengths.push('✓ Error handling implementado');
    } else {
      analysis.problems.push('⚠️  Sem tratamento de erro');
      analysis.score -= 5;
    }

    // Análise 6: Verificar empty state mensagem
    if (content.includes('Nenhum') || content.includes('vazio') || content.includes('empty') || content.includes('sem dados')) {
      analysis.strengths.push('✓ Empty state message encontrada');
    } else {
      analysis.problems.push('⚠️  Sem mensagem de estado vazio');
      analysis.score -= 10;
    }

    // Análise 7: Verificar hard-coded return nada
    if (content.match(/return\s+null;/g)) {
      const matches = content.match(/return\s+null;/g).length;
      const context = this.getReturnNullContext(content, fileName);
      if (context.inModal || context.inConditional) {
        analysis.strengths.push(`✓ ${matches}x return null em contexto apropriado (modal/condicional)`);
      } else {
        analysis.problems.push(`✗ ${matches}x return null sem contexto claro`);
        analysis.score -= 20;
      }
    }

    // Análise 8: Verificar se renderiza algo mesmo sem dados
    const hasConditionalEmpty = /length\s*===\s*0\s*\?\s*</.test(content) ||
                                /length\s*===\s*0\s*\?.*?:/.test(content);
    if (hasConditionalEmpty) {
      analysis.strengths.push('✓ Renderiza mensagem quando lista vazia');
    } else if (content.includes('map(')) {
      analysis.problems.push('✗ .map() sem verificação de lista vazia');
      analysis.score -= 15;
    }

    return analysis;
  }

  getReturnNullContext(content, fileName) {
    const lines = content.split('\n');
    const returnNullLines = lines
      .map((line, idx) => ({ line, idx }))
      .filter(({ line }) => line.includes('return null;'));

    let inModal = false;
    let inConditional = false;

    for (const { idx } of returnNullLines) {
      // Verificar se está em função Modal ou condicional
      const before = lines.slice(Math.max(0, idx - 10), idx).join('\n');
      if (before.includes('Modal') || before.includes('const.*Modal')) {
        inModal = true;
      }
      if (before.match(/if\s*\(\s*!.*?\s*\)/)) {
        inConditional = true;
      }
    }

    return { inModal, inConditional };
  }

  runAnalysis() {
    console.log('\n📊 ANÁLISE PROFUNDA E COMPLETA DE ABAS\n');
    console.log('═'.repeat(90));
    console.log('\nAnalisando cada componente de aba para problemas de renderização...\n');

    for (const [fileName, config] of Object.entries(TAB_COMPONENTS)) {
      const filePath = path.join(ADMIN_TABS_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${fileName} - NÃO ENCONTRADO`);
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const analysis = this.analyzeComponent(fileName, content);

        if (!analysis) continue;

        // Classificar resultados
        if (analysis.score === 100) {
          this.results.working.push(analysis);
        } else if (analysis.score >= 70) {
          this.results.issues.push(analysis);
        } else {
          this.results.critical.push(analysis);
        }

        // Print resultado
        const scoreColor = analysis.score === 100 ? '✅' : analysis.score >= 70 ? '⚠️ ' : '🔴';
        console.log(`${scoreColor} ${fileName.padEnd(35)} [${analysis.score}%]`);

      } catch (error) {
        console.error(`❌ Erro ao analisar ${fileName}:`, error.message);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '═'.repeat(90));
    console.log('\n📈 RESUMO DA ANÁLISE\n');

    console.log(`✅ Componentes perfeitos: ${this.results.working.length}`);
    console.log(`⚠️  Componentes com problemas menores: ${this.results.issues.length}`);
    console.log(`🔴 Componentes críticos: ${this.results.critical.length}`);

    if (this.results.critical.length > 0) {
      console.log('\n🔴 PROBLEMAS CRÍTICOS (Score < 70):\n');
      for (const result of this.results.critical) {
        console.log(`\n📄 ${result.file} [${result.score}%]`);
        result.problems.forEach(p => console.log(`   ${p}`));
        console.log('\n   Pontos fortes:');
        result.strengths.forEach(s => console.log(`   ${s}`));
      }
    }

    if (this.results.issues.length > 0) {
      console.log('\n⚠️  PROBLEMAS MENORES (Score 70-99):\n');
      for (const result of this.results.issues) {
        console.log(`\n📄 ${result.file} [${result.score}%]`);
        result.problems.forEach(p => console.log(`   ${p}`));
      }
    }

    console.log('\n' + '═'.repeat(90));
    console.log('\n💡 RECOMENDAÇÕES GERAIS:\n');
    console.log('1. SEMPRE renderize algo enquanto carrega (skeleton, loading spinner)');
    console.log('2. SEMPRE mostre mensagem "Nenhum resultado" quando lista está vazia');
    console.log('3. SEMPRE trate erros de API e mostre feedback ao usuário');
    console.log('4. NUNCA deixe um componente renderizar completamente vazio/branco');
    console.log('5. Use ternários (? :) ou se/else para renderização condicional');
    console.log('6. return null SOMENTE é aceitável em Modais ou sub-componentes condicionais\n');
  }
}

// Executar análise
const analyzer = new ComprehensiveTabAnalyzer();
analyzer.runAnalysis();
