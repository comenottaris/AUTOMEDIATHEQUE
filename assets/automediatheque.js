const DATA_URL = "automedias.json";

const state = {
  all: [],
  filtered: [],
  type: "",
  country: "",
};

function normaliseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") return [value.trim()];
  return [];
}

function normaliseItem(raw) {
  return {
    id: raw.id || raw.slug || raw.name || "",
    name: raw.name || raw.title || "Sans titre",
    url: raw.url || raw.link || "",
    type: raw.type || raw.category || "Autre",
    country: raw.country || raw.pays || "",
    status: (raw.status || raw.statut || "inconnu").toLowerCase(),
    languages: normaliseArray(raw.languages || raw.lang || raw.langs),
    tags: normaliseArray(raw.tags || raw.mots_cles || raw.keywords),
    description: raw.description || raw.resume || raw.notes || "",
  };
}

function updateStatus(text) {
  const el = document.getElementById("status-text");
  if (el) el.textContent = text;
}

function updateMeta() {
  const el = document.getElementById("meta-info");
  if (!el) return;
  const total = state.all.length;
  const current = state.filtered.length;
  if (!total) {
    el.textContent = "Aucune donnée chargée pour l'instant.";
  } else if (current === total) {
    el.textContent = `${total} automédias listés.`;
  } else {
    el.textContent = `${current} / ${total} automédias après filtrage.`;
  }
}

function renderFilters() {
  const types = new Set();
  const countries = new Set();

  state.all.forEach((item) => {
    if (item.type) types.add(item.type);
    if (item.country) countries.add(item.country);
  });

  const typeSelect = document.getElementById("filter-type");
  const countrySelect = document.getElementById("filter-country");

  if (typeSelect) {
    const current = typeSelect.value;
    typeSelect.innerHTML = '<option value="">Tous types</option>';
    Array.from(types)
      .sort((a, b) => a.localeCompare(b))
      .forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
      });
    typeSelect.value = current;
  }

  if (countrySelect) {
    const current = countrySelect.value;
    countrySelect.innerHTML = '<option value="">Tous pays</option>';
    Array.from(countries)
      .sort((a, b) => a.localeCompare(b))
      .forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        countrySelect.appendChild(opt);
      });
    countrySelect.value = current;
  }
}

function applyFilters() {
  const { type, country, all } = state;
  state.filtered = all.filter((item) => {
    if (type && item.type !== type) return false;
    if (country && item.country !== country) return false;
    return true;
  });
  renderCards();
  updateMeta();
}

function cardStatusClass(status) {
  if (status === "online" || status === "actif" || status === "ok") {
    return "am-chip--status-online";
  }
  if (status === "offline" || status === "mort" || status === "hs") {
    return "am-chip--status-offline";
  }
  return "";
}

function renderCards() {
  const container = document.getElementById("cards");
  const empty = document.getElementById("empty-state");
  if (!container) return;

  container.innerHTML = "";

  if (!state.filtered.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  state.filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "am-card";

    const header = document.createElement("div");
    header.className = "am-card-header";

    const title = document.createElement("h3");
    title.className = "am-card-title";
    title.textContent = item.name;

    header.appendChild(title);

    if (item.url) {
      const link = document.createElement("a");
      link.className = "am-card-link";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.url.replace(/^https?:\/\//, "");
      header.appendChild(link);
    }

    card.appendChild(header);

    const chipsRow = document.createElement("div");
    chipsRow.className = "am-chip-row";

    if (item.type) {
      const chip = document.createElement("span");
      chip.className = "am-chip am-chip--accent";
      chip.textContent = item.type;
      chipsRow.appendChild(chip);
    }

    if (item.country) {
      const chip = document.createElement("span");
      chip.className = "am-chip";
      chip.textContent = item.country;
      chipsRow.appendChild(chip);
    }

    if (item.status) {
      const chip = document.createElement("span");
      chip.className = `am-chip ${cardStatusClass(item.status)}`.trim();
      chip.textContent = `Statut : ${item.status}`;
      chipsRow.appendChild(chip);
    }

    card.appendChild(chipsRow);

    if (item.description) {
      const p = document.createElement("p");
      p.className = "am-desc";
      p.textContent = item.description;
      card.appendChild(p);
    }

    const footerRow = document.createElement("div");
    footerRow.className = "am-footer-row";

    if (item.languages && item.languages.length) {
      const langSpan = document.createElement("span");
      langSpan.textContent =
        "Langues : " +
        item.languages
          .map((l) => l.toUpperCase())
          .join(", ");
      footerRow.appendChild(langSpan);
    } else {
      footerRow.appendChild(document.createElement("span"));
    }

    if (item.tags && item.tags.length) {
      const tagsSpan = document.createElement("span");
      tagsSpan.textContent = item.tags.join(" · ");
      footerRow.appendChild(tagsSpan);
    }

    card.appendChild(footerRow);

    container.appendChild(card);
  });
}

async function loadData() {
  updateStatus("Chargement des données…");
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    const list = Array.isArray(raw) ? raw : Array.isArray(raw.items) ? raw.items : [];
    state.all = list.map(normaliseItem);
    state.type = "";
    state.country = "";
    state.filtered = [...state.all];
    renderFilters();
    renderCards();
    updateMeta();
    updateStatus("Données chargées.");
  } catch (err) {
    console.error(err);
    state.all = [];
    state.filtered = [];
    renderCards();
    updateMeta();
    updateStatus("Erreur : impossible de charger automedias.json");
  }
}

function initEvents() {
  const typeSelect = document.getElementById("filter-type");
  const countrySelect = document.getElementById("filter-country");
  const reloadBtn = document.getElementById("reload-btn");

  if (typeSelect) {
    typeSelect.addEventListener("change", (e) => {
      state.type = e.target.value;
      applyFilters();
    });
  }

  if (countrySelect) {
    countrySelect.addEventListener("change", (e) => {
      state.country = e.target.value;
      applyFilters();
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      loadData();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  loadData();
});
