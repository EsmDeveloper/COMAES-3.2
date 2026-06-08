# 📋 Instruções para Adicionar Imagens do Time

## ✅ O Que Foi Feito

Modifiquei o arquivo `Sobre.jsx` para usar as seguintes imagens locais:

1. **Cornélio Mbongo** → `/cornelio.png`
2. **Esménio Manuel** → `/esm.png`
3. **José Mariche** → `/mariche.png`

## 📁 Onde Adicionar as Imagens

As imagens devem ser colocadas em:
```
FrontEnd/public/
├── cornelio.png
├── esm.png
└── mariche.png
```

## 🖼️ Requisitos das Imagens

- **Formato**: PNG ou JPG
- **Tamanho**: Mínimo 200x200px (recomendado 300x300px ou maior)
- **Forma**: Quadrado (será cortado em círculo no código)
- **Peso**: Menor que 500KB recomendado

## 🚀 Como Adicionar

### Opção 1: Copiar Arquivos Manualmente
```
1. Você tem os arquivos:
   - cornelio.png
   - esm.png
   - mariche.png

2. Copie para:
   FrontEnd/public/

3. Pronto! As imagens aparecerão automaticamente
```

### Opção 2: Usar URLs Online (Temporário)
Se não tem as imagens locais, pode usar URLs externas:
```javascript
// Editar o arquivo Sobre.jsx
const founders = [
  {
    name: 'Cornélio Mbongo',
    img: 'https://seu-url/cornelio.jpg', // URL da imagem
    ...
  },
  ...
];
```

## 📋 O Que Mudou no Código

### Antes
```javascript
img: 'https://nappy.co/photo/N_Ayxnji-zQ9w0r_QKQj5', // URL genérica
```

### Depois
```javascript
img: '/cornelio.png', // Arquivo local
```

## ✨ Recursos Adicionados

1. **Fallback automático**: Se a imagem não carregar, mostra um ícone 👤
2. **Otimização**: Imagens locais carregam mais rápido
3. **Responsivo**: As imagens se adaptam a diferentes tamanhos de tela

## 🎯 Próximos Passos

1. **Prepare as imagens** em PNG ou JPG
2. **Copie para** `FrontEnd/public/`
   - `cornelio.png`
   - `esm.png`
   - `mariche.png`
3. **Teste** acessando Admin → Sobre
4. **Valide** se as imagens aparecem corretamente

## 🔍 Verificar se Funcionou

Abra o navegador em:
```
http://localhost:5176/sobre
```

Procure pela seção "Os Fundadores do COMAES" e verifique se:
- ✅ Imagens carregam
- ✅ Aparecem em círculos
- ✅ Têm sombra colorida

## 🆘 Se as Imagens Não Carregarem

1. Verifique se os nomes estão corretos
2. Confirme que estão em `FrontEnd/public/`
3. Limpe cache do navegador: `Ctrl+Shift+Delete`
4. Hard reload: `Ctrl+F5`
5. Restart do Vite: `npm run dev`

## 📝 Arquivo Modificado

**Arquivo**: `FrontEnd/src/Paginas/Secundarias/Sobre.jsx`

**Mudanças**:
- ✅ Paths das imagens atualizados
- ✅ Adicionado fallback em caso de erro
- ✅ Mantém design responsivo
- ✅ Sem quebra de funcionalidades

---

## 📦 Estrutura Final Esperada

```
COMAES-3.2/
└── FrontEnd/
    ├── public/
    │   ├── cornelio.png        ← Adicionar aqui
    │   ├── esm.png             ← Adicionar aqui
    │   ├── mariche.png         ← Adicionar aqui
    │   └── vite.svg
    └── src/
        └── Paginas/Secundarias/
            └── Sobre.jsx       ← Já modificado ✅
```

---

**Tudo pronto! Basta adicionar as imagens na pasta public.** 🎉

