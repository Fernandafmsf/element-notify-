# 📣 Element Notifications via GitHub Actions

## 🗓️ Relatório diário (pr-check)

Esse projeto faz uma verificação diária chamada `pr-check` que executa o script `scripts/check-prs.js` e envia um resumo diário de PRs abertos para o room do Matrix/Element configurado.

- Script: [scripts/check-prs.js](scripts/check-prs.js)
- O que faz: busca PRs abertos em uma lista de repositórios, avalia o status (ex.: `👀 Aguardando review`, `💬 Mudanças solicitadas`, `🔥 Parado há X dias`, `⏳ Sem reviewers`) e envia um relatório em texto e HTML para o room Matrix.

Variáveis de ambiente utilizadas pelo script:

- `REPOS`: lista separada por vírgula de repositórios no formato `owner/repo,owner2/repo2`.
- `GH_TOKEN`: token GitHub com scope mínimo para ler PRs (`repo` se privados).
- `MATRIX_HOMESERVER`: URL do homeserver Matrix (ex: `https://matrix.org`).
- `MATRIX_ACCESS_TOKEN`: token de acesso para enviar mensagens ao room.
- `MATRIX_ROOM_ID`: ID do room.


O relatório diário inclui:

- Nome do repositório
- Título do PR
- Status calculado (reviews, quanto tempo aberto, se há reviewers solicitados)
- Link direto para o PR

Se não houver PRs abertos, o script envia `✅ Nenhum PR aberto`.

---
