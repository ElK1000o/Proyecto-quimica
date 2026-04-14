import { calculate, fetchCalculators, fetchExercises } from './api.js';
import './main.js';

if (false) {
const state = {
  calculators: [],
  exercises: [],
  activeExerciseUnit: 'all',
  results: new Map(),
};

const unitLabels = {
  all: 'Todas',
  'mass-mass': '% m/m',
  molarity: 'Molaridad',
  'mole-fraction': 'Fraccion molar',
};

const glowClassById = {
  'mass-mass': 'glow-mass-mass',
  molarity: 'glow-molarity',
  'mole-fraction': 'glow-mole-fraction',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatValue(value) {
  return Number(value).toLocaleString('es-CL', { maximumFractionDigits: 6 });
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('concentraciones-theme', theme);
  const label = document.getElementById('theme-toggle-label');
  label.textContent = theme === 'dark' ? 'Tema claro' : 'Tema oscuro';
}

function initializeTheme() {
  const storedTheme = localStorage.getItem('concentraciones-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(storedTheme ?? (systemPrefersDark ? 'dark' : 'light'));

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
}

function calculatorTemplate(calculator) {
  return `
    <article class="calculator-card ${glowClassById[calculator.id] ?? ''}">
      <span class="card-pill">${escapeHtml(calculator.shortLabel)}</span>
      <h3>${escapeHtml(calculator.title)}</h3>
      <p class="card-copy">${escapeHtml(calculator.tagline)}</p>
      <div class="formula-chip">${escapeHtml(calculator.formula)}</div>
      <p class="card-copy">${escapeHtml(calculator.description)}</p>
      <form class="calculator-form" data-calculator-id="${escapeHtml(calculator.id)}">
        <p class="form-hint">Deja exactamente un campo vacio para que el sistema despeje la variable faltante.</p>
        ${calculator.fields
          .map(
            (field) => `
              <div class="field">
                <label for="${escapeHtml(calculator.id)}-${escapeHtml(field.name)}">${escapeHtml(field.label)}</label>
                <div class="input-shell">
                  <input
                    id="${escapeHtml(calculator.id)}-${escapeHtml(field.name)}"
                    name="${escapeHtml(field.name)}"
                    inputmode="decimal"
                    placeholder="${escapeHtml(field.placeholder)}"
                    autocomplete="off"
                  />
                  <span class="input-unit">${escapeHtml(field.unit)}</span>
                </div>
              </div>
            `,
          )
          .join('')}
        <div class="form-actions">
          <button class="mini-button primary" type="submit">Resolver</button>
          <button class="mini-button secondary" type="reset">Reiniciar</button>
        </div>
      </form>
      <div class="result-panel" id="result-${escapeHtml(calculator.id)}" aria-live="polite">
        <div class="empty-state">Aun no hay resultado. Completa los datos y ejecuta la resolucion guiada.</div>
      </div>
    </article>
  `;
}

function theoryTemplate(calculator) {
  return `
    <article class="theory-card ${glowClassById[calculator.id] ?? ''}">
      <span class="card-pill">${escapeHtml(calculator.shortLabel)}</span>
      <h3>${escapeHtml(calculator.title)}</h3>
      <p class="card-copy">${escapeHtml(calculator.learning)}</p>
      <div class="step-grid">
        <article class="step-card">
          <strong>Que representa</strong>
          <p>${escapeHtml(calculator.theory.definition)}</p>
        </article>
        <article class="step-card">
          <strong>Cuando usarla</strong>
          <p>${escapeHtml(calculator.theory.useCase)}</p>
        </article>
        <article class="step-card">
          <strong>Error comun</strong>
          <p>${escapeHtml(calculator.theory.commonMistake)}</p>
        </article>
      </div>
    </article>
  `;
}

function renderCalculators() {
  const container = document.getElementById('calculator-grid');
  container.innerHTML = state.calculators.map(calculatorTemplate).join('');

  container.querySelectorAll('form[data-calculator-id]').forEach((form) => {
    form.addEventListener('submit', handleCalculationSubmit);
    form.addEventListener('reset', (event) => {
      const calculatorId = event.currentTarget.dataset.calculatorId;
      state.results.delete(calculatorId);
      renderResult(calculatorId, null);
    });
  });
}

function renderTheory() {
  const container = document.getElementById('theory-grid');
  container.innerHTML = state.calculators.map(theoryTemplate).join('');
}

function exerciseFilterTemplate(id) {
  const activeClass = state.activeExerciseUnit === id ? 'active' : '';
  return `<button class="filter-button ${activeClass}" type="button" data-filter="${escapeHtml(id)}">${escapeHtml(unitLabels[id])}</button>`;
}

function exerciseTemplate(exercise) {
  return `
    <article class="exercise-card ${glowClassById[exercise.unit] ?? ''}">
      <div class="exercise-meta">
        <span class="difficulty-pill">${escapeHtml(exercise.difficulty)}</span>
        <span class="card-pill">${escapeHtml(unitLabels[exercise.unit])}</span>
      </div>
      <h3>${escapeHtml(exercise.title)}</h3>
      <p class="exercise-prompt">${escapeHtml(exercise.prompt)}</p>
      <ol class="exercise-steps">
        ${exercise.steps
          .map(
            (step) => `
              <li>
                <strong>${escapeHtml(step.title)}</strong>
                <span>${escapeHtml(step.explanation)}</span>
              </li>
            `,
          )
          .join('')}
      </ol>
      <p class="result-note"><strong>Resultado:</strong> ${escapeHtml(exercise.answer)}</p>
      <p class="exercise-takeaway"><strong>Clave didactica:</strong> ${escapeHtml(exercise.takeaway)}</p>
    </article>
  `;
}

function renderExercises() {
  const filtersContainer = document.getElementById('exercise-filters');
  filtersContainer.innerHTML = ['all', 'mass-mass', 'molarity', 'mole-fraction'].map(exerciseFilterTemplate).join('');
  filtersContainer.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      state.activeExerciseUnit = event.currentTarget.dataset.filter;
      renderExercises();
      await loadExercises(state.activeExerciseUnit);
    });
  });

  const grid = document.getElementById('exercise-grid');
  grid.innerHTML = state.exercises.map(exerciseTemplate).join('');
}

