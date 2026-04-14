import {
  calculate,
  convertUnits,
  fetchCalculators,
  fetchCommonErrors,
  fetchConverterCatalog,
  fetchExercises,
  generateExercise,
} from './apiClient.js';

const state = {
  calculators: [],
  exercises: [],
  commonErrors: [],
  converterCatalog: null,
  activeExerciseUnit: 'all',
  practiceMode: 'study',
  generatedExercise: null,
  showGeneratedSolution: true,
  results: new Map(),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getElement(id) {
  return document.getElementById(id);
}

function renderMessage(targetId, message, tone = 'empty-state') {
  const element = getElement(targetId);
  if (!element) {
    return;
  }

  element.innerHTML = `<div class="${tone}">${escapeHtml(message)}</div>`;
}

function formatValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('es-CL', { maximumFractionDigits: 6 }) : String(value);
}

function getUnitLabel(unitId) {
  if (unitId === 'all') {
    return 'Todas las unidades';
  }

  return state.calculators.find((calculator) => calculator.id === unitId)?.title ?? unitId;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('concentraciones-theme', theme);
  const label = getElement('theme-toggle-label');
  label.textContent = theme === 'dark' ? 'Tema claro' : 'Tema oscuro';
}

function initializeTheme() {
  const storedTheme = localStorage.getItem('concentraciones-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(storedTheme ?? (systemPrefersDark ? 'dark' : 'light'));

  getElement('theme-toggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
}

function setFormAvailability(formId, enabled) {
  const form = getElement(formId);
  if (!form) {
    return;
  }

  form.querySelectorAll('button, input, select').forEach((control) => {
    control.disabled = !enabled;
  });
}

function showSelectPlaceholder(selectId, message) {
  const select = getElement(selectId);
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">${escapeHtml(message)}</option>`;
  select.disabled = true;
}

function validateCalculators(calculators) {
  if (!Array.isArray(calculators) || calculators.length === 0) {
    throw new Error('No fue posible cargar las unidades de concentración.');
  }

  const validCatalog = calculators.every((calculator) => {
    return (
      calculator &&
      typeof calculator.id === 'string' &&
      typeof calculator.title === 'string' &&
      typeof calculator.shortLabel === 'string' &&
      Array.isArray(calculator.fields) &&
      calculator.fields.length > 0
    );
  });

  if (!validCatalog) {
    throw new Error('El catálogo de unidades llegó incompleto y no pudo mostrarse correctamente.');
  }

  return calculators;
}

function validateExercises(exercises) {
  if (!Array.isArray(exercises)) {
    throw new Error('No fue posible cargar los ejercicios resueltos.');
  }

  return exercises;
}

function validateCommonErrors(commonErrors) {
  if (!Array.isArray(commonErrors)) {
    throw new Error('No fue posible cargar la sección de errores comunes.');
  }

  return commonErrors;
}

function validateConverterCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) {
    throw new Error('No fue posible cargar el convertidor.');
  }

  const entries = Object.entries(catalog).filter(([, entry]) => {
    return entry && typeof entry.label === 'string' && entry.units && Object.keys(entry.units).length > 0;
  });

  if (entries.length === 0) {
    throw new Error('El convertidor no tiene categorías disponibles por ahora.');
  }

  return Object.fromEntries(entries);
}

function calculatorTemplate(calculator) {
  return `
    <article class="calculator-card">
      <span class="card-pill">${escapeHtml(calculator.shortLabel)}</span>
      <h3>${escapeHtml(calculator.title)}</h3>
      <p class="card-copy">${escapeHtml(calculator.tagline)}</p>
      <div class="formula-chip">${escapeHtml(calculator.formula)}</div>
      <p class="card-copy">${escapeHtml(calculator.description)}</p>
      <form class="calculator-form" data-calculator-id="${escapeHtml(calculator.id)}">
        <p class="form-hint">Deja exactamente un campo vacío para que el sistema despeje la variable faltante.</p>
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
        <div class="empty-state">Aún no hay resultado. Completa los datos y ejecuta la resolución guiada.</div>
      </div>
    </article>
  `;
}

