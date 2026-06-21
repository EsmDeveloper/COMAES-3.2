@echo off
REM Script para ativar Atividades Recentes com dados REAIS
REM Este script reinicia o backend e testa a implementacao

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                                                                    ║
echo ║  ATIVANDO: Atividades Recentes - Dados REAIS                     ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo [1/4] Parando backend atual (se estiver rodando)...
echo       Procure pela janela do backend e pressione Ctrl+C
pause

echo.
echo [2/4] Navegando para pasta BackEnd...
cd BackEnd
if errorlevel 1 (
    echo ERRO: Nao conseguiu aceder a BackEnd
    pause
    exit /b 1
)

echo [3/4] Iniciando backend com novo codigo...
npm start

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                                                                    ║
echo ║  Backend reiniciado!                                             ║
echo ║                                                                    ║
echo ║  Proximos passos:                                                ║
echo ║  1. Abra o Painel Admin em http://localhost:5175                ║
echo ║  2. Vá para Visão Geral                                         ║
echo ║  3. Procure por "Atividades Recentes"                          ║
echo ║  4. Deve mostrar dados REAIS (não mais fictícios)              ║
echo ║                                                                    ║
echo ║  Para testar via script:                                        ║
echo ║  $ node test-atividades-reais.js                               ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
