import { Issue } from '@/types/issue';

// Overlay state
let highlightedElements: Map<string, HTMLElement> = new Map();
let activeTooltip: HTMLElement | null = null;

const SEVERITY_COLORS = {
  critical: '#DC2626', // red-600
  serious: '#EA580C',  // orange-600
  moderate: '#D97706', // amber-600
  minor: '#2563EB'     // blue-600
};

const OVERLAY_Z_INDEX = 2147483647; // Maximum z-index
const TOOLTIP_Z_INDEX = OVERLAY_Z_INDEX + 1;

/**
 * Create highlight overlay for an issue
 */
export function highlightIssue(issue: Issue): void {
  try {
    const element = document.querySelector(issue.node.selector);
    if (!element) {
      console.warn('Element not found for selector:', issue.node.selector);
      return;
    }

    // Remove existing highlight if any
    removeHighlight(issue.id);

    // Create overlay element
    const overlay = createOverlayElement(element as HTMLElement, issue);
    highlightedElements.set(issue.id, overlay);

    // Add to document
    document.body.appendChild(overlay);

    // Add event listeners
    overlay.addEventListener('mouseenter', () => showTooltip(issue, overlay));
    overlay.addEventListener('mouseleave', hideTooltip);
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      // Send message to side panel to select this issue
      window.postMessage({
        type: 'HIGHLIGHT_CLICKED',
        issueId: issue.id
      }, '*');
    });

    // Scroll element into view with smooth scroll
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add pulse animation
    overlay.style.animation = 'pulse 1s ease-in-out 2';
  } catch (error) {
    console.error('Failed to highlight issue:', error);
  }
}

/**
 * Create overlay element positioned over the target element
 */
function createOverlayElement(element: HTMLElement, issue: Issue): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'accessibility-audit-overlay';
  overlay.dataset.issueId = issue.id;

  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  const color = SEVERITY_COLORS[issue.impact];

  overlay.style.cssText = `
    position: absolute;
    top: ${rect.top + scrollTop}px;
    left: ${rect.left + scrollLeft}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 3px solid ${color};
    border-radius: 4px;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 10px ${color}80;
    pointer-events: auto;
    z-index: ${OVERLAY_Z_INDEX};
    background-color: ${color}10;
    transition: all 0.2s ease;
    cursor: pointer;
  `;

  // Add pulse animation
  addPulseAnimation();

  // Update position on scroll and resize
  const updatePosition = () => {
    const newRect = element.getBoundingClientRect();
    const newScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const newScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    overlay.style.top = `${newRect.top + newScrollTop}px`;
    overlay.style.left = `${newRect.left + newScrollLeft}px`;
    overlay.style.width = `${newRect.width}px`;
    overlay.style.height = `${newRect.height}px`;
  };

  window.addEventListener('scroll', updatePosition, { passive: true });
  window.addEventListener('resize', updatePosition, { passive: true });

  // Store cleanup function
  (overlay as any).__cleanup = () => {
    window.removeEventListener('scroll', updatePosition);
    window.removeEventListener('resize', updatePosition);
  };

  return overlay;
}

/**
 * Add pulse animation keyframes to document
 */
function addPulseAnimation(): void {
  if (document.getElementById('accessibility-audit-animations')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'accessibility-audit-animations';
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.02);
        opacity: 0.8;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Show tooltip for an issue
 */
function showTooltip(issue: Issue, overlay: HTMLElement): void {
  hideTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = 'accessibility-audit-tooltip';

  const color = SEVERITY_COLORS[issue.impact];

  tooltip.innerHTML = `
    <div style="
      position: absolute;
      background: white;
      border: 2px solid ${color};
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: ${TOOLTIP_Z_INDEX};
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    ">
      <div style="
        font-weight: 600;
        color: ${color};
        margin-bottom: 4px;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.5px;
      ">
        ${issue.impact}
      </div>
      <div style="
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 8px;
      ">
        ${issue.title}
      </div>
      <div style="
        color: #6b7280;
        font-size: 12px;
        border-top: 1px solid #e5e7eb;
        padding-top: 8px;
      ">
        WCAG ${issue.wcag.level} · ${issue.ruleId}
      </div>
      <div style="
        color: #9ca3af;
        font-size: 11px;
        margin-top: 4px;
        font-style: italic;
      ">
        Click to view details
      </div>
    </div>
  `;

  // Position tooltip above the overlay
  const rect = overlay.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  const tooltipContent = tooltip.firstElementChild as HTMLElement;
  tooltipContent.style.top = `${rect.top + scrollTop - 10}px`;
  tooltipContent.style.left = `${rect.left + scrollLeft}px`;
  tooltipContent.style.transform = 'translateY(-100%)';

  document.body.appendChild(tooltip);
  activeTooltip = tooltip;
}

/**
 * Hide active tooltip
 */
function hideTooltip(): void {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

/**
 * Remove highlight for a specific issue
 */
export function removeHighlight(issueId: string): void {
  const overlay = highlightedElements.get(issueId);
  if (overlay) {
    // Call cleanup function if it exists
    if ((overlay as any).__cleanup) {
      (overlay as any).__cleanup();
    }
    overlay.remove();
    highlightedElements.delete(issueId);
  }
}

/**
 * Clear all highlights
 */
export function clearAllHighlights(): void {
  highlightedElements.forEach((overlay) => {
    if ((overlay as any).__cleanup) {
      (overlay as any).__cleanup();
    }
    overlay.remove();
  });
  highlightedElements.clear();
  hideTooltip();
}

/**
 * Highlight all issues
 */
export function highlightAllIssues(issues: Issue[]): void {
  clearAllHighlights();
  issues.forEach(issue => highlightIssue(issue));
}

/**
 * Get number of active highlights
 */
export function getHighlightCount(): number {
  return highlightedElements.size;
}
