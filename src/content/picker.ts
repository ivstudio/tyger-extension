import { computeAccessibleName } from 'dom-accessibility-api';

let isPickerActive = false;
let pickerOverlay: HTMLElement | null = null;
let hoverIndicator: HTMLElement | null = null;
let lastHoveredElement: HTMLElement | null = null;

const PICKER_Z_INDEX = 2147483646; // Just below overlay z-index

/**
 * Enable element picker mode
 */
export function enablePicker(): void {
  if (isPickerActive) return;

  isPickerActive = true;
  document.body.style.cursor = 'crosshair';

  // Create picker overlay
  createPickerOverlay();

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown, true);

  console.log('Element picker enabled. Press ESC to cancel, click to select.');
}

/**
 * Disable element picker mode
 */
export function disablePicker(): void {
  if (!isPickerActive) return;

  isPickerActive = false;
  document.body.style.cursor = '';

  // Remove overlay
  if (pickerOverlay) {
    pickerOverlay.remove();
    pickerOverlay = null;
  }

  if (hoverIndicator) {
    hoverIndicator.remove();
    hoverIndicator = null;
  }

  // Remove event listeners
  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeyDown, true);

  lastHoveredElement = null;

  console.log('Element picker disabled');
}

/**
 * Toggle picker mode
 */
export function togglePicker(): void {
  if (isPickerActive) {
    disablePicker();
  } else {
    enablePicker();
  }
}

/**
 * Create semi-transparent overlay
 */
function createPickerOverlay(): void {
  pickerOverlay = document.createElement('div');
  pickerOverlay.id = 'accessibility-audit-picker-overlay';
  pickerOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: ${PICKER_Z_INDEX};
    pointer-events: none;
  `;
  document.body.appendChild(pickerOverlay);
}

/**
 * Handle mouse move - highlight element under cursor
 */
function handleMouseMove(e: MouseEvent): void {
  if (!isPickerActive) return;

  // Get element under cursor (ignoring our overlays)
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const targetElement = elements.find(
    el =>
      el !== pickerOverlay &&
      el !== hoverIndicator &&
      !el.classList.contains('accessibility-audit-overlay') &&
      !el.classList.contains('accessibility-audit-tooltip')
  ) as HTMLElement;

  if (!targetElement || targetElement === lastHoveredElement) {
    return;
  }

  lastHoveredElement = targetElement;

  // Update hover indicator
  updateHoverIndicator(targetElement);
}

/**
 * Update hover indicator position and info
 */
function updateHoverIndicator(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();

  // Create or update hover indicator
  if (!hoverIndicator) {
    hoverIndicator = document.createElement('div');
    hoverIndicator.id = 'accessibility-audit-hover-indicator';
    document.body.appendChild(hoverIndicator);
  }

  // Get element info
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role') || '';
  let accessibleName = '';

  try {
    accessibleName = computeAccessibleName(element);
  } catch (e) {
    // Ignore errors
  }

  const selector = getElementSelector(element);

  hoverIndicator.style.cssText = `
    position: absolute;
    top: ${rect.top + window.pageYOffset}px;
    left: ${rect.left + window.pageXOffset}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 2px dashed #3B82F6;
    background-color: rgba(59, 130, 246, 0.1);
    pointer-events: none;
    z-index: ${PICKER_Z_INDEX + 1};
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
  `;

  // Add info label
  hoverIndicator.innerHTML = `
    <div style="
      position: absolute;
      bottom: 100%;
      left: 0;
      background: #1f2937;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      white-space: nowrap;
      margin-bottom: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
    ">
      <div style="color: #60A5FA; margin-bottom: 2px;">${tagName}${role ? `[role="${role}"]` : ''}</div>
      ${accessibleName ? `<div style="color: #A3E635; font-size: 11px;">Name: ${accessibleName}</div>` : ''}
      <div style="color: #94A3B8; font-size: 10px; margin-top: 2px;">${selector}</div>
    </div>
  `;
}

/**
 * Handle click - select element
 */
function handleClick(e: MouseEvent): void {
  if (!isPickerActive) return;

  e.preventDefault();
  e.stopPropagation();

  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const targetElement = elements.find(
    el =>
      el !== pickerOverlay &&
      el !== hoverIndicator &&
      !el.classList.contains('accessibility-audit-overlay')
  ) as HTMLElement;

  if (!targetElement) return;

  // Get element info
  const elementInfo = getElementInfo(targetElement);

  // Send to side panel
  window.postMessage({
    type: 'ELEMENT_PICKED',
    elementInfo
  }, '*');

  // Disable picker
  disablePicker();
}

/**
 * Handle keyboard - ESC to cancel
 */
function handleKeyDown(e: KeyboardEvent): void {
  if (!isPickerActive) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    disablePicker();
  }
}

/**
 * Get comprehensive element info
 */
function getElementInfo(element: HTMLElement): any {
  const rect = element.getBoundingClientRect();
  let accessibleName = '';

  try {
    accessibleName = computeAccessibleName(element);
  } catch (e) {
    // Ignore
  }

  return {
    tagName: element.tagName.toLowerCase(),
    selector: getElementSelector(element),
    role: element.getAttribute('role') || element.tagName.toLowerCase(),
    accessibleName,
    attributes: {
      id: element.id,
      class: element.className,
      'aria-label': element.getAttribute('aria-label'),
      'aria-labelledby': element.getAttribute('aria-labelledby'),
      'aria-describedby': element.getAttribute('aria-describedby'),
      role: element.getAttribute('role'),
      tabindex: element.getAttribute('tabindex')
    },
    text: element.textContent?.trim().substring(0, 100) || '',
    html: element.outerHTML.substring(0, 500),
    position: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    },
    computed: {
      display: window.getComputedStyle(element).display,
      visibility: window.getComputedStyle(element).visibility,
      opacity: window.getComputedStyle(element).opacity
    }
  };
}

/**
 * Generate CSS selector for element
 */
function getElementSelector(element: HTMLElement): string {
  // If has ID, use it
  if (element.id) {
    return `#${element.id}`;
  }

  // Build selector using tag and classes
  let selector = element.tagName.toLowerCase();

  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).slice(0, 2);
    if (classes.length > 0 && classes[0]) {
      selector += '.' + classes.join('.');
    }
  }

  // Add nth-child if needed for uniqueness
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element);
    if (siblings.filter(s => s.tagName === element.tagName).length > 1) {
      selector += `:nth-child(${index + 1})`;
    }
  }

  return selector;
}

/**
 * Check if picker is active
 */
export function isPickerEnabled(): boolean {
  return isPickerActive;
}
