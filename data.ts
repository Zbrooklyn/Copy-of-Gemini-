import { Conversation, Persona, ChatItem, Label } from './types';

export const mockPersonas: Persona[] = [
    {
        id: 'persona-dev',
        name: 'Developer Dan',
        avatar: 'Terminal',
        description: 'Expert in software development, algorithms, and system design.',
        systemInstruction: 'You are a senior software engineer. Provide expert advice on code, architecture, and best practices. Use code examples where possible.'
    },
    {
        id: 'persona-therapist',
        name: 'Therapist Tia',
        avatar: 'BrainCircuit',
        description: 'A compassionate therapist providing a safe space for thoughts.',
        systemInstruction: 'You are a licensed therapist. Respond with empathy, active listening, and offer constructive coping mechanisms. Maintain a calm and supportive tone.'
    },
    {
        id: 'persona-chef',
        name: 'Chef Chloe',
        avatar: 'GraduationCap', // Using this icon as a placeholder for a chef hat
        description: 'A world-class chef who can help with recipes and cooking techniques.',
        systemInstruction: 'You are a professional chef. Provide delicious recipes, cooking tips, and advice on ingredients. Be enthusiastic and encouraging.'
    },
    {
        id: 'persona-friend',
        name: 'Friendly Fred',
        avatar: 'Bot',
        description: 'Just a friend to chat with about anything and everything.',
        systemInstruction: 'You are a friendly and casual conversational partner. Talk like a real person, use slang, and be curious about the user.'
    },
];

export const mockLabels: Label[] = [
    { id: '1', name: 'Work', color: '#3B82F6' },
    { id: '2', name: 'Personal', color: '#84CC16', apiKey: 'CUSTOM_KEY_*************' },
    { id: '3', name: 'Urgent', color: '#EF4444' },
];


export const mockConversations: Conversation[] = [
    { id: '1', title: 'Brainstorming new features', lastMessage: 'I love those ideas. The code snippet is a nice touch...', timestamp: '5m ago', unread: 3, avatar: 'bg-blue-500', pinned: true, starred: false, labels: ['Work'], cost: { total: '$0.12', promptTokens: 120, completionTokens: 240, totalTokens: 360 }, type: 'personal' },
    { id: '2', title: 'Q3 Marketing Strategy', lastMessage: 'We need to focus on social media engagement.', timestamp: '1h ago', unread: true, avatar: 'bg-green-500', pinned: true, starred: true, labels: ['Work', 'Urgent'], type: 'personal' },
    { id: '3', title: 'React component library', lastMessage: 'Awesome! I recommend using Storybook for component...', timestamp: '3h ago', unread: false, avatar: 'bg-purple-500', pinned: false, starred: true, labels: ['Work'], type: 'personal' },
    { id: '4', title: 'API Integration discussion', lastMessage: 'The authentication endpoint is ready for testing.', timestamp: 'Yesterday', unread: false, avatar: 'bg-yellow-500', pinned: false, starred: false, labels: ['Work'], type: 'personal' },
    { id: '5', title: 'Weekend trip planning', lastMessage: 'Wow, both look amazing! The lake sunset photo...', timestamp: 'Yesterday', unread: 1, avatar: 'bg-pink-500', pinned: false, starred: true, labels: ['Personal'], type: 'personal' },
    { id: '6', title: 'Grocery List', lastMessage: 'Milk, bread, eggs, and cheese.', timestamp: '2 days ago', unread: false, avatar: 'bg-indigo-500', pinned: false, starred: false, labels: ['Personal'], cost: { total: '$0.02', promptTokens: 25, completionTokens: 30, totalTokens: 55 }, type: 'personal' },
    { id: '7', title: 'Book club meeting', lastMessage: 'Next week\'s book is "Dune".', timestamp: '3 days ago', unread: false, avatar: 'bg-red-500', pinned: false, starred: false, labels: ['Personal', 'Fun', 'BookClub'], type: 'personal' },
    { id: '8', title: 'Old Project Files', lastMessage: 'Here are the assets from Q1 2023.', timestamp: '1 year ago', unread: false, avatar: 'bg-gray-500', pinned: false, starred: false, labels: ['Work'], archived: true, type: 'personal' },
    { id: '9', title: 'Vacation Photos', lastMessage: 'Sent you the link to the album.', timestamp: '8 months ago', unread: false, avatar: 'bg-teal-500', pinned: false, starred: true, labels: ['Personal'], archived: true, type: 'personal' },
];