function theoryTemplate(calculator) {
  return `
    <article class="theory-card">
      <span class="card-pill">${escapeHtml(calculator.shortLabel)}</span>
      <h3>${escapeHtml(calculator.title)}</h3>
      <p class="card-copy">${escapeHtml(calculator.learning)}</p>
      <div class="step-grid">
        <article class="step-card">
          <strong>Definición</strong>
          <p>${escapeHtml(calculator.theory.definition)}</p>
        </article>
        <article class="step-card">
          <strong>Cuándo usarla</strong>
          <p>${escapeHtml(calculator.theory.useCase)}</p>
        </article>
        <article class="step-card">
          <strong>Cuándo no conviene</strong>
          <p>${escapeHtml(calculator.theory.avoidUse)}</p>
        </article>
        <article class="step-card">
          <strong>Diferencia clave</strong>
          <p>${escapeHtml(calculator.theory.difference)}</p>
        </article>
        <article class="step-card">
          <strong>Pista de reconocimiento</strong>
          <p>${escapeHtml(calculator.theory.clue)}</p>
        </article>
        <article class="step-card">
          <strong>Error frecuente</strong>
          <p>${escapeHtml(calculator.theory.commonMistake)}</p>
        </article>
      </div>
      <p class="result-note">${escapeHtml(calculator.theory.summary)}</p>
    </article>
  `;
}

function resolvedExerciseTemplate(exercise) {
  return `
    <article class="exercise-card">
      <div class="exercise-meta">
        <span class="difficulty-pill">${escapeHtml(exercise.difficulty)}</span>
        <span class="card-pill">${escapeHtml(getUnitLabel(exercise.unit))}</span>
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
      <p class="exercise-takeaway"><strong>Clave didáctica:</strong> ${escapeHtml(exercise.takeaway)}</p>
    </article>
  `;
}

function commonErrorTemplate(error) {
  return `
    <article class="exercise-card">
      <span class="card-pill">Alerta</span>
      <h3>${escapeHtml(error.title)}</h3>
      <p class="exercise-prompt">${escapeHtml(error.detail)}</p>
      <p class="exercise-takeaway"><strong>Cómo evitarlo:</strong> ${escapeHtml(error.prevention)}</p>
    </article>
  `;
}

function renderCalculators() {
  const container = getElement('calculator-grid');
  if (state.calculators.length === 0) {
    renderMessage('calculator-grid', 'No hay calculadoras disponibles por ahora.');
    return;
  }

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
  if (state.calculators.length === 0) {
    renderMessage('theory-grid', 'La teoría estará disponible cuando carguen las unidades.');
    return;
  }

  getElement('theory-grid').innerHTML = state.calculators.map(theoryTemplate).join('');
}

function renderExerciseFilters() {
  const toolbar = getElement('exercise-filters');
  if (state.calculators.length === 0) {
    toolbar.innerHTML = '';
    return;
  }

  const filters = ['all', ...state.calculators.map((calculator) => calculator.id)];
  toolbar.innerHTML = filters
    .map((unitId) => {
      const activeClass = state.activeExerciseUnit === unitId ? 'active' : '';
      return `<button class="filter-button ${activeClass}" type="button" data-filter="${escapeHtml(unitId)}">${escapeHtml(getUnitLabel(unitId))}</button>`;
    })
    .join('');

  toolbar.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      state.activeExerciseUnit = event.currentTarget.dataset.filter;
      renderExerciseFilters();
      await loadExercises(state.activeExerciseUnit);
    });
  });
}

function renderResolvedExercises() {
  if (state.exercises.length === 0) {
    renderMessage('exercise-grid', 'No se encontraron ejercicios para la unidad seleccionada.');
    return;
  }

  getElement('exercise-grid').innerHTML = state.exercises.map(resolvedExerciseTemplate).join('');
}

