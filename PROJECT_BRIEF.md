# Project Brief: Gemini Polished Client

## 1) Product summary

A feature-complete, privacy-first, single-page web application client for Google's Gemini models. The default view is a dense Conversation List, inspired by Telegram, with WhatsApp-style filter pills for organization. Tapping a conversation navigates to a Conversation View designed for rich interaction. The application is fully responsive, featuring a two-pane layout on larger screens and a single-column layout on mobile, and is designed to be installable as a Progressive Web App (PWA).


---

## 2) UX foundations

Home first: The landing page is the Conversation List. On desktop/tablet (≥ md), the app shows a two-pane layout (list + chat). On smaller screens, the app navigates from the list to the chat view.

Tap, not swipes:
- Row actions (pin/archive/label) are handled via a hover + “…” button on desktop and a long-press on mobile.
- Multi-select is enabled via a dedicated header button, which reveals checkboxes on each row.
- Actions are displayed in a popover menu on desktop and a bottom sheet on mobile.

Compact density: Rows are information-dense, showing an avatar, title, message snippet, timestamp, unread count, labels, and an optional cost chip.

Filter pills: A horizontally scrollable bar of filter pills allows for quick sorting.

**Command Palette (`Cmd+K`):** A global command palette provides a keyboard-centric way for power users to perform actions like searching conversations, creating new chats, navigating to settings, and more.

**Draggable Organization:** Users can drag a conversation from the list and drop it onto a label filter pill to instantly apply that label, offering a tactile and efficient organization method.

**No Bottom Navigation Bar:** Until permission is given, do not use a bottom navigation bar for any purpose.


---

## 3) IA & navigation

- **Conversation List (Home):** The main view showing all personal, group, and 1-on-1 persona conversations.
- **Personas View:** A directory of pre-configured AI personas (e.g., experts, characters) that users can interact with. This view is accessible from the main settings page.
- **Enhanced Search View:** When search is initiated, the list view transforms into a dedicated results view, showing specific message matches across all conversations.
- **Conversation View:** The main chat interface for a selected conversation.
- **Settings:** A dedicated view for application settings, broken into sub-sections.
  - General Settings & Appearance
  - Advanced Settings
  - Manage Labels


---

## 4) Conversation List (Home)

Header bar:
- App title. When archived conversations are visible, a small "Incl. Archived" badge appears next to the title.
- Controls: A functional search input (which activates the Enhanced Search View), a "Multi-select" toggle button, and a "Show Archived" toggle button.
- "New Chat" button (appears as a header button on desktop).
- Settings Icon: Navigates to the Settings view.

Quick Settings Popover:
- Triggered by the Settings icon in the header.
- **Theme Control:** Allows instant switching between Light, Dark (gray), and OLED (black) themes.
- **Density Control:** Toggles between Regular and Condensed conversation list views.
- **Line Control:** Switches conversation rows between a 2-line and a 3-line layout for varying information density.

Filter pills (scrollable):
- Layout: A sticky "All" pill remains visible while other pills scroll horizontally.
- Presets: All, Unread, Pinned, Starred.
- Default Labels: The system includes "Work" and "Personal" as filterable labels.
- Multi-select mode: Users can click multiple pills to combine filters (e.g., "Unread" AND "Work").

Row layout (dense):
- Avatar/initials, Title, last message snippet, Timestamp (relative), Unread count (numeric badge), Label chip(s) (1 visible + “+N”), optional cost chip.
- States: pinned, archived (indicated when "Show Archived" is on), unread emphasis.
- Layout options: Supports 2-line (default) and 3-line (variants).

Row actions:
- A "..." button on hover opens a popover menu with actions for: Pin/Unpin, Star/Unstar, Archive, Labels, Duplicate, Export, and Delete.

Bulk actions (Multi-select mode):
- Activation: Toggled via a header button.
- UI: Checkboxes appear next to each row. A contextual footer bar appears at the bottom.
- Actions: The footer provides bulk actions for Archive, Label, and Delete.

Performance:
- Visual skeleton loaders are displayed during the initial data fetch simulation.
- The list should be virtualized to handle thousands of conversations smoothly.


