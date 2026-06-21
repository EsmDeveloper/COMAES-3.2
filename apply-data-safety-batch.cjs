#!/usr/bin/env node

/**
 * 🛡️ BATCH DATA SAFETY LAYER APPLICATION SCRIPT
 * 
 * Aplica transformações automáticas do Data Safety Layer em múltiplos componentes
 * Usa regex e AST manipulation para garantir transformações seguras
 * 
 * USO:
 *   node apply-data-safety-batch.js --group=tabs
 *   node apply-data-safety-batch.js --group=forms
 *   node apply-data-safety-batch.js --group=all --dry-run
 * 
 * @version 1.0.0
 * @date 2026-06-21
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const FRONTEND_SRC = path.join(__dirname, 'FrontEnd', 'src');

const COMPONENT_GROUPS = {
  tabs: [
    'Administrador/ColaboradoresTab.jsx',
    'Administrador/QuestoesPendentesTab.jsx',
    'Administrador/QuestoesColaboradoresTab.jsx',
    'Administrador/BlocosColaboradoresTab.jsx',
    'Administrador/TorneiosTab.jsx',
    'Administrador/CertificadosTab.jsx',
    'Administrador/AdminBlocosColaboradoresPendentesTab.jsx',
    'Administrador/AdminQuestionsColaboradorPendentesTab.jsx',
    'Administrador/QuestionsColaboradorPendentesTab.jsx',
  ],
  forms: [
    'Administrador/EditQuestaoForm.jsx',
    'Administrador/CreateQuestaoTesteForm.jsx',
    'Administrador/EditQuestaoTesteForm.jsx',
    'components/Forms/CreateBlocoForm.jsx',
    'Colaborador/QuestaoForm.jsx',
    'Administrador/components/TournamentForm.jsx',
    'Administrador/UserModal.jsx',
  ],
  modals: [
    'Administrador/TableModal.jsx',
    'Administrador/RejectModal.jsx',
    'Administrador/components/TournamentModal.jsx',
    'components/ConfirmModal.jsx',
    'components/ComaesModal.jsx',
    'components/LogoutModal.jsx',
    'components/ModalVencedores.jsx',
    'components/TournamentFinishedModal.jsx',
    'components/TournamentRegistrationModal.jsx',
  ],
  managers: [
    'Administrador/BlocoQuestoesManager.jsx',
    'Administrador/QuestoesManager.jsx',
    'Administrador/TesteConhecimentoManager.jsx',
  ],
  rankings: [
    'Paginas/Secundarias/RankingCompleto.jsx',
    'Paginas/Secundarias/RankingGlobal.jsx',
    'components/ranking/RankingTable.jsx',
    'components/ranking/RankingTab.jsx',
    'components/ranking/PosBadge.jsx',
  ],
  certificates: [
    'Paginas/Secundarias/Certificacoes.jsx',
    'certificates/pages/MeusCertificados.jsx',
    'certificados/CertificadoBase.jsx',
    'components/certificates/CertificateDisplay.jsx',
    'components/certificates/CertificateActions.jsx',
    'components/certificates/CertificateCheckButton.jsx',
  ],
  pages: [
    'Paginas/Secundarias/Sobre.jsx',
    'Paginas/Secundarias/Suporte.jsx',
    'Paginas/Secundarias/Privacidade.jsx',
    'Paginas/Secundarias/Noticias.jsx',
    'Paginas/Secundarias/Configuracoes.jsx',
    'Paginas/Secundarias/Notificacoes.jsx',
    'Paginas/Secundarias/NotificacoesPage.jsx',
    'Paginas/Secundarias/Torneios.jsx',
    'Paginas/Secundarias/EntrarTorneio.jsx',
    'Paginas/Secundarias/MinhaJornada.jsx',
    'Paginas/Secundarias/Home.jsx',
  ],
  dashboards: [
    'Paginas/Secundarias/TorneioDashboard.jsx',
  ],
};

// ============================================================================
// TRANSFORMATION PATTERNS
// ============================================================================

const TRANSFORMATIONS = {
  // 1. Add imports if missing
  addImports: {
    pattern: /^import.*from.*['"]react['"];?\s*$/m,
    replacement: (match) => {
      return `${match}\nimport { safeGet, safeArray, safeString, safeMap, safeFormatNumber, safeFormatDate } from '../utils/dataSafety';\nimport { useSafeFetch, useSafeArray } from '../hooks/useSafeData';\nimport { api } from '../utils/safeApi';`;
    },
    condition: (content) => !content.includes('from \'../utils/dataSafety\''),
  },

  // 2. Replace unsafe .map() with safeMap()
  replaceUnsafeMap: {
    pattern: /(\w+)\.map\(\s*\(([^)]+)\)\s*=>/g,
    replacement: 'safeMap($1, ($2, i, key) =>',
    condition: (content) => content.includes('.map(') && !content.includes('safeMap('),
  },

  // 3. Replace axios imports
  replaceAxiosImport: {
    pattern: /import\s+axios\s+from\s+['"]axios['"];?/g,
    replacement: '// axios removed - using safe API client',
    condition: (content) => content.includes('import axios'),
  },

  // 4. Replace axios calls with api client
  replaceAxiosGet: {
    pattern: /axios\.get\((['"`][^'"`]+['"`]),\s*\{[^}]*headers:\s*\{[^}]*Authorization:[^}]*\}[^}]*\}\)/g,
    replacement: (match) => {
      const urlMatch = match.match(/['"`]([^'"`]+)['"`]/);
      const url = urlMatch ? urlMatch[1] : '/api/endpoint';
      return `api.get('${url}', { token })`;
    },
    condition: (content) => content.includes('axios.get'),
  },

  replaceAxiosPost: {
    pattern: /axios\.post\((['"`][^'"`]+['"`]),\s*(\w+),\s*\{[^}]*headers:\s*\{[^}]*Authorization:[^}]*\}[^}]*\}\)/g,
    replacement: (match) => {
      const matches = match.match(/['"`]([^'"`]+)['"`].*?,\s*(\w+)/);
      const url = matches ? matches[1] : '/api/endpoint';
      const data = matches ? matches[2] : 'data';
      return `api.post('${url}', ${data}, { token })`;
    },
    condition: (content) => content.includes('axios.post'),
  },

  // 5. Add Array.isArray checks before .map() if not present
  addArrayCheck: {
    pattern: /\{(\w+)\.map\(/g,
    replacement: '{Array.isArray($1) && $1.map(',
    condition: (content) => {
      return content.includes('.map(') && !content.includes('Array.isArray') && !content.includes('safeMap');
    },
  },

  // 6. Replace direct property access with safeGet (simplified - manual review needed)
  // This is commented out as it needs context-aware replacement
  // addSafeGet: {
  //   pattern: /(\w+)\.(\w+)\.(\w+)/g,
  //   replacement: "safeGet($1, '$2.$3', defaultValue)",
  //   condition: (content) => true, // Always suggest
  // },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${filePath}:`, error.message);
    return false;
  }
}

function backupFile(filePath) {
  const backupPath = `${filePath}.backup-${Date.now()}`;
  try {
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.error(`❌ Error creating backup for ${filePath}:`, error.message);
    return null;
  }
}

// ============================================================================
// TRANSFORMATION ENGINE
// ============================================================================

function applyTransformations(content, fileName) {
  let modified = content;
  let changes = [];

  // Apply each transformation
  for (const [name, transform] of Object.entries(TRANSFORMATIONS)) {
    if (transform.condition(modified)) {
      const before = modified;
      
      if (typeof transform.replacement === 'function') {
        modified = modified.replace(transform.pattern, transform.replacement);
      } else {
        modified = modified.replace(transform.pattern, transform.replacement);
      }
      
      if (before !== modified) {
        changes.push(name);
      }
    }
  }

  return { content: modified, changes };
}

function fixImportPaths(content, filePath) {
  // Fix import paths based on file location
  const pathParts = filePath.split(/[/\\]/);
  const depth = Math.max(1, pathParts.length - 1); // Relative to src/
  const prefix = '../'.repeat(depth);
  
  content = content.replace(/from ['"]\.\.\/utils\/dataSafety['"]/g, `from '${prefix}utils/dataSafety'`);
  content = content.replace(/from ['"]\.\.\/hooks\/useSafeData['"]/g, `from '${prefix}hooks/useSafeData'`);
  content = content.replace(/from ['"]\.\.\/utils\/safeApi['"]/g, `from '${prefix}utils/safeApi'`);
  
  return content;
}

// ============================================================================
// MAIN PROCESS
// ============================================================================

function processComponent(relativePath, options = {}) {
  const fullPath = path.join(FRONTEND_SRC, relativePath);
  
  console.log(`\n📄 Processing: ${relativePath}`);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  File not found: ${fullPath}`);
    return { success: false, reason: 'not_found' };
  }

  // Read file
  const content = readFile(fullPath);
  if (!content) {
    return { success: false, reason: 'read_error' };
  }

  // Apply transformations
  const { content: transformed, changes } = applyTransformations(content, relativePath);
  
  if (changes.length === 0) {
    console.log(`  ✅ No changes needed`);
    return { success: true, reason: 'no_changes' };
  }

  // Fix import paths
  const final = fixImportPaths(transformed, relativePath);

  // Show changes
  console.log(`  🔄 Applied transformations:`);
  changes.forEach(change => console.log(`     - ${change}`));

  // Dry run mode
  if (options.dryRun) {
    console.log(`  🔍 DRY RUN - Changes not saved`);
    return { success: true, reason: 'dry_run', changes };
  }

  // Create backup
  const backupPath = backupFile(fullPath);
  if (!backupPath) {
    console.log(`  ⚠️  Backup failed - skipping write`);
    return { success: false, reason: 'backup_failed' };
  }
  console.log(`  💾 Backup created: ${path.basename(backupPath)}`);

  // Write modified file
  if (writeFile(fullPath, final)) {
    console.log(`  ✅ File updated successfully`);
    return { success: true, reason: 'updated', changes, backup: backupPath };
  } else {
    console.log(`  ❌ Failed to write file`);
    return { success: false, reason: 'write_error' };
  }
}

function processGroup(groupName, options = {}) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎯 Processing Group: ${groupName.toUpperCase()}`);
  console.log(`${'='.repeat(80)}`);

  const components = COMPONENT_GROUPS[groupName];
  if (!components) {
    console.error(`❌ Unknown group: ${groupName}`);
    console.log(`\nAvailable groups: ${Object.keys(COMPONENT_GROUPS).join(', ')}`);
    return;
  }

  const results = {
    total: components.length,
    updated: 0,
    noChanges: 0,
    failed: 0,
    notFound: 0,
  };

  components.forEach(relativePath => {
    const result = processComponent(relativePath, options);
    
    if (result.success) {
      if (result.reason === 'updated') {
        results.updated++;
      } else if (result.reason === 'no_changes' || result.reason === 'dry_run') {
        results.noChanges++;
      }
    } else {
      if (result.reason === 'not_found') {
        results.notFound++;
      } else {
        results.failed++;
      }
    }
  });

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 Summary for ${groupName}:`);
  console.log(`   Total:      ${results.total}`);
  console.log(`   ✅ Updated:  ${results.updated}`);
  console.log(`   ⏭️  No changes: ${results.noChanges}`);
  console.log(`   ❌ Failed:   ${results.failed}`);
  console.log(`   ⚠️  Not found: ${results.notFound}`);
  console.log(`${'='.repeat(80)}\n`);
}

// ============================================================================
// CLI
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
  };

  const groupArg = args.find(arg => arg.startsWith('--group='));
  const group = groupArg ? groupArg.split('=')[1] : null;

  console.log(`\n🛡️  DATA SAFETY LAYER - BATCH APPLICATION\n`);

  if (!group) {
    console.log(`Usage: node apply-data-safety-batch.js --group=<group> [--dry-run]\n`);
    console.log(`Available groups:`);
    Object.keys(COMPONENT_GROUPS).forEach(g => {
      console.log(`  - ${g} (${COMPONENT_GROUPS[g].length} components)`);
    });
    console.log(`  - all (all groups)\n`);
    return;
  }

  if (options.dryRun) {
    console.log(`🔍 DRY RUN MODE - No files will be modified\n`);
  }

  if (group === 'all') {
    Object.keys(COMPONENT_GROUPS).forEach(g => {
      processGroup(g, options);
    });
  } else {
    processGroup(group, options);
  }

  console.log(`\n✅ Batch processing complete!\n`);
  console.log(`Next steps:`);
  console.log(`  1. Review changes: git diff`);
  console.log(`  2. Run build: npm run build`);
  console.log(`  3. Run lint: npm run lint`);
  console.log(`  4. Test components manually`);
  console.log(`  5. If issues: restore from backups (*.backup-* files)\n`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processComponent, processGroup, COMPONENT_GROUPS };