export const mockMessages: { [key: string]: ChatItem[] } = {
    '1': [
        { id: 'd1', type: 'date-separator', content: 'Today' },
        { id: 'm1', role: 'user', content: 'Hey, can we brainstorm some new features for the app? I was thinking about adding a command palette.', timestamp: '10:00 AM' },
        { id: 'm2', role: 'model', content: 'A command palette is a great idea! It significantly improves accessibility and speed for power users. We could use a library like `cmdk` to build it. What kind of commands are you thinking of?', timestamp: '10:01 AM' },
        { id: 'm3', role: 'user', content: 'Good question. Maybe things like "New Chat", "Go to Settings", and searching for conversations.', timestamp: '10:02 AM' },
        {
            id: 'm4', role: 'model', content: `Excellent start. We can definitely implement those. Here's a quick code snippet to illustrate how simple the command palette structure could be:
\`\`\`tsx
import { Command } from 'cmdk';

const CommandPalette = () => (
  <Command.Root>
    <Command.Input />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>
      <Command.Group heading="Actions">
        <Command.Item>New Chat</Command.Item>
        <Command.Item>Go to Settings</Command.Item>
      </Command.Group>
      <Command.Group heading="Conversations">
        {/* Map conversations here */}
      </Command.Group>
    </Command.List>
  </Command.Root>
);
\`\`\`
I love those ideas. The code snippet is a nice touch...`, timestamp: '10:03 AM', pinned: true
        },
    ],
    '2': [
        { id: 'd2', type: 'date-separator', content: 'Yesterday' },
        { id: 'm5', role: 'user', content: 'What should our main focus be for the Q3 marketing strategy?', timestamp: '9:30 AM' },
        { id: 'm6', role: 'model', content: 'We need to focus on social media engagement. Let\'s create a content calendar and increase our posting frequency on Twitter and LinkedIn.', timestamp: '9:32 AM' },
    ],
    '3': [
        { id: 'd3', type: 'date-separator', content: 'June 18, 2024' },
        { id: 'm7', role: 'user', content: 'I\'m starting work on the new React component library. Any tips?', timestamp: '2:00 PM' },
        { id: 'm8', role: 'model', content: `Awesome! I recommend using Storybook for component development and testing. It helps isolate components and document their states.

Here are a few key things to consider:
*   **Component API:** Design your props to be clear and consistent.
*   **Styling:** Decide on a styling solution. Styled-components, Tailwind CSS, and CSS Modules are all great options.
*   **Accessibility (a11y):** Build with accessibility in mind from the start.

Here’s a comparison of styling options:

| Option             | Pros                               | Cons                               |
|--------------------|------------------------------------|------------------------------------|
| **Tailwind CSS**   | Rapid prototyping, utility-first   | Can lead to long class lists       |
| **Styled-components**| Scoped styles, JavaScript-in-CSS   | Can have a slight runtime overhead |
| **CSS Modules**    | Scoped selectors, standard CSS     | Requires a build step              |

To get you started, here's a basic structure for an accessible Button component:

\`\`\`tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  ...props
}) => {
  const baseClasses = "px-4 py-2 font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  };

  return (
    <button className={\`\${baseClasses} \${variantClasses[variant]}\`} {...props}>
      {children}
    </button>
  );
};
\`\`\`
This gives you a solid foundation. Let me know which part you want to dive into first!`, timestamp: '2:05 PM' },
    ],
    '5': [
        { id: 'd4', type: 'date-separator', content: 'June 18, 2024' },
        { id: 'm9', role: 'user', content: 'Planning a weekend trip. Any suggestions?', timestamp: '11:00 AM' },
        { id: 'm10', role: 'model', content: 'How about we go hiking on Saturday? There are some great trails about an hour away.', timestamp: '11:05 AM' },
        {
            id: 'm11',
            role: 'user',
            content: 'Good idea! I found a couple of cool spots. What do you think of these?',
            timestamp: '11:10 AM',
            attachments: [
                { name: 'mountain-view.jpg', size: 1200000, type: 'image/jpeg', url: 'https://placehold.co/600x400/2E3440/E5E9F0?text=Mountain+View' },
                { name: 'lake-sunset.jpg', size: 980000, type: 'image/jpeg', url: 'https://placehold.co/600x400/4C566A/E5E9F0?text=Lake+Sunset' },
            ]
        },
        {
            id: 'm12',
            role: 'model',
            content: 'Wow, both look amazing! The lake sunset photo is especially beautiful. Let\'s go there!',
            timestamp: '11:12 AM',
        }
    ],
};