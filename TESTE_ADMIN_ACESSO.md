# 🧪 TESTE: Acesso Admin ao /api/admin/stats

## Passo 1: Verificar Configuração JWT

Acesse no navegador ou via curl:
```
http://192.168.0.150:3001/debug/jwt-config
```

**Esperado**: Deve mostrar `JWT_SECRET_LOADED: ✅ YES`

## Passo 2: Fazer Login como Admin

```bash
curl -X POST http://192.168.0.150:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin@comaes.com",
    "senha": "Senha123!"
  }'
```

**Esperado**: Deve retornar token com `"isAdmin": true`

## Passo 3: Decodificar o JWT

Pegue o token retornado e decodifique em https://jwt.io para verificar:
- `id`: deve estar presente
- `email`: admin@comaes.com
- `isAdmin`: deve ser `true` ✅ (NOVO!)
- `role`: deve ser 'admin'

## Passo 4: Testar Acesso a /api/admin/stats

```bash
curl -X GET http://192.168.0.150:3001/admin/stats \
  -H "Authorization: Bearer <TOKEN_DO_PASSO_2>"
```

**Esperado**: Deve retornar dados de estatísticas (200 OK)

## Passo 5: Verificar Logs do Backend

No console do servidor, você deve ver logs como:

```
📌 [isAdmin] Verificando token com JWT_SECRET: FROM .env
✅ [isAdmin] Token verificado com sucesso. decoded.isAdmin = true
✅ [isAdmin] Fast path - decoded.isAdmin = true, acesso concedido
```

---

## ⚠️ Se Ainda Receber 403

Verifique os logs do backend para:

1. **Token inválido?**
   ```
   ❌ [isAdmin] Token inválido: ...
   ```
   → Possível causa: JWT_SECRET diferente entre login e middleware

2. **decoded.isAdmin = false ou undefined?**
   ```
   ⏳ [isAdmin] Slow path - verificando banco de dados...
   ```
   → O JWT não foi criado com isAdmin. Verifique se o servidor foi reiniciado após a mudança de código.

3. **Usuário não é admin no BD?**
   ```
   ❌ [isAdmin] Usuário NÃO encontrado no BD
   📋 [isAdmin] Usuário encontrado no BD: ..., isAdmin=false, role=estudante
   ```
   → O usuário no banco não está marcado como admin

4. **Erro de conexão com BD?**
   ```
   ❌ [isAdmin] Erro ao verificar role no banco: ...
   ```
   → Problema na conexão com banco de dados

---

## ✅ SOLUÇÃO APLICADA

1. **JWT agora inclui `isAdmin`** para fast-path verification
2. **Logging detalhado** adicionado para diagnóstico
3. **Endpoint /debug/jwt-config** criado para verificar configuração

Faça um **novo login** para obter um JWT com o novo campo `isAdmin`.
