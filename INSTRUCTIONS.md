# Engineering & Design Instructions

This document outlines the specific preferences, design decisions, and development principles we have established for this project. These instructions should be followed to ensure consistency and adherence to the user's vision.

## 1. Project Brief Management

- **The Brief is the "Source of Truth":** The `PROJECT_BRIEF.md` file is the central repository for the project's vision. It should contain both features that are already implemented and features that are planned for the future.
- **Do Not Remove Features:** Under no circumstances should any feature be removed from the project brief without explicit permission from the user. The brief should remain a complete vision document.
- **Evolve the Brief with New Features:** When a new feature is requested and implemented, the project brief must be updated to include it.
- **Proactive Feature Merging:** When implementing a new feature, analyze if it can be merged with, or provides a better alternative for, any existing but unimplemented features in the brief. Propose these integrations to the user for discussion.

## 2. UI/UX Principles & Patterns

### Conversation List Filtering
- **Multi-Select is Standard:** Filter pills support multi-select by default. Users can simply click multiple pills to combine them. A separate "multi-select mode" is not needed for this feature.
- **"All" Pill is Sticky:** The "All" filter pill must always be visible, acting as a fixed "home" or reset button. The other filter pills should scroll horizontally next to it.
- **No Item Counts on Pills:** Filter pills should display only their label for a cleaner, less cluttered appearance. Do not add item counts to them.

### Handling Archived Conversations
- **Global Toggle, Not a Filter:** The visibility of archived conversations is controlled by a global toggle button in the header, not by a filter pill in the scrollable list.
- **Combined Filtering:** When the "Show Archived" toggle is enabled, archived conversations are mixed into the main list. All other active filters (e.g., "Work," "Unread") should apply to this combined list of active and archived items.
- **Clear Visual State:** The UI must provide a clear, persistent indicator (e.g., a badge in the header) when archived conversations are being included in the list.

### Layout & Sizing
- **Edge-to-Edge Layout:**
    - **Mobile:** The conversation list should provide a true edge-to-edge experience, spanning the full width of the screen.
    - **Desktop/Tablet:** In the two-pane layout, the conversation list should still be edge-to-edge *within its own column*. It should fill its allocated pane completely, without any internal horizontal margins or padding that would detach it from the screen edges or the central divider.
- **Collapsible Header on Scroll:** To maximize content visibility on smaller screens, secondary header elements (like search and filter bars) should gracefully hide when the user scrolls down a list and reappear when they scroll up.

### Hover & Action Controls
- **Discoverable Hover Actions:** Row action buttons (like 'more options') should be discoverable without cluttering the UI. Instead of being completely hidden, they should be subtly visible by default (e.g., `opacity-25`) and become fully opaque on hover.
- **Use Absolute Positioning:** These hover-activated controls should be positioned absolutely relative to their parent container. This prevents them from affecting the layout of other row content and avoids unwanted margin or spacing effects.

### Platform-Specific Interactions
- **Desktop (Mouse):** Actions on list items should be accessible via two standard methods: (1) a hover-to-reveal 'more options' button and (2) a right-click context menu on the entire item. This provides both discoverability and power-user efficiency.
- **Mobile (Touch):** The primary method for accessing item actions should be a long-press gesture. This is the intuitive and expected pattern on touch devices.
- **'More Options' Button Visibility:** To maintain a clean aesthetic, the three-dot 'more options' button should be hidden on mobile viewports. On desktop viewports (`md` and larger), it should remain visible on hover to ensure action discoverability for mouse users.

### Viewport-Aware Positioning
- **Intelligent Popovers:** Context menus and popovers must be intelligent. They should detect the edges of the viewport and automatically reposition themselves to ensure they are always fully visible to the user, preventing content from being cut off.

## 3. General Working Principles

- **Prioritize Direct Interaction:** Favor clear, direct UI patterns over hidden modes or gestures (e.g., click to multi-select filters vs. long-press to enter a mode).
- **Maintain a Clean UI:** Avoid cluttering primary UI surfaces like the filter bar. Complex or global state controls (like showing archives) are better placed in a less prominent but still accessible location like the header bar.