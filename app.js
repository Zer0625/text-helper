(() => {
  'use strict';

  const textInput = document.getElementById('textInput');
  const preview = document.getElementById('preview');
  const output = document.getElementById('codeOutput');
  const copyButton = document.getElementById('copyButton');
  const status = document.getElementById('status');
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const letterControls = document.getElementById('letterControls');
  const letterList = document.getElementById('letterList');
  const picker1 = document.getElementById('picker1');
  const picker2 = document.getElementById('picker2');
  const hex1 = document.getElementById('hex1');
  const hex2 = document.getElementById('hex2');

  const palette = { first: '#FF3838', second: '#35C8E8' };
  let mode = 'solid';
  let letterColors = [];

  function normalizeHex(value) {
    const clean = String(value).trim().replace(/^#/, '');
    return /^[0-9a-fA-F]{6}$/.test(clean) ? `#${clean.toUpperCase()}` : null;
  }

  function escapeText(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  function rgbToHex(rgb) {
    return `#${[rgb.r, rgb.g, rgb.b].map(n => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }

  function mixColors(from, to, amount) {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    return rgbToHex({
      r: a.r + (b.r - a.r) * amount,
      g: a.g + (b.g - a.g) * amount,
      b: a.b + (b.b - a.b) * amount
    });
  }

  function gradientColors(count) {
    if (count <= 1) return [palette.first];
    return Array.from({ length: count }, (_, index) => mixColors(palette.first, palette.second, index / (count - 1)));
  }

  function getCharacters() {
    return Array.from(textInput.value);
  }

  function ensureLetterColors() {
    const chars = getCharacters();
    const defaults = gradientColors(chars.length);
    letterColors = chars.map((_, index) => normalizeHex(letterColors[index] || '') || defaults[index]);
  }

  function colorsForCurrentMode() {
    const chars = getCharacters();
    if (mode === 'solid') return chars.map(() => palette.first);
    if (mode === 'gradient') return gradientColors(chars.length);
    ensureLetterColors();
    return [...letterColors];
  }

  function makeCode(chars, colors) {
    const text = chars.join('');
    if (!text) return '';
    if (mode === 'solid') {
      return `<font color='${palette.first}'>${escapeText(text)}</font>`;
    }
    return chars.map((character, index) => `<font color='${colors[index]}'>${escapeText(character)}</font>`).join('');
  }

  function renderPreview(chars, colors) {
    preview.replaceChildren();
    if (!chars.length) {
      preview.textContent = 'Your text';
      preview.style.color = '#9BB1B8';
      return;
    }

    chars.forEach((character, index) => {
      const span = document.createElement('span');
      span.textContent = character;
      span.style.color = colors[index];
      preview.append(span);
    });
  }

  function buildLetterEditor(chars) {
    letterList.replaceChildren();
    chars.forEach((character, index) => {
      const item = document.createElement('div');
      item.className = 'letter-item';

      const glyph = document.createElement('span');
      glyph.className = 'letter-glyph';
      glyph.textContent = character === ' ' ? '␠' : character;
      glyph.title = character === ' ' ? 'Space' : `Letter ${index + 1}`;

      const picker = document.createElement('input');
      picker.className = 'letter-picker';
      picker.type = 'color';
      picker.value = letterColors[index];
      picker.setAttribute('aria-label', `Color for letter ${index + 1}`);
      picker.addEventListener('input', () => updateLetterColor(index, picker.value, hex));

      const hex = document.createElement('input');
      hex.className = 'letter-hex';
      hex.type = 'text';
      hex.value = letterColors[index];
      hex.maxLength = 7;
      hex.spellcheck = false;
      hex.setAttribute('aria-label', `HEX for letter ${index + 1}`);
      hex.addEventListener('input', () => {
        const color = normalizeHex(hex.value);
        if (color) updateLetterColor(index, color, picker);
      });
      hex.addEventListener('change', () => {
        const color = normalizeHex(hex.value);
        if (!color) {
          hex.value = letterColors[index];
          status.textContent = 'Invalid HEX. Use #RRGGBB.';
        } else {
          status.textContent = '';
        }
      });

      item.append(glyph, picker, hex);
      letterList.append(item);
    });
  }

  function updateLetterColor(index, color, otherInput) {
    const normalized = normalizeHex(color);
    if (!normalized) return;
    letterColors[index] = normalized;
    otherInput.value = normalized;
    updateDisplay();
  }

  function updateDisplay() {
    const chars = getCharacters();
    const chosenColors = colorsForCurrentMode();
    renderPreview(chars, chosenColors);
    output.value = makeCode(chars, chosenColors);
  }

  function render() {
    const chars = getCharacters();
    ensureLetterColors();
    letterControls.hidden = mode !== 'custom';
    if (mode === 'custom') buildLetterEditor(chars);
    updateDisplay();
  }

  function setPaletteColor(which, value) {
    const normalized = normalizeHex(value);
    if (!normalized) return false;
    palette[which] = normalized;
    const picker = which === 'first' ? picker1 : picker2;
    const hex = which === 'first' ? hex1 : hex2;
    picker.value = normalized;
    hex.value = normalized;
    if (mode === 'custom') ensureLetterColors();
    render();
    return true;
  }

  function bindPaletteColor(which, picker, hex) {
    picker.addEventListener('input', () => setPaletteColor(which, picker.value));
    hex.addEventListener('input', () => {
      const normalized = normalizeHex(hex.value);
      if (normalized) setPaletteColor(which, normalized);
    });
    hex.addEventListener('change', () => {
      if (!setPaletteColor(which, hex.value)) {
        hex.value = palette[which];
        status.textContent = 'Invalid HEX. Use #RRGGBB.';
      } else {
        status.textContent = '';
      }
    });
  }

  function setMode(nextMode) {
    mode = nextMode;
    modeButtons.forEach(button => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
  }

  function applyGradientToLetters() {
    letterColors = gradientColors(getCharacters().length);
    status.textContent = 'Gradient applied. You can still change each letter.';
    render();
  }

  function applyFirstColorToLetters() {
    letterColors = getCharacters().map(() => palette.first);
    status.textContent = 'HEX 1 applied to every letter.';
    render();
  }

  async function copyCode() {
    if (!output.value) {
      status.textContent = 'Enter some text first.';
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(output.value);
      } else {
        output.focus();
        output.select();
        if (!document.execCommand('copy')) throw new Error('copy failed');
      }
      status.textContent = 'Code copied.';
      copyButton.textContent = 'Copied';
      window.setTimeout(() => { copyButton.textContent = 'Copy'; }, 1200);
    } catch {
      output.focus();
      output.select();
      status.textContent = 'Select the code and press Ctrl+C.';
    }
  }

  textInput.addEventListener('input', () => {
    ensureLetterColors();
    render();
  });
  modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  document.getElementById('applyGradient').addEventListener('click', applyGradientToLetters);
  document.getElementById('applyFirst').addEventListener('click', applyFirstColorToLetters);
  copyButton.addEventListener('click', copyCode);
  bindPaletteColor('first', picker1, hex1);
  bindPaletteColor('second', picker2, hex2);
  render();
})();
