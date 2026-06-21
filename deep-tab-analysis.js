#!/usr/bin/env node

/**
 * deep-tab-analysis.js
 * Análise profunda de todas as abas para encontrar:
 * 1. Abas que renderizam vazio sem conteúdo
 * 2. Falta de tratamento de loading/error states
 * 3. APIs não carregando dados
 * 4. Componentes sem fallback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_TABS_DIR = 'FrontEnd/src/Administrador';
const TAB_FILES = [
  'AdminStats.jsx',
  'TorneiosTab.jsx',
  'CertificadosTab.jsx',
  'NotificationsTab.jsx',
  'QuestoesTorneiosTab.jsx',
  'QuestoesTestesTab.jsx',
  'QuestoesPendentesTab.jsx',
  'QuestoesColaboradoresTab.jsx',
  'ColaboradoresPendentesTab.jsx',
  'ColaboradoresTab.jsx',
  'TableManager.jsx',
  'DisciplinasAdmin.jsx',
  'BlocosColaboradoresTab.jsx'
];

const ANALYSIS_PATTERNS = {
  MISSING_LOADING_STATE: {
    patterns: [
      /return\s*\(\s*<\w+.*?\/>/,  // Renderiza sem verificar loading
    ],
    description: 'Componente renderiza sem verificar loading state'
  },
  MISSING_ERROR_STATE: {
    patterns: [
      /useEffect.*?fetch|axios\.\w+/s,  // UseEffect com chamada de API mas sem .catch
    ],
    description: 'Chamada de API sem tratamento de erro'
  },
  EMPTY_RENDER: {
    patterns: [
      /if\s*\(!.*?\)\s*return\s*null/,  // Retorna null sem mensagem
      /if\s*\(.*?\.length\s*===\s*0\)\s*return\s*null/,  // Array vazio retorna null
    ],
    description: 'Renderiza null para lista vazia sem mensagem de feedback'
  },
  CONDITIONAL_WITHOUT_FALLBACK: {
    patterns: [
      /\?\s*<\w+/,  // Ternário sem else
      /&&\s*<\w+/,  // AND render sem fallback
    ],
    description: 'Renderização condicional sem fallback/else'
  },
  EMPTY_RETURN_JSX: {
    patterns: [
      /return\s*\(\s*<>\s*<\/>\s*\)/,  // Return com apenas fragment vazio
      /return\s*\(\s*<>\s*{.*?loading.*?}\s*<\/>\s*\)/s,  // Fragment com apenas loading
    ],
    description: 'Renderiza apenas fragment vazio quando deveria mostrar conteúdo'
  }
};

class TabAnalyzer {
  constructor() {
    this.issues = [];
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      const fileIssues = {
        file: fileName,
        path: filePath,
        issues: [],
        stats: {
          hasUseEffect: /useEffect/.test(content),
          hasApiCalls: /fetch|axios\.\w+/.test(content),
          hasLoadingState: /loading|isLoading|isFetching/.test(content),
          hasErrorState: /error|catch|try/.test(content),
          hasEmptyCheck: /length\s*===\s*0|\.length\s*\?|empty|isEmpty/.test(content),
          hasConditionalRender: /\?.*?:|&&\s*</.test(content),
          lines: content.split('\n').length
        }
      };

      // Análise 1: UseEffect sem tratamento de erro
      if (fileIssues.stats.hasApiCalls && !fileIssues.stats.hasErrorState) {
        fileIssues.issues.push({
          severity: 'HIGH',
          type: 'MISSING_ERROR_STATE',
          message: 'Componente tem chamadas de API mas sem tratamento de erro (.catch ou try/catch)',
          impact: 'Erros de API renderizam página branca'
        });
      }

      // Análise 2: UseEffect sem loading state
      if (fileIssues.stats.hasApiCalls && !fileIssues.stats.hasLoadingState) {
        fileIssues.issues.push({
          severity: 'MEDIUM',
          type: 'MISSING_LOADING_STATE',
          message: 'Componente tem chamadas de API mas sem loading state',
          impact: 'Dados não aparecem enquanto carregam, usuário vê branco'
        });
      }

      // Análise 3: Lista sem empty state
      if (fileIssues.stats.hasEmptyCheck && /map\s*\(/.test(content)) {
        const hasEmptyMessage = /map.*?:.*?("Nenhum|"Sem|"Vazio|"empty|"No data)/i.test(content);
        if (!hasEmptyMessage) {
          fileIssues.issues.push({
            severity: 'MEDIUM',
            type: 'NO_EMPTY_MESSAGE',
            message: 'Componente renderiza lista mas sem mensagem quando vazio',
            impact: 'Usuário não sabe se dados faltam ou estão carregando'
          });
        }
      }

      // Análise 4: Renderização condicional sem fallback
      const conditionalRenders = content.match(/\?\s*<|&&\s*</g) || [];
      const ternaryWithElse = content.match(/\?.*?:/g) || [];
      
      if (conditionalRenders.length > 0) {
        const withoutFallback = conditionalRenders.length - ternaryWithElse.length;
        if (withoutFallback > 0) {
          fileIssues.issues.push({
            severity: 'LOW',
            type: 'CONDITIONAL_WITHOUT_FALLBACK',
            message: `${withoutFallback} renderizações condicionais (&&) sem fallback`,
            impact: 'Conteúdo desaparece se condição falsa'
          });
        }
      }

      // Análise 5: Return null/vazio
      if (/(return\s*null|return\s*\(\s*<>\s*<\/>\s*\))/g.test(content)) {
        fileIssues.issues.push({
          severity: 'MEDIUM',
          type: 'EMPTY_RETURN',
          message: 'Componente retorna null ou fragment vazio em algumas condições',
          impact: 'Usuário vê página em branco'
        });
      }

      if (fileIssues.issues.length > 0) {
        this.issues.push(fileIssues);
      }

      return fileIssues;
    } catch (error) {
      console.error(`❌ Erro ao analisar ${filePath}:`, error.message);
      return null;
    }
  }

  analyzeAll() {
    console.log('\n🔍 ANÁLISE PROFUNDA DE ABAS - RENDERIZAÇÃO E DADOS\n');
    console.log('═'.repeat(90));

    let totalIssues = 0;
    const issuesBySeverity = { HIGH: 0, MEDIUM: 0, LOW: 0 };

    for (const file of TAB_FILES) {
      const filePath = path.join(ADMIN_TABS_DIR, file);
      if (fs.existsSync(filePath)) {
        const analysis = this.analyzeFile(filePath);
        if (analysis && analysis.issues.length > 0) {
          totalIssues += analysis.issues.length;
          analysis.issues.forEach(issue => {
            issuesBySeverity[issue.severity]++;
          });
        }
      }
    }

    console.log('\n📊 RESUMO GERAL\n');
    console.log(`Total de arquivos analisados: ${TAB_FILES.length}`);
    console.log(`Arquivos com problemas: ${this.issues.length}`);
    console.log(`Total de problemas encontrados: ${totalIssues}`);
    console.log(`  🔴 Críticos (HIGH): ${issuesBySeverity.HIGH}`);
    console.log(`  🟡 Médios (MEDIUM): ${issuesBySeverity.MEDIUM}`);
    console.log(`  🟢 Baixos (LOW): ${issuesBySeverity.LOW}`);

    if (this.issues.length === 0) {
      console.log('\n✅ Todas as abas parecem ter tratamento básico de dados!');
      return;
    }

    console.log('\n\n📋 DETALHES DOS PROBLEMAS\n');
    console.log('═'.repeat(90));

    this.issues.forEach((fileIssue, idx) => {
      console.log(`\n${idx + 1}. 📄 ${fileIssue.file}`);
      console.log(`   Localização: ${fileIssue.path}`);
      console.log(`   Linhas: ${fileIssue.stats.lines}`);
      console.log(`   Stats:`);
      console.log(`     - UseEffect: ${fileIssue.stats.hasUseEffect ? '✅' : '❌'}`);
      console.log(`     - Chamadas de API: ${fileIssue.stats.hasApiCalls ? '✅' : '❌'}`);
      console.log(`     - Loading State: ${fileIssue.stats.hasLoadingState ? '✅' : '❌'}`);
      console.log(`     - Error State: ${fileIssue.stats.hasErrorState ? '✅' : '❌'}`);
      console.log(`     - Empty Check: ${fileIssue.stats.hasEmptyCheck ? '✅' : '❌'}`);

      console.log(`\n   🚨 Problemas identificados:`);
      fileIssue.issues.forEach((issue, i) => {
        const severityIcon = {
          HIGH: '🔴',
          MEDIUM: '🟡',
          LOW: '🟢'
        }[issue.severity];
        
        console.log(`\n     ${i + 1}) ${severityIcon} [${issue.severity}] ${issue.type}`);
        console.log(`        Descrição: ${issue.message}`);
        console.log(`        Impacto: ${issue.impact}`);
      });
    });

    console.log('\n' + '═'.repeat(90));
    console.log('\n💡 RECOMENDAÇÕES\n');
    console.log('1. Adicione loading states em todos os componentes com useEffect + API calls');
    console.log('2. Implemente tratamento de erro com try/catch ou .catch()');
    console.log('3. Mostre mensagens "Nenhum resultado encontrado" quando listas vazias');
    console.log('4. Use fallback em renderizações condicionais (ternário ? :)');
    console.log('5. Nunca retorne null ou fragment vazio sem avisar o usuário\n');
  }
}

// Executar análise
const analyzer = new TabAnalyzer();
analyzer.analyzeAll();