function renderResult(calculatorId, result) {
  const container = document.getElementById(`result-${calculatorId}`);
  if (!container) {
    return;
  }

  if (!result) {
    container.innerHTML = '<div class="empty-state">Aun no hay resultado. Completa los datos y ejecuta la resolucion guiada.</div>';
    return;
  }

  container.innerHTML = `
    <div class="result-value">
      <div>
        <span class="eyebrow">Resultado principal</span>
        <strong>${escapeHtml(formatValue(result.primaryResult.value))} ${escapeHtml(result.primaryResult.unit)}</strong>
      </div>
      <span>${escapeHtml(result.primaryResult.label)}</span>
    </div>
    <div class="result-actions">
      <button class="text-button" type="button" data-copy-result="${escapeHtml(calculatorId)}">Copiar resumen</button>
      <button class="text-button" type="button" data-export-result="${escapeHtml(calculatorId)}">Exportar TXT</button>
    </div>
    <ul class="result-summary">
      ${result.summary
        .map((item) => `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(formatValue(item.value))} ${escapeHtml(item.unit)}</li>`)
        .join('')}
    </ul>
    <div class="step-grid">
      ${result.steps
        .map(
          (step) => `
            <article class="step-card">
              <strong>${escapeHtml(step.title)}</strong>
              <span class="step-equation">${escapeHtml(step.equation)}</span>
              <p>${escapeHtml(step.explanation)}</p>
            </article>
          `,
        )
        .join('')}
    </div>
    <p class="result-note">${escapeHtml(result.interpretation)}</p>
    <ul class="check-list">
      ${result.checks.map((check) => `<li>${escapeHtml(check)}</li>`).join('')}
    </ul>
  `;
}

function serializeResult(result) {
  return [
    `Resultado principal: ${result.primaryResult.label} = ${formatValue(result.primaryResult.value)} ${result.primaryResult.unit}`,
    '',
    'Resumen:',
    ...result.summary.map((item) => `- ${item.label}: ${formatValue(item.value)} ${item.unit}`),
    '',
    'Pasos:',
    ...result.steps.map((step, index) => `${index + 1}. ${step.title}\n   ${step.equation}\n   ${step.explanation}`),
    '',
    `Interpretacion: ${result.interpretation}`,
  ].join('\n');
}

async function handleCalculationSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const calculatorId = form.dataset.calculatorId;
  const resultPanel = document.getElementById(`result-${calculatorId}`);
  resultPanel.innerHTML = '<div class="loading-state">Resolviendo y verificando consistencia...</div>';

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const result = await calculate(calculatorId, payload);
    state.results.set(calculatorId, result);
    renderResult(calculatorId, result);
  } catch (error) {
    resultPanel.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
}

async function loadExercises(unit) {
  try {
    state.exercises = await fetchExercises(unit);
    renderExercises();
  } catch (error) {
    const grid = document.getElementById('exercise-grid');
    grid.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
}

function bindResultActions() {
  document.addEventListener('click', async (event) => {
    const copyButton = event.target.closest('[data-copy-result]');
    if (copyButton) {
      const calculatorId = copyButton.dataset.copyResult;
      const result = state.results.get(calculatorId);
      if (!result) {
        return;
      }

      await navigator.clipboard.writeText(serializeResult(result));
      copyButton.textContent = 'Copiado';
      window.setTimeout(() => {
        copyButton.textContent = 'Copiar resumen';
      }, 1200);
      return;
    }

    const exportButton = event.target.closest('[data-export-result]');
    if (exportButton) {
      const calculatorId = exportButton.dataset.exportResult;
      const result = state.results.get(calculatorId);
      if (!result) {
        return;
      }

      const blob = new Blob([serializeResult(result)], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${calculatorId}-resultado.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  });
}

async function bootstrap() {
  try {
    state.calculators = await fetchCalculators();
    renderCalculators();
    renderTheory();
    await loadExercises(state.activeExerciseUnit);
  } catch (error) {
    const calculatorGrid = document.getElementById('calculator-grid');
    calculatorGrid.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
}

document.getElementById('year').textContent = new Date().getFullYear();
initializeTheme();
bindResultActions();
bootstrap();
}
