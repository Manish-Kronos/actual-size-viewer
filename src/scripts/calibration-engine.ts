/**
 * Calibration Engine — the ONLY JavaScript that ships to the browser.
 * Target bundle size: < 6 KB minified.
 *
 * Architecture:
 * 1. On load: restore calibration state from localStorage and apply DPI to CSS
 * 2. Expose a public API: window.calibration for other scripts to read state
 * 3. Dispatch 'calibration:updated' event when DPI changes
 * 4. The single DOM write: document.documentElement.style.setProperty('--dpi', dpi)
 *    instantly resizes ALL ActualSizeViewer components on the page via CSS calc()
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type CalibrationMethod = "credit-card" | "coin" | "monitor" | "default";
type CalibrationConfidence = "high" | "medium" | "low";

interface CalibrationState {
  dpi: number;
  method: CalibrationMethod;
  calibratedAt: string;
  confidence: CalibrationConfidence;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = "actualsize:calibration";
const CSS_DPI_VAR = "--dpi";
const DEFAULT_DPI = 96;

/** Known physical dimensions for calibration objects (mm) */
const CALIBRATION_REFS = {
  creditCard:  { widthMm: 85.6,  label: "Credit / Debit Card" },
  usQuarter:   { widthMm: 24.26, label: "US Quarter" },
  usPenny:     { widthMm: 19.05, label: "US Penny" },
  usDime:      { widthMm: 17.91, label: "US Dime" },
  euro1:       { widthMm: 23.25, label: "€1 Euro Coin" },
} as const;

// ─── State ────────────────────────────────────────────────────────────────────

let _state: CalibrationState = {
  dpi: DEFAULT_DPI,
  method: "default",
  calibratedAt: new Date(0).toISOString(),
  confidence: "low",
};

// ─── Core: Apply DPI to DOM ───────────────────────────────────────────────────

/**
 * THE single DOM write that drives all rendering.
 * Setting --dpi on :root causes every ActualSizeViewer to resize via CSS calc().
 */
function applyDpi(dpi: number): void {
  document.documentElement.style.setProperty(CSS_DPI_VAR, String(dpi));
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function saveState(state: CalibrationState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // localStorage blocked in private browsing — silent fail
  }
}

function loadState(): CalibrationState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CalibrationState;
    // Validate — ensure dpi is a positive number
    if (typeof parsed.dpi !== "number" || parsed.dpi <= 0 || parsed.dpi > 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ─── Public update function ───────────────────────────────────────────────────

/**
 * Apply a new calibration. Updates state, CSS variable, localStorage,
 * and dispatches the 'calibration:updated' event.
 */
function updateCalibration(
  dpi: number,
  method: CalibrationMethod,
  confidence: CalibrationConfidence
): void {
  const rounded = Math.round(dpi * 100) / 100;
  _state = {
    dpi: rounded,
    method,
    calibratedAt: new Date().toISOString(),
    confidence,
  };
  applyDpi(rounded);
  saveState(_state);
  window.dispatchEvent(
    new CustomEvent("calibration:updated", { detail: { ..._state } })
  );
}

// ─── Calibration Methods ──────────────────────────────────────────────────────

/**
 * Method 1: Credit Card (or any known object with a known width in mm).
 * @param physicalWidthMm - The known physical width of the reference object
 * @param measuredPx - The pixel width of the guide element after user drag
 */
export function calibrateFromKnownObject(
  physicalWidthMm: number,
  measuredPx: number
): void {
  const dpi = (measuredPx / physicalWidthMm) * 25.4;
  updateCalibration(dpi, "credit-card", "high");
}

/**
 * Method 2: Monitor diagonal.
 * @param diagonalInches - Physical screen size the user entered
 */
export function calibrateFromDiagonal(diagonalInches: number): void {
  const w = window.screen.width;
  const h = window.screen.height;
  const diagonalPx = Math.sqrt(w * w + h * h);
  // Account for devicePixelRatio: CSS pixels vs physical pixels
  const dpi = (diagonalPx * window.devicePixelRatio) / diagonalInches;
  updateCalibration(dpi, "monitor", "medium");
}

/**
 * Method 3: Manual DPI entry.
 */
export function calibrateManual(dpi: number): void {
  if (dpi > 0 && dpi < 1000) {
    updateCalibration(dpi, "monitor", "medium");
  }
}

// ─── Reset ────────────────────────────────────────────────────────────────────

export function resetCalibration(): void {
  try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
  _state = { dpi: DEFAULT_DPI, method: "default", calibratedAt: new Date().toISOString(), confidence: "low" };
  applyDpi(DEFAULT_DPI);
  window.dispatchEvent(new CustomEvent("calibration:updated", { detail: { ..._state } }));
}

// ─── Public read ──────────────────────────────────────────────────────────────

export function getCalibrationState(): CalibrationState {
  return { ..._state };
}

// ─── Drag-to-calibrate helper ─────────────────────────────────────────────────

/**
 * Attach drag-resize behavior to a calibration guide element.
 * The user drags the right edge to match a known object.
 *
 * @param guideEl - The DOM element to make resizable
 * @param physicalWidthMm - Physical width of the reference object in mm
 * @param onUpdate - Callback fired on every drag update with current px width
 */
export function attachDragCalibration(
  guideEl: HTMLElement,
  physicalWidthMm: number,
  onUpdate?: (pxWidth: number) => void
): () => void {
  let startX = 0;
  let startWidth = 0;
  let isDragging = false;

  function onMouseDown(e: MouseEvent | TouchEvent): void {
    isDragging = true;
    startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    startWidth = guideEl.getBoundingClientRect().width;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  }

  function onMouseMove(e: MouseEvent | TouchEvent): void {
    if (!isDragging) return;
    const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = currentX - startX;
    const newWidth = Math.max(20, startWidth + delta);
    guideEl.style.width = `${newWidth}px`;
    onUpdate?.(newWidth);
  }

  function onMouseUp(): void {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    const finalWidth = guideEl.getBoundingClientRect().width;
    calibrateFromKnownObject(physicalWidthMm, finalWidth);
  }

  // Handle element — attach to the right edge grip
  const handle = guideEl.querySelector<HTMLElement>(".calibration-guide__handle");
  const target = handle ?? guideEl;

  target.addEventListener("mousedown", onMouseDown);
  target.addEventListener("touchstart", onMouseDown, { passive: false });
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("touchmove", onMouseMove, { passive: false });
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("touchend", onMouseUp);

  // Return cleanup function
  return () => {
    target.removeEventListener("mousedown", onMouseDown);
    target.removeEventListener("touchstart", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("touchend", onMouseUp);
  };
}

// ─── Expose CALIBRATION_REFS for use by CalibrationBar UI ─────────────────────
export { CALIBRATION_REFS };

// ─── Initialization ───────────────────────────────────────────────────────────
// Runs immediately when script is loaded.

(function init() {
  const saved = loadState();
  if (saved) {
    _state = saved;
    applyDpi(saved.dpi);
  } else {
    // Try auto-detect via devicePixelRatio as a rough heuristic
    // Most modern displays are 96 * devicePixelRatio DPI
    const estimatedDpi = 96 * (window.devicePixelRatio ?? 1);
    applyDpi(estimatedDpi);
    _state.dpi = estimatedDpi;
  }

  // Make state readable from CalibrationBar component scripts
  (window as any).__actualsize = {
    getState: getCalibrationState,
    calibrateFromKnownObject,
    calibrateFromDiagonal,
    calibrateManual,
    resetCalibration,
    attachDragCalibration,
    REFS: CALIBRATION_REFS,
  };
})();