function renderErrors() {
  if (state.commonErrors.length === 0) {
    renderMessage('error-grid', 'No hay alertas disponibles por ahora.');
    return;
  }

  getElement('error-grid').innerHTML = state.commonErrors.map(commonErrorTemplate).join('');
}

function renderResult(calculatorId, result) {
  const container = getElement(`result-${calculatorId}`);
  if (!container) {
    return;
  }

  if (!result) {
    container.innerHTML = '<div class="empty-state">Aún no hay resultado. Completa los datos y ejecuta la resolución guiada.</div>';
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
    `Interpretación: ${result.interpretation}`,
  ].join('\n');
}

async function handleCalculationSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const calculatorId = form.dataset.calculatorId;
  renderMessage(`result-${calculatorId}`, 'Resolviendo y verificando consistencia...', 'loading-state');

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const result = await calculate(calculatorId, payload);
    state.results.set(calculatorId, result);
    renderResult(calculatorId, result);
  } catch (error) {
    renderMessage(`result-${calculatorId}`, error.message, 'error-state');
  }
}

function renderConverterCategoryOptions() {
  const categorySelect = getElement('converter-category');
  const entries = Object.entries(state.converterCatalog ?? {});
  if (entries.length === 0) {
    showSelectPlaceholder('converter-category', 'Categoría no disponible');
    showSelectPlaceholder('converter-from', 'Unidad no disponible');
    showSelectPlaceholder('converter-to', 'Unidad no disponible');
    return;
  }

  categorySelect.disabled = false;
  categorySelect.innerHTML = entries
    .map(([id, entry]) => `<option value="${escapeHtml(id)}">${escapeHtml(entry.label)}</option>`)
    .join('');
}

function renderConverterUnitOptions() {
  const category = getElement('converter-category').value;
  const catalogEntry = state.converterCatalog?.[category];
  const fromSelect = getElement('converter-from');
  const toSelect = getElement('converter-to');

  if (!catalogEntry || !catalogEntry.units) {
    showSelectPlaceholder('converter-from', 'Unidad no disponible');
    showSelectPlaceholder('converter-to', 'Unidad no disponible');
    return;
  }

  const units = Object.entries(catalogEntry.units);
  if (units.length === 0) {
    showSelectPlaceholder('converter-from', 'Unidad no disponible');
    showSelectPlaceholder('converter-to', 'Unidad no disponible');
    return;
  }

  const options = units.map(([id, entry]) => `<option value="${escapeHtml(id)}">${escapeHtml(entry.label)}</option>`).join('');
  fromSelect.disabled = false;
  toSelect.disabled = false;
  fromSelect.innerHTML = options;
  toSelect.innerHTML = options;

  if (units.length > 1) {
    toSelect.value = units[1][0];
  }
}

async function handleConverterSubmit(event) {
  event.preventDefault();
  if (!state.converterCatalog) {
    renderMessage('converter-result', 'El convertidor aún no está disponible.', 'error-state');
    return;
  }

  renderMessage('converter-result', 'Convirtiendo magnitudes...', 'loading-state');

  const formData = new FormData(event.currentTarget);
  try {
    const result = await convertUnits(Object.fromEntries(formData.entries()));
    getElement('converter-result').innerHTML = `
      <div class="result-value">
        <div>
          <span class="eyebrow">Resultado de conversión</span>
          <strong>${escapeHtml(formatValue(result.outputValue))} ${escapeHtml(result.toUnit)}</strong>
        </div>
        <span>${escapeHtml(formatValue(result.inputValue))} ${escapeHtml(result.fromUnit)}</span>
      </div>
      <p class="result-note">${escapeHtml(result.explanation)}</p>
      <ul class="result-summary">${result.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul>
      ${result.note ? `<p class="exercise-takeaway"><strong>Nota:</strong> ${escapeHtml(result.note)}</p>` : ''}
    `;
  } catch (error) {
    renderMessage('converter-result', error.message, 'error-state');
  }
}

