# 📚 Exemplo de Integração - API de Tentativas

**Data:** 22 de Maio de 2026  
**Objetivo:** Demonstrar como integrar a API de tentativas com o frontend

---

## 🎯 Cenário de Uso

Um participante está respondendo a questões de um torneio. Cada vez que ele seleciona uma resposta, o frontend deve:

1. Enviar a resposta para o backend
2. Receber feedback (correto/errado)
3. Exibir pontos obtidos
4. Atualizar resumo

---

## 📝 Exemplo 1: Salvar Resposta Correta

### Frontend (JavaScript/React)

```javascript
// Função para salvar resposta
async function salvarResposta(torneioId, disciplina, questaoId, resposta, tempoGasto) {
  try {
    const token = localStorage.getItem('token'); // Obter token do localStorage
    
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/tentativas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          torneio_id: torneioId,
          disciplina_competida: disciplina,
          questao_id: questaoId,
          resposta_selecionada: resposta,
          tempo_gasto: tempoGasto,
        }),
      }
    );

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.erro || 'Erro ao salvar resposta');
    }

    const resultado = await response.json();
    
    // Processar resultado
    return {
      sucesso: true,
      correta: resultado.tentativa.correta,
      pontosObtidos: resultado.tentativa.pontos_obtidos,
      respostaCorreta: resultado.tentativa.resposta_correta,
      resumo: resultado.resumo,
    };
  } catch (erro) {
    console.error('Erro:', erro);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

// Usar a função
const resultado = await salvarResposta(1, 'Matemática', 5, 'b', 45);

if (resultado.sucesso) {
  if (resultado.correta) {
    console.log(`✅ Correto! Ganhou ${resultado.pontosObtidos} pontos`);
  } else {
    console.log(`❌ Errado! A resposta correta é: ${resultado.respostaCorreta}`);
  }
  
  console.log(`Resumo: ${resultado.resumo.total_acertos}/${resultado.resumo.total_questoes} acertos`);
} else {
  console.error(`Erro: ${resultado.erro}`);
}
```

### Backend (Resposta)

```json
{
  "sucesso": true,
  "tentativa": {
    "id": 42,
    "questao_id": 5,
    "correta": true,
    "pontos_obtidos": 1,
    "resposta_correta": "b",
    "resposta_selecionada": "b"
  },
  "resumo": {
    "total_acertos": 8,
    "total_pontos": 12,
    "total_questoes": 15
  }
}
```

---

## 📝 Exemplo 2: Salvar Resposta Errada

### Frontend (JavaScript/React)

```javascript
// Mesmo código anterior, mas com resposta errada
const resultado = await salvarResposta(1, 'Matemática', 6, 'a', 60);

// Resultado:
// {
//   sucesso: true,
//   correta: false,
//   pontosObtidos: 0,
//   respostaCorreta: 'c',
//   resumo: { total_acertos: 8, total_pontos: 12, total_questoes: 16 }
// }
```

### Backend (Resposta)

```json
{
  "sucesso": true,
  "tentativa": {
    "id": 43,
    "questao_id": 6,
    "correta": false,
    "pontos_obtidos": 0,
    "resposta_correta": "c",
    "resposta_selecionada": "a"
  },
  "resumo": {
    "total_acertos": 8,
    "total_pontos": 12,
    "total_questoes": 16
  }
}
```

---

## 📝 Exemplo 3: Componente React Completo

```javascript
import React, { useState, useCallback } from 'react';

function QuestionComponent({ torneioId, disciplina, questao }) {
  const [resposta, setResposta] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [tempoInicio] = useState(Date.now());

  const salvarResposta = useCallback(async (respostaSelecionada) => {
    setCarregando(true);
    
    try {
      const token = localStorage.getItem('token');
      const tempoGasto = Math.floor((Date.now() - tempoInicio) / 1000);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tentativas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            torneio_id: torneioId,
            disciplina_competida: disciplina,
            questao_id: questao.id,
            resposta_selecionada: respostaSelecionada,
            tempo_gasto: tempoGasto,
          }),
        }
      );

      if (!response.ok) {
        const erro = await response.json();
        setFeedback({
          tipo: 'erro',
          mensagem: erro.erro || 'Erro ao salvar resposta',
        });
        return;
      }

      const resultado = await response.json();
      
      setResposta(respostaSelecionada);
      setFeedback({
        tipo: resultado.tentativa.correta ? 'sucesso' : 'erro',
        correta: resultado.tentativa.correta,
        pontosObtidos: resultado.tentativa.pontos_obtidos,
        respostaCorreta: resultado.tentativa.resposta_correta,
        resumo: resultado.resumo,
      });
    } catch (erro) {
      setFeedback({
        tipo: 'erro',
        mensagem: erro.message,
      });
    } finally {
      setCarregando(false);
    }
  }, [torneioId, disciplina, questao.id, tempoInicio]);

  return (
    <div className="question-container">
      <h2>{questao.texto_pergunta}</h2>
      
      <div className="opcoes">
        {['a', 'b', 'c', 'd'].map((letra) => (
          <button
            key={letra}
            onClick={() => salvarResposta(letra)}
            disabled={carregando || resposta !== null}
            className={resposta === letra ? 'selecionada' : ''}
          >
            {letra.toUpperCase()}) {questao[`opcao_${letra}`]}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`feedback ${feedback.tipo}`}>
          {feedback.tipo === 'sucesso' ? (
            <>
              <p>✅ Correto!</p>
              <p>Ganhou {feedback.pontosObtidos} pontos</p>
            </>
          ) : (
            <>
              <p>❌ Errado!</p>
              <p>A resposta correta é: {feedback.respostaCorreta}</p>
            </>
          )}
          
          <div className="resumo">
            <p>
              Acertos: {feedback.resumo.total_acertos}/{feedback.resumo.total_questoes}
            </p>
            <p>
              Pontos: {feedback.resumo.total_pontos}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionComponent;
```

