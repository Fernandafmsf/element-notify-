const repos = process.env.REPOS ? process.env.REPOS.split(",") : [];

const token = process.env.GH_TOKEN;

// Matrix
const MATRIX_HOMESERVER = process.env.MATRIX_HOMESERVER;
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_ROOM_ID = process.env.MATRIX_ROOM_ID;

async function fetchPRs(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}/pulls?state=open`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    }
  });

  return res.json();
}

// 🔍 Buscar reviews (pra saber se teve feedback)
async function fetchReviews(repo, prNumber) {
  const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/reviews`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
}

// 🧠 Regras de status
function getStatus(pr, reviews) {
  const now = new Date();
  const createdAt = new Date(pr.created_at);
  const daysOpen = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  const hasChangesRequested = reviews.some(r => r.state === "CHANGES_REQUESTED");

  if (hasChangesRequested) {
    return `💬 Mudanças solicitadas`;
  }

  if (pr.requested_reviewers.length > 0) {
    return `👀 Aguardando review`;
  }

  if (daysOpen >= 3) {
    return `🔥 Parado há ${daysOpen} dias`;
  }

  return `⏳ Sem reviewers`;
}

// 🧱 Monta mensagem
async function buildMessage() {
  let text = `📢 Resumo diário de PRs\n\n`;
  let html = `<h3>📢 Resumo diário de PRs</h3>`;

  let hasPR = false;

  for (const repo of repos) {
    const prs = await fetchPRs(repo);

    if (!prs.length) continue;

    hasPR = true;

    text += `📦 ${repo}\n`;
    html += `<h4>📦 ${repo}</h4><ul>`;

    for (const pr of prs) {
      const reviews = await fetchReviews(repo, pr.number);
      const status = getStatus(pr, reviews);

      text += `- ${pr.title}\n  ${status}\n  🔗 ${pr.html_url}\n\n`;

      html += `
        <li>
          <strong>${pr.title}</strong><br/>
          ${status}<br/>
          <a href="${pr.html_url}">Ver PR</a>
        </li>
      `;
    }

    html += `</ul>`;
  }

  if (!hasPR) {
    text = "✅ Nenhum PR aberto";
    html = "<p>✅ Nenhum PR aberto</p>";
  }

  return { text, html };
}

// 🚀 Envio Matrix
async function sendToMatrix(text, html) {
  const txnId = `gh-${Date.now()}`; //Entender melhor 

  const url = `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${MATRIX_ROOM_ID}/send/m.room.message/${txnId}`;

  const payload = {
    msgtype: "m.text",
    format: "org.matrix.custom.html",
    body: text,
    formatted_body: html
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao enviar pro Matrix: ${res.status} - ${err}`);
  }

  console.log("✅ Mensagem enviada com sucesso!");
}

// 🧠 MAIN
async function main() {
  try {
    const { text, html } = await buildMessage();

    console.log("Mensagem gerada:\n", text);

    await sendToMatrix(text, html);
  } catch (err) {
    console.error("❌ Erro:", err);
    process.exit(1);
  }
}

main();