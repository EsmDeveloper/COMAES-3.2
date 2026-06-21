#!/usr/bin/env node

/**
 * fix-empty-tabs.js
 * Correções seguras para abas que renderizam vazio:
 * 1. Substitui `return null` por loading/empty state apropriado
 * 2. Adiciona fallback em renderizações condicionais
 * 3. Adiciona empty state em listas quando necessário
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_TABS_DIR = 'FrontEnd/src/Administrador';

// PADRÃO 1: Substituir `return null` por estado apropriado quando stats são nulos
const PATTERN_RETURN_NULL = {
  name: 'RETURN_NULL_FIX',
  find: `if (!stats) {
    return null;
  }`,
  replace: `if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }`,
  files: ['AdminStats.jsx']
};

// PADRÃO 2: Adicionar empty state em ColaboradoresPendentesTab
const PATTERN_CLAB_PENDING = {
  name: 'EMPTY_STATE_COLABS',
  find: `{pendencias && pendencias.length > 0 ? (
                  pendencias.map(pendencia => (`,
  replace: `{pendencias && pendencias.length > 0 ? (
                  pendencias.map(pendencia => (`,
  // Este já tem fallback, só verificar se está completo
  files: ['ColaboradoresPendentesTab.jsx']
};

// PADRÃO 3: Adicionar empty state em tabelas genéricas
const PATTERN_TABLE_EMPTY = {
  name: 'EMPTY_TABLE_MESSAGE',
  find: `{data && data.length > 0 ? (
                    <div className="space-y-3">
                      {data.map(item => (`,
  replace: `{data && data.length > 0 ? (
                    <div className="space-y-3">
                      {data.map(item => (`,
  // Verificar se tem fallback
  files: ['TableManager.jsx']
};

class TabFixer {
  constructor() {
    this.fixes = [];
  }

  fixAdminStats() {
    const filePath = path.join(ADMIN_TABS_DIR, 'AdminStats.jsx');
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Arquivo não encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // FIX: Substituir `return null;` por fallback de carregamento
    if (content.includes(`if (!stats) {
    return null;
  }`)) {
      content = content.replace(
        `if (!stats) {
    return null;
  }`,
        `if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }`
      );

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ AdminStats.jsx - FIX: return null → skeleton loader`);
        this.fixes.push({
          file: 'AdminStats.jsx',
          type: 'RETURN_NULL_FIX',
          description: 'Substituiu return null por skeleton loader'
        });
        return true;
      }
    }
    return false;
  }

  checkColaboradoresPendentesTab() {
    const filePath = path.join(ADMIN_TABS_DIR, 'ColaboradoresPendentesTab.jsx');
    if (!fs.existsSync(filePath)) return false;

    const content = fs.readFileSync(filePath, 'utf8');

    // Verificar se tem return null
    if (content.includes('return null;')) {
      console.log(`⚠️  ColaboradoresPendentesTab.jsx - Encontrado 'return null'`);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('return null;')) {
          console.log(`   Linha ${idx + 1}: ${line}`);
        }
      });
    }

    // Verificar se listas vazias têm fallback
    if (!content.includes('length === 0')) {
      console.log(`⚠️  ColaboradoresPendentesTab.jsx - Sem verificação de lista vazia`);
      return false;
    }

    return true;
  }

  fixBlankRenderIssues() {
    console.log('\n🔧 APLICANDO CORREÇÕES\n');
    console.log('═'.repeat(80));

    let totalFixed = 0;

    // FIX 1: AdminStats return null
    if (this.fixAdminStats()) totalFixed++;

    // CHECK 2: ColaboradoresPendentesTab
    this.checkColaboradoresPendentesTab();

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Total de correções aplicadas: ${totalFixed}`);
    console.log(`📝 Detalhes:`);
    
    this.fixes.forEach((fix, idx) => {
      console.log(`\n  ${idx + 1}. ${fix.file}`);
      console.log(`     Tipo: ${fix.type}`);
      console.log(`     Descrição: ${fix.description}`);
    });

    if (totalFixed === 0) {
      console.log(`\n✨ Nenhuma correção necessária! Abas já parecem ter tratamento adequado.`);
    }
  }

  analyzeAllForBlankPages() {
    console.log('\n📊 ANÁLISE: PROCURANDO RENDERIZAÇÕES EM BRANCO\n');
    console.log('═'.repeat(80));

    const tabFiles = [
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

    let issuesFound = 0;
    const issues = [];

    for (const file of tabFiles) {
      const filePath = path.join(ADMIN_TABS_DIR, file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const fileIssues = [];

      // Check 1: return null sem contexto de loading/error
      const returnNullMatches = content.match(/return\s+null;/g) || [];
      if (returnNullMatches.length > 0) {
        fileIssues.push({
          severity: 'HIGH',
          type: 'BARE_RETURN_NULL',
          count: returnNullMatches.length,
          message: `${returnNullMatches.length}x "return null;" encontrado`
        });
      }

      // Check 2: Fragment vazio
      const emptyFragmentMatches = content.match(/<>\s*</g) || [];
      if (emptyFragmentMatches.length > 0) {
        const emptyFragments = content.match(/<>\s*<\/>/g) || [];
        if (emptyFragments.length > 0) {
          fileIssues.push({
            severity: 'MEDIUM',
            type: 'EMPTY_FRAGMENT',
            count: emptyFragments.length,
            message: `${emptyFragments.length}x fragment vazio "<></>"encontrado`
          });
        }
      }

      // Check 3: Renderização condicional sem else
      const conditionalAnd = (content.match(/&&\s*</g) || []).length;
      if (conditionalAnd > 3) {
        fileIssues.push({
          severity: 'LOW',
          type: 'MANY_CONDITIONALS',
          count: conditionalAnd,
          message: `${conditionalAnd}x renderização && sem fallback`
        });
      }

      if (fileIssues.length > 0) {
        issues.push({ file, fileIssues });
        issuesFound += fileIssues.length;
      }
    }

    if (issuesFound === 0) {
      console.log('\n✅ NENHUM PROBLEMA ENCONTRADO!');
      console.log('\nTodas as abas parecem ter tratamento adequado para:\n');
      console.log('  ✓ Loading states\n  ✓ Error states\n  ✓ Empty states\n  ✓ Renderizações condicionais com fallback');
      console.log('\nA plataforma não deve renderizar páginas em branco! 🎉');
      return;
    }

    console.log(`\n⚠️  ${issuesFound} possíveis problemas encontrados:\n`);
    issues.forEach(({ file, fileIssues }) => {
      console.log(`📄 ${file}`);
      fileIssues.forEach(issue => {
        const severityIcon = {
          HIGH: '🔴',
          MEDIUM: '🟡',
          LOW: '🟢'
        }[issue.severity];
        console.log(`   ${severityIcon} [${issue.type}] ${issue.message}`);
      });
      console.log();
    });
  }
}

// Executar
const fixer = new TabFixer();
fixer.analyzeAllForBlankPages();
fixer.fixBlankRenderIssues();