---

## 5) Personas & Group Chats

- **Persona Directory:** A dedicated view ("Personas") lists available pre-configured AI personas, each with a name, description, and avatar.
- **Personas as Contacts:** Personas are presented as first-class contacts, encouraging users to view them as readily accessible conversational partners rather than configurable settings. They are the primary focus of the "New Chat" flow.
- **1-on-1 Persona Chats:** Users can initiate a direct, one-on-one conversation with any persona from the directory. These chats appear in the main conversation list, distinguished by the persona's avatar and name.
- **Group Chat Creation:** Users can create group chats, giving them a custom title and selecting multiple personas from the directory to add as participants.
- **Group Chat Interaction:** In a group chat, messages from the AI are clearly attributed to the specific persona that is "speaking", allowing for multi-expert conversations.


---

## 6) Conversation View

- **Message Display:** A virtualized, scrollable list of messages, supporting markdown, code blocks, images, and other rich content.
- **In-line Replies:** Users can reply to specific messages. Replies are displayed with a quoted context of the original message, which can be clicked to navigate to the source.
- **Message Actions:** Each message bubble will have actions on hover/long-press (e.g., copy, edit, reply, regenerate, delete).
- **Input Bar:** A rich text input bar with controls for attaching files, using the microphone for speech-to-text, and sending the message.
- **Streaming Responses:** The UI must gracefully handle and display streaming text responses from the API.
- **Text-to-Speech (TTS):** The app supports Text-to-Speech for model responses, which can be enabled in the settings panel. When enabled, the model's final, complete response will be read aloud using the browser's built-in speech synthesis capabilities.
- **Slash Commands:** The input bar supports slash commands for quick actions. For example, typing `/image` will automatically switch the active model to an image generation model, streamlining the workflow for creating visual content.


---

## 7) Label system

- **Presets:** All, Unread, Pinned, Starred. These are core filters that cannot be edited.
- **Custom Labels:** Users can create, edit, color-code, and delete their own labels via the "Manage Labels" settings screen. These labels will appear as filter pills in the Conversation List.


---

## 8) Web-app mobile optimization

- The layout is fully responsive, collapsing to a single-column view on smaller screens.
- A Floating ActionButton (FAB) for "New Chat" is displayed on mobile for easy access.
- The app supports touch gestures for scrolling and actions (e.g., long-press).
- **Collapsible Header:** Secondary header elements (search, filters) hide on scroll-down to maximize screen space and reappear on scroll-up.


---

## 9) Accessibility

- The application will be built with accessibility as a priority, including semantic HTML, ARIA roles, full keyboard navigation support, and sufficient color contrast.


---

## 10) Backend & API Integration

- **Gemini API:** The app will connect to the Google Gemini API for all conversational AI functionality.
- **Streaming:** The app will use streaming endpoints to display responses as they are generated.
- **Error Handling:** Robust error handling will be implemented for API failures, with clear feedback to the user.


---

## 11) PWA & Offline Support

- **Service Worker:** The app will use a service worker for caching and offline capabilities.
- **Offline Viewing:** Users should be able to view their conversation history while offline.
- **Installable:** The app will be installable on desktop and mobile devices via the browser's "Add to Home Screen" functionality.


---

## 12) Customization

- **Advanced Theme Editor:** A section within the settings allows users to customize core UI colors, such as the accent color and message bubble colors, using color pickers. These changes are applied globally in real-time.


---

## 13) QA matrix (web)

- Browsers: iOS Safari, Android Chrome, Chrome, Edge, Firefox, Samsung Internet.
- States: offline/online, throttled 3G, low-memory Android.
- Install as PWA flows; permissions (mic, notifications).
- Keyboard (iOS resize) and safe-area correctness.


---

## 14) Acceptance criteria (high level)

- The application connects to the Gemini API and can send/receive messages.
- The Conversation List is fully functional with filtering, search, and bulk actions.
- The Conversation View can render streaming responses and supports rich message types.
- Users can create and manage their own custom labels.
- The application is fully responsive and works well on both mobile and desktop.
- The application is installable as a PWA and provides offline access to conversations.