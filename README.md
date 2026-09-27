# DispatchAI — protótipo de demonstração

Protótipo visual e navegável de um SaaS B2B de despacho inteligente para equipes de campo.
Empresa demo: **ClimaTech — Serviços técnicos e manutenção** (todos os dados são fictícios).

> Chamado → IA entende o problema → identifica as habilidades → encontra o melhor técnico →
> explica a escolha → cria a OS → agenda → acompanha a execução.

## Como rodar

```bash
npm install
npm run dev          # http://localhost:5173
```

Versão de arquivo único (abre com duplo clique, sem servidor):

```bash
npm run build:standalone   # gera dist/index.html
```

## Roteiro da gravação (≈ 2 min)

1. **Dashboard** — números do dia, gráfico e chamados recentes.
2. **+ Novo chamado** — conversa de WhatsApp do João Silva.
3. **Analisar com IA** — ~2 s de processamento; os trechos usados pela IA ficam destacados na mensagem.
4. **Ver técnico recomendado** → **AI Dispatch**: mapa, Carlos Mendes 96/100, "Por que Carlos?",
   tabela de fatores e os demais técnicos (o mais próximo não é o escolhido).
5. **Atribuir chamado** — confirmação, toasts e abertura automática da **OS #10482**.
6. **Simular atendimento** — Agendado → A caminho → Em atendimento → Diagnóstico → Concluído.
7. **Ver resultado do atendimento** — tela final para o gestor.

Segunda demonstração: em *Novo chamado*, selecione **Fernanda Rocha** (vazamento → Hidráulica → Marcos Lima).
Os outros chamados da fila (elétrica e bomba d'água) também podem ser despachados.

### Demo Mode

- Rodapé da sidebar → **Demo Mode** → **Reset Demo** volta tudo ao estado inicial.
- Atalhos: `Shift + D` liga/desliga o Demo Mode; `Shift + R` reinicia (com o Demo Mode ligado).

## Arquitetura

```
src/
  types.ts               contratos de domínio (espelham a futura API)
  data/                  mocks: técnicos, clientes, chamados, agenda, equipamentos
  services/
    aiService.ts         analyzeRequest · findBestTechnician · generateDispatchReason
    routing.ts           distância/ETA (trocar por API de rotas)
    scheduling.ts        próxima janela livre na agenda
  store/
    DemoStore.tsx        estado global (reducer + localStorage); cada ação ≈ um endpoint
    useDispatchFlow.ts   orquestra análise + matching
  components/            layout, UI base, mapa estilizado, gráfico
  pages/                 telas
```

### IA

`aiService` é determinístico (regras + score ponderado), garantindo o mesmo resultado a cada gravação.
O score combina cinco fatores: habilidades (35%), experiência em casos semelhantes (20%),
proximidade (15%), disponibilidade (15%) e qualidade/1ª visita (15%).

Para conectar um LLM, implemente a interface `AIProvider` e registre com `setAIProvider()`;
as telas não mudam.

### Trocando os mocks por API

As telas leem apenas do `DemoStore`. Para usar backend real, substitua a carga inicial
(`buildInitialState`) por chamadas HTTP e transforme as ações do reducer (`assign`, `advance`…)
em requisições.