function renderPracticeUnitOptions() {
  const practiceUnit = getElement('practice-unit');
  if (state.calculators.length === 0) {
    showSelectPlaceholder('practice-unit', 'Unidad no disponible');
    return;
  }

  practiceUnit.disabled = false;
  practiceUnit.innerHTML = ['all', ...state.calculators.map((calculator) => calculator.id)]
    .map((unitId) => `<option value="${escapeHtml(unitId)}">${escapeHtml(getUnitLabel(unitId))}</option>`)
    .join('');
}

function renderGeneratedExercise() {
  const container = getElement('generated-exercise');
  if (!state.generatedExercise) {
    container.innerHTML = '<div class="empty-state">Aquí aparecerá un ejercicio nuevo para practicar.</div>';
    return;
  }

  const exercise = state.generatedExercise;
  const canSeeSolution = state.practiceMode === 'study' || state.showGeneratedSolution;

  container.innerHTML = `
    <div class="exercise-meta">
      <span class="difficulty-pill">${escapeHtml(exercise.difficulty)}</span>
      <span class="card-pill">${escapeHtml(getUnitLabel(exercise.unit))}</span>
    </div>
    <h3>${escapeHtml(exercise.title)}</h3>
    <p class="exercise-prompt">${escapeHtml(exercise.prompt)}</p>
    ${
      canSeeSolution
        ? `
          <div class="step-grid">
            ${exercise.steps
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
          <p class="result-note"><strong>Resultado:</strong> ${escapeHtml(exercise.answer)}</p>
          <p class="exercise-takeaway"><strong>Interpretación:</strong> ${escapeHtml(exercise.interpretation)}</p>
          <p class="exercise-takeaway"><strong>Idea clave:</strong> ${escapeHtml(exercise.takeaway)}</p>
        `
        : `
          <p class="exercise-takeaway"><strong>Modo examen:</strong> Intenta resolverlo antes de revelar la solución.</p>
          <div class="form-actions">
            <button class="mini-button secondary" type="button" data-reveal-solution="true">Mostrar solución</button>
          </div>
        `
    }
  `;
}

async function handlePracticeSubmit(event) {
  event.preventDefault();
  if (state.calculators.length === 0) {
    renderMessage('generated-exercise', 'La práctica guiada estará disponible cuando carguen las unidades.', 'error-state');
    return;
  }

  const formData = new FormData(event.currentTarget);
  const params = Object.fromEntries(formData.entries());
  renderMessage('generated-exercise', 'Generando un ejercicio nuevo...', 'loading-state');

  try {
    state.generatedExercise = await generateExercise(params);
    state.showGeneratedSolution = state.practiceMode === 'study';
    renderGeneratedExercise();
  } catch (error) {
    renderMessage('generated-exercise', error.message, 'error-state');
  }
}

async function loadExercises(unit) {
  renderMessage('exercise-grid', 'Cargando ejercicios resueltos...', 'loading-state');

  try {
    state.exercises = validateExercises(await fetchExercises(unit));
    renderResolvedExercises();
  } catch (error) {
    renderMessage('exercise-grid', error.message, 'error-state');
  }
}

async function loadCalculatorsSection() {
  renderMessage('calculator-grid', 'Cargando calculadoras...', 'loading-state');
  renderMessage('theory-grid', 'Cargando fundamentos...', 'loading-state');
  renderMessage('exercise-grid', 'Cargando ejercicios resueltos...', 'loading-state');
  showSelectPlaceholder('practice-unit', 'Cargando unidades...');
  setFormAvailability('practice-form', false);

  try {
    state.calculators = validateCalculators(await fetchCalculators());
    renderCalculators();
    renderTheory();
    renderPracticeUnitOptions();
    setFormAvailability('practice-form', true);
    renderExerciseFilters();
    await loadExercises(state.activeExerciseUnit);
  } catch (error) {
    renderMessage('calculator-grid', error.message, 'error-state');
    renderMessage('theory-grid', error.message, 'error-state');
    renderMessage(
      'exercise-grid',
      'No fue posible cargar los ejercicios porque las unidades no estuvieron disponibles.',
      'error-state',
    );
    renderMessage(
      'generated-exercise',
      'La práctica guiada no puede mostrarse hasta que carguen las unidades.',
      'error-state',
    );
    getElement('exercise-filters').innerHTML = '';
    showSelectPlaceholder('practice-unit', 'Unidad no disponible');
    setFormAvailability('practice-form', false);
  }
}

async function loadConverterSection() {
  showSelectPlaceholder('converter-category', 'Cargando categorías...');
  showSelectPlaceholder('converter-from', 'Selecciona una categoría');
  showSelectPlaceholder('converter-to', 'Selecciona una categoría');
  setFormAvailability('converter-form', false);
  renderMessage(
    'converter-result',
    'Selecciona una categoría, ingresa un valor y ejecuta la conversión.',
  );

  try {
    state.converterCatalog = validateConverterCatalog(await fetchConverterCatalog());
    renderConverterCategoryOptions();
    renderConverterUnitOptions();
    setFormAvailability('converter-form', true);
  } catch (error) {
    showSelectPlaceholder('converter-category', 'Convertidor no disponible');
    showSelectPlaceholder('converter-from', 'Unidad no disponible');
    showSelectPlaceholder('converter-to', 'Unidad no disponible');
    setFormAvailability('converter-form', false);
    renderMessage('converter-result', error.message, 'error-state');
  }
}

async function loadCommonErrorsSection() {
  renderMessage('error-grid', 'Cargando alertas frecuentes...', 'loading-state');

  try {
    state.commonErrors = validateCommonErrors(await fetchCommonErrors());
    renderErrors();
  } catch (error) {
    renderMessage('error-grid', error.message, 'error-state');
  }
}

function bindGlobalActions() {
  document.addEventListener('click', async (event) => {
    const copyButton = event.target.closest('[data-copy-result]');
    if (copyButton) {
      const calculatorId = copyButton.dataset.copyResult;
      const result = state.results.get(calculatorId);
      if (!result) {
        return;
      }

      try {
        await navigator.clipboard.writeText(serializeResult(result));
        copyButton.textContent = 'Copiado';
      } catch {
        copyButton.textContent = 'No se pudo copiar';
      }

      window.setTimeout(() => {
        copyButton.textContent = 'Copiar resumen';
      }, 1400);
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
      return;
    }

    const revealButton = event.target.closest('[data-reveal-solution]');
    if (revealButton) {
      state.showGeneratedSolution = true;
      renderGeneratedExercise();
      return;
    }

    const modeButton = event.target.closest('[data-mode]');
    if (modeButton) {
      state.practiceMode = modeButton.dataset.mode;
      state.showGeneratedSolution = state.practiceMode === 'study';
      document.querySelectorAll('[data-mode]').forEach((button) => {
        button.classList.toggle('active', button.dataset.mode === state.practiceMode);
      });
      renderGeneratedExercise();
    }
  });
}

function bindStaticControls() {
  getElement('converter-category').addEventListener('change', renderConverterUnitOptions);
  getElement('converter-form').addEventListener('submit', handleConverterSubmit);
  getElement('practice-form').addEventListener('submit', handlePracticeSubmit);
}

async function bootstrap() {
  renderGeneratedExercise();
  await Promise.allSettled([loadCalculatorsSection(), loadCommonErrorsSection(), loadConverterSection()]);
}

getElement('year').textContent = new Date().getFullYear();
initializeTheme();
bindGlobalActions();
bindStaticControls();
bootstrap();
