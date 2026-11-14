// Pure viewport-placement math for floating menus (profile dropdown, etc.).
// Kept dependency-free so the geometry can be unit-tested without a browser.

export type MenuTriggerRect = {
  top: number;
  bottom: number;
  right: number;
};

export type MenuViewport = {
  width: number;
  height: number;
};

export type MenuPlacement = {
  openUp: boolean;
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

export const MENU_WIDTH = 288; // matches w-72
export const VIEWPORT_MARGIN = 8;
export const MENU_GAP = 8;
// Flip upward only when the space below cannot fit a usable menu and more space exists above.
export const MIN_COMFORTABLE_SPACE = 320;

export function computeMenuPlacement(trigger: MenuTriggerRect, viewport: MenuViewport): MenuPlacement {
  const spaceBelow = viewport.height - trigger.bottom - VIEWPORT_MARGIN;
  const spaceAbove = trigger.top - VIEWPORT_MARGIN;
  const openUp = spaceBelow < MIN_COMFORTABLE_SPACE && spaceAbove > spaceBelow;
  // Never exceed the available space: the menu scrolls internally instead of
  // leaving the viewport, so every option stays reachable.
  const maxHeight = Math.max(openUp ? spaceAbove : spaceBelow, 0);
  const width = Math.min(MENU_WIDTH, viewport.width - VIEWPORT_MARGIN * 2);
  const left = Math.max(VIEWPORT_MARGIN, Math.min(trigger.right - width, viewport.width - width - VIEWPORT_MARGIN));
  return openUp
    ? { openUp, left, width, maxHeight, bottom: viewport.height - trigger.top + MENU_GAP }
    : { openUp, left, width, maxHeight, top: trigger.bottom + MENU_GAP };
}