---

## 📝 Exemplo 4: Obter Histórico

### Frontend (JavaScript)

```javascript
async function obterHistorico(torneioId, disciplina) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/tentativas/${torneioId}/${disciplina}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao obter histórico');
    }

    const resultado = await response.json();
    
    return {
      tentativas: resultado.tentativas,
      resumo: resultado.resumo,
    };
  } catch (erro) {
    console.error('Erro:', erro);
    return null;
  }
}

// Usar a função
const historico = await obterHistorico(1, 'Matemática');

if (historico) {
  console.log(`Total de questões: ${historico.resumo.total_questoes}`);
  console.log(`Total de acertos: ${historico.resumo.total_acertos}`);
  console.log(`Total de pontos: ${historico.resumo.total_pontos}`);
  
  historico.tentativas.forEach((tentativa) => {
    console.log(`
      Questão ${tentativa.questao_id}:
      - Resposta: ${tentativa.resposta_selecionada}
      - Correta: ${tentativa.correta ? 'Sim' : 'Não'}
      - Pontos: ${tentativa.pontos_obtidos}
      - Tempo: ${tentativa.tempo_gasto}s
    `);
  });
}
```

### Backend (Resposta)

```json
{
  "sucesso": true,
  "tentativas": [
    {
      "id": 42,
      "questao_id": 5,
      "resposta_selecionada": "b",
      "resposta_correta": "b",
      "correta": true,
      "pontos_obtidos": 1,
      "tempo_gasto": 45,
      "criado_em": "2026-05-22T14:30:00.000Z"
    },
    {
      "id": 41,
      "questao_id": 4,
      "resposta_selecionada": "a",
      "resposta_correta": "c",
      "correta": false,
      "pontos_obtidos": 0,
      "tempo_gasto": 60,
      "criado_em": "2026-05-22T14:25:00.000Z"
    }
  ],
  "resumo": {
    "total_acertos": 8,
    "total_pontos": 12,
    "total_questoes": 15
  }
}
```

---

## 📝 Exemplo 5: Obter Estatísticas

### Frontend (JavaScript)

```javascript
async function obterEstatisticas(torneioId) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/tentativas/stats/${torneioId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao obter estatísticas');
    }

    const resultado = await response.json();
    
    return resultado.estatisticas;
  } catch (erro) {
    console.error('Erro:', erro);
    return null;
  }
}

// Usar a função
const stats = await obterEstatisticas(1);

if (stats) {
  Object.entries(stats).forEach(([disciplina, dados]) => {
    console.log(`
      ${disciplina}:
      - Total de questões: ${dados.total_questoes}
      - Total de acertos: ${dados.total_acertos}
      - Taxa de acerto: ${dados.taxa_acerto}
      - Total de pontos: ${dados.total_pontos}
      - Tempo total: ${dados.tempo_total_segundos}s
    `);
  });
}
```

### Backend (Resposta)

```json
{
  "sucesso": true,
  "torneio_id": 1,
  "usuario_id": 5,
  "estatisticas": {
    "Matemática": {
      "total_questoes": 10,
      "total_acertos": 8,
      "taxa_acerto": "80.00%",
      "total_pontos": 8,
      "tempo_total_segundos": 450
    },
    "Inglês": {
      "total_questoes": 5,
      "total_acertos": 3,
      "taxa_acerto": "60.00%",
      "total_pontos": 3,
      "tempo_total_segundos": 200
    },
    "Programação": {
      "total_questoes": 0,
      "total_acertos": 0,
      "taxa_acerto": "0.00%",
      "total_pontos": 0,
      "tempo_total_segundos": 0
    }
  }
}
```

---

## 🔄 Fluxo Completo de Integração

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuário acessa página de teste                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend carrega questões via /perguntas/:area       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Usuário seleciona uma resposta                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Frontend envia POST /api/tentativas                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Backend valida e salva tentativa                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Backend retorna feedback (correto/errado)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Frontend exibe feedback e pontos                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Frontend atualiza resumo (acertos/pontos)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 9. Usuário continua respondendo questões                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 10. Ao final, frontend obtém histórico/estatísticas     │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Teste com cURL

### Teste 1: Salvar Resposta

```bash
TOKEN="seu_token_jwt_aqui"

curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id": 1,
    "disciplina_competida": "Matemática",
    "questao_id": 1,
    "resposta_selecionada": "b",
    "tempo_gasto": 45
  }'
```

### Teste 2: Obter Histórico

```bash
TOKEN="seu_token_jwt_aqui"

curl -X GET http://localhost:3000/api/tentativas/1/Matemática \
  -H "Authorization: Bearer $TOKEN"
```

### Teste 3: Obter Estatísticas

```bash
TOKEN="seu_token_jwt_aqui"

curl -X GET http://localhost:3000/api/tentativas/stats/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notas Importantes

1. **Token JWT:** Sempre incluir o header `Authorization: Bearer token`
2. **Disciplina:** Usar exatamente "Matemática", "Inglês" ou "Programação"
3. **Resposta:** Usar letras minúsculas ('a', 'b', 'c', 'd')
4. **Tempo:** Tempo em segundos (opcional)
5. **Resumo:** Atualizado automaticamente após cada tentativa

---

## 🚀 Próximos Passos

1. Integrar com componente de teste existente
2. Exibir feedback visual (cores, ícones)
3. Atualizar ranking em tempo real
4. Adicionar animações
5. Adicionar som de feedback

---

**Exemplo de Integração concluído em 22 de Maio de 2026**

Desenvolvido com ❤️ para o COMAES
