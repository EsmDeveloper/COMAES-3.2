# 🚀 Guia de Deployment - Sistema de Notificações

## ✅ Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Banco de dados MySQL/MariaDB
- Git

---

## 📋 Checklist Pré-Deployment

- [ ] Todos os testes passaram
- [ ] Build frontend sem erros
- [ ] Backend testado localmente
- [ ] Banco de dados sincronizado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] Certificados SSL (se necessário)

---

## 🔧 Passos de Deployment

### 1. Backend

#### 1.1 Instalar Dependências
```bash
cd BackEnd
npm install
```

#### 1.2 Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cp .env.example .env

# Editar .env com valores corretos
# DATABASE_URL=mysql://user:password@localhost:3306/comaes
# JWT_SECRET=seu_secret_aqui
# PORT=3000
```

#### 1.3 Sincronizar Banco de Dados
```bash
# Executar migrations (se houver)
npm run migrate

# Ou sincronizar models
npm run sync-db
```

#### 1.4 Iniciar Backend
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

**Verificar:**
- [ ] Backend rodando em http://localhost:3000
- [ ] Sem erros no console
- [ ] Banco de dados conectado

---

### 2. Frontend

#### 2.1 Instalar Dependências
```bash
cd FrontEnd
npm install
```

#### 2.2 Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env.local
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
EOF
```

#### 2.3 Build para Produção
```bash
npm run build
```

**Verificar:**
- [ ] Build completo sem erros
- [ ] Pasta `dist/` criada
- [ ] Tamanho do bundle aceitável

#### 2.4 Servir Frontend
```bash
# Desenvolvimento
npm run dev

# Produção (usar servidor web)
# Copiar conteúdo de dist/ para servidor web
```

---

## 🌐 Deployment em Servidor

### Opção 1: Servidor Linux com Nginx

#### 1. Copiar Arquivos
```bash
# Backend
scp -r BackEnd/* user@server:/app/backend/

# Frontend
scp -r FrontEnd/dist/* user@server:/var/www/comaes/
```

#### 2. Configurar Nginx
```nginx
server {
    listen 80;
    server_name comaes.com;

    # Frontend
    location / {
        root /var/www/comaes;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Iniciar Backend com PM2
```bash
npm install -g pm2

# Iniciar
pm2 start BackEnd/index.js --name "comaes-backend"

# Salvar configuração
pm2 save

# Iniciar no boot
pm2 startup
```

#### 4. Configurar SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d comaes.com
```

---

### Opção 2: Docker

#### 1. Criar Dockerfile Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY BackEnd/package*.json ./
RUN npm install --production

COPY BackEnd/ .

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Criar Dockerfile Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY FrontEnd/package*.json ./
RUN npm install

COPY FrontEnd/ .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./BackEnd
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/comaes
      - JWT_SECRET=seu_secret
    depends_on:
      - db

  frontend:
    build: ./FrontEnd
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=comaes
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

#### 4. Deploy com Docker
```bash
docker-compose up -d
```

---

### Opção 3: Heroku

#### 1. Instalar Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Criar App
```bash
heroku create comaes-app
```

#### 3. Configurar Variáveis
```bash
heroku config:set DATABASE_URL=mysql://...
heroku config:set JWT_SECRET=seu_secret
```

#### 4. Deploy
```bash
git push heroku main
```

---

## 🧪 Testes Pós-Deployment

### 1. Verificar Backend
```bash
curl http://localhost:3000/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-21T10:00:00Z"
}
```

### 2. Verificar Frontend
```bash
curl http://localhost/
```

**Resultado esperado:** HTML da página inicial

### 3. Testar Notificações
1. Fazer login como admin
2. Ir para `/administrador` → "Notificações"
3. Enviar notificação de teste
4. Fazer login como usuário
5. Verificar se notificação foi recebida

### 4. Verificar Endpoints
```bash
# Listar notificações
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/notificacoes/usuario/1

# Criar notificação
curl -X POST http://localhost:3000/notificacoes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "tipo": "geral",
    "titulo": "Teste",
    "mensagem": "Mensagem de teste"
  }'
```

---

## 🔍 Monitoramento

### Logs Backend
```bash
# Desenvolvimento
npm run dev

# Produção com PM2
pm2 logs comaes-backend

# Docker
docker logs container_id
```

### Logs Frontend
```bash
# Verificar console do navegador
# F12 → Console
```

### Banco de Dados
```bash
# Verificar notificações
mysql -u user -p comaes
SELECT COUNT(*) FROM notificacoes;
SELECT * FROM notificacoes ORDER BY criado_em DESC LIMIT 10;
```

---

## 🚨 Troubleshooting

### Problema: "Connection refused"
**Solução:**
- Verificar se backend está rodando
- Verificar porta 3000
- Verificar firewall

### Problema: "CORS error"
**Solução:**
- Verificar CORS no backend
- Verificar origem do frontend
- Verificar headers

### Problema: "Database connection error"
**Solução:**
- Verificar DATABASE_URL
- Verificar credenciais
- Verificar se banco está rodando

### Problema: "Notificações não aparecem"
**Solução:**
- Verificar se notificação foi criada no banco
- Verificar se usuário está autenticado
- Verificar polling (F12 → Network)
- Verificar console para erros

### Problema: "Build falha"
**Solução:**
- Limpar node_modules: `rm -rf node_modules && npm install`
- Limpar cache: `npm cache clean --force`
- Verificar versão do Node: `node -v`

---

## 📊 Performance

### Otimizações Implementadas
- ✅ Índices no banco de dados
- ✅ Polling otimizado (10-30s)
- ✅ Limite de notificações (100)
- ✅ Build minificado
- ✅ Gzip compression

### Monitorar Performance
```bash
# Backend
npm install -g clinic
clinic doctor -- npm start

# Frontend
# F12 → Performance → Record
```

---

## 🔐 Segurança

### Checklist de Segurança
- [ ] JWT_SECRET é forte
- [ ] DATABASE_URL não está em código
- [ ] CORS está restrito
- [ ] HTTPS está ativado
- [ ] Firewall está configurado
- [ ] Backups estão configurados
- [ ] Logs estão sendo monitorados

### Backup do Banco de Dados
```bash
# Backup
mysqldump -u user -p comaes > backup.sql

# Restaurar
mysql -u user -p comaes < backup.sql
```

---

## 📈 Escalabilidade

### Para Crescimento Futuro
1. **Adicionar Cache (Redis)**
   ```bash
   npm install redis
   ```

2. **Adicionar Load Balancer**
   - Nginx upstream
   - HAProxy

3. **Adicionar CDN**
   - Cloudflare
   - AWS CloudFront

4. **Adicionar Message Queue**
   - RabbitMQ
   - Redis Queue

---

## ✅ Checklist Final

- [ ] Backend rodando
- [ ] Frontend rodando
- [ ] Banco de dados sincronizado
- [ ] Testes passando
- [ ] Logs monitorados
- [ ] Backups configurados
- [ ] SSL ativado
- [ ] Firewall configurado
- [ ] Documentação atualizada
- [ ] Equipe treinada

---

## 📞 Suporte

Para problemas durante deployment:
1. Verificar logs
2. Consultar documentação
3. Verificar testes
4. Contatar desenvolvedor

---

## 📝 Notas Importantes

1. **Sempre fazer backup antes de deploy**
2. **Testar em staging antes de produção**
3. **Monitorar logs após deployment**
4. **Ter plano de rollback**
5. **Documentar mudanças**

---

**Data:** 21 de Maio de 2026  
**Versão:** 1.0.0  
**Status:** Pronto para Deployment
