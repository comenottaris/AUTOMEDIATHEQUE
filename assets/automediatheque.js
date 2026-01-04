/* assets/automediatheque.css */

:root {
  --am-bg: #f5f5f7;
  --am-surface: #ffffff;
  --am-border: #dadce0;
  --am-text: #202124;
  --am-muted: #5f6368;
  --am-accent: #1a73e8;
  --am-radius: 8px;
  --am-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--am-bg);
  color: var(--am-text);
  line-height: 1.5;
}

/* Header */

.am-header {
  background: var(--am-surface);
  border-bottom: 1px solid var(--am-border);
}

.am-header-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 1rem;
}

.am-header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.9rem;
}

.am-subtitle {
  margin: 0 0 1rem;
  color: var(--am-muted);
}

.am-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.am-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.am-filters label {
  font-size: 0.9rem;
  color: var(--am-muted);
  display: flex;
  flex-direction: column;
}

.am-filters select {
  margin-top: 0.25rem;
  min-width: 8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--am-border);
  background: #fff;
  font-size: 0.9rem;
}

.am-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

#am-refresh-db {
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--am-accent);
  background: #fff;
  color: var(--am-accent);
  cursor: pointer;
  font-size: 0.9rem;
}

#am-refresh-db:hover {
  background: rgba(26, 115, 232, 0.06);
}

/* Main layout */

.am-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

.am-section {
  margin-bottom: 2rem;
}

.am-section-title {
  margin: 0 0 1rem;
  font-size: 1.3rem;
}

/* Grid de cartes */

.am-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

/* Cartes */

.am-card {
  background: var(--am-surface);
  border-radius: var(--am-radius);
  box-shadow: var(--am-shadow);
  padding: 0.9rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.am-card-title {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
}

.am-card-title a {
  color: var(--am-accent);
  text-decoration: none;
}

.am-card-title a:hover {
  text-decoration: underline;
}

.am-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
}

.am-card-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--am-muted);
}

/* Tags */

.am-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid transparent;
}

.am-tag-type {
  background: rgba(26, 115, 232, 0.07);
  color: #174ea6;
  border-color: rgba(26, 115, 232, 0.1);
}

.am-tag-country {
  background: rgba(0, 0, 0, 0.03);
  color: #3c4043;
  border-color: rgba(0, 0, 0, 0.05);
}

.am-tag-lang {
  background: rgba(52, 168, 83, 0.07);
  color: #0d652d;
  border-color: rgba(52, 168, 83, 0.1);
}

/* Messages */

.am-message {
  grid-column: 1 / -1;
  padding: 0.75rem 1rem;
  background: #fff9c4;
  border-radius: var(--am-radius);
  border: 1px solid #fdd835;
  font-size: 0.9rem;
}

.am-message-error {
  background: #ffebee;
  border-color: #e53935;
}

/* Texte de présentation */

.am-text h2 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.am-text p {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--am-muted);
}

/* Responsive */

@media (max-width: 600px) {
  .am-controls {
    align-items: flex-start;
  }

  .am-actions {
    margin-left: -2px;
  }
}
