# 📣 Element Notifications via GitHub Actions

Notificações automáticas para o **Element (Matrix)** a cada evento relevante nos seus repositórios GitHub.

## 📁 Estrutura dos arquivos

```
element-notifications/
├── .github/workflows/
│   └── notify-element.yml     ← Workflow REUTILIZÁVEL (repo central, ex: devops)
├── repos/
│   └── element-notify.yml     ← Copie para cada um dos 3 repos
└── setup-matrix-secrets.sh    ← Script para obter token e room ID
```

---

## 🚀 Setup em 4 passos

### 1. Obter os secrets do Matrix

Execute o script de setup (precisa de `curl` e `jq`):

```bash
chmod +x setup-matrix-secrets.sh
./setup-matrix-secrets.sh
```

O script vai:
- Fazer login na sua conta Matrix/Element
- Listar os rooms disponíveis
- Enviar uma mensagem de teste
- Exibir os 3 valores que você precisa adicionar ao GitHub

### 2. Adicionar os secrets no GitHub

Recomendado: use **Organization Secrets** para compartilhar entre os 3 repos sem repetição.

**Settings → Secrets and variables → Actions → New organization secret**

| Secret | Valor |
|--------|-------|
| `MATRIX_HOMESERVER` | `https://matrix.org` (ou seu servidor) |
| `MATRIX_ACCESS_TOKEN` | Token obtido pelo script |
| `MATRIX_ROOM_ID` | `!abc123:matrix.org` |

Se preferir por repo: **Settings → Secrets and variables → Actions** em cada repo.

### 3. Criar o repo central (recomendado)

Coloque `notify-element.yml` em um repo dedicado, ex: `sua-org/devops`:

```
sua-org/devops/
└── .github/workflows/
    └── notify-element.yml
```

> Se não quiser um repo central, você pode copiar o `notify-element.yml` para cada repo também — só vai ter que manter 3 cópias.

### 4. Copiar o caller para cada repo

Cole o arquivo `repos/element-notify.yml` em cada um dos 3 repos:

```
seu-repo/
└── .github/workflows/
    └── element-notify.yml    ← substitua "sua-org/devops" pelo caminho correto
```

Edite a linha `uses:` em cada job para apontar para o seu repo central:

```yaml
uses: sua-org/devops/.github/workflows/notify-element.yml@main
```

---

## 🔔 Eventos cobertos

| Evento | Emoji | Descrição |
|--------|-------|-----------|
| PR aberto | 🟢 | Novo pull request criado |
| Review solicitado | 👀 | Alguém foi adicionado como revisor |
| PR aprovado | ✅ | Review com aprovação |
| Mudanças solicitadas | 🔁 | Review pediu alterações |
| PR mergeado | 🚀 | PR fechado com merge |
| PR fechado sem merge | 🚫 | PR descartado |
| Comentário no PR | 💬 | Novo comentário em PR |
| Push na main | 📦 | Commit direto na branch principal |

---

## 🤖 Criar uma conta bot (recomendado)

Em vez de usar sua conta pessoal, crie uma conta dedicada no Element:

1. Crie a conta `github-bot` no seu servidor Matrix
2. Adicione o bot ao room de notificações
3. Use as credenciais do bot no `setup-matrix-secrets.sh`

---

## 🔧 Customizações

### Mudar branches monitoradas

No `element-notify.yml`, edite a seção `push`:

```yaml
push:
  branches: [main, master, develop]  # adicione as branches que quiser
```

### Silenciar um evento específico

Remova ou comente o job correspondente no `element-notify.yml`.

### Rooms diferentes por repo

Defina o secret `MATRIX_ROOM_ID` diretamente no repo (em vez de Organization Secret) com um valor diferente para cada um.

---

## 🐛 Troubleshooting

**Mensagem não aparece no Element:**
- Verifique se o bot está no room
- Confira se o `MATRIX_ROOM_ID` começa com `!` (ex: `!abc:matrix.org`)
- Rode o `setup-matrix-secrets.sh` novamente para testar a conexão

**Erro 401 no workflow:**
- O access token expirou — rode o script de setup novamente para gerar um novo

**Workflow não dispara:**
- Verifique se o arquivo está em `.github/workflows/` (e não em outra pasta)
- Confirme que o repo central é acessível pela organização