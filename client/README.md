# MediVerify - AI Provider Validation Platform

Beautiful, modern UI for automated healthcare provider data validation with AI agents.

## ✨ Features

### 🎨 Beautiful Design
- **Gradient Accents**: Cyan → Blue → Purple color palette
- **Smooth Animations**: Framer Motion powered transitions
- **Glassmorphism Effects**: Modern translucent UI elements
- **Custom Fonts**: Inter font family throughout
- **Responsive Layout**: Adapts to all screen sizes

### 💬 Chat Interface
- **Real-time Messages**: Dynamic chat bubbles with user/AI distinction
- **Typing Indicators**: Shimmer animation while processing
- **Message History**: Scrollable conversation view
- **Quick Actions**: One-click validation tasks
- **Example Prompts**: Pre-built use cases

### 📊 Results Panel
- **Slide-in Animation**: Smooth right panel with spring physics
- **Live Progress**: Animated progress bars for each provider
- **Confidence Scores**: Visual scoring with gradient indicators
- **Status Badges**: Color-coded validation states
- **Real-time Updates**: Dynamic data display

### 🔄 Validation Flow
- **Interactive Diagram**: React Flow powered pipeline visualization
- **Custom Nodes**: Animated status indicators and progress bars
- **Agent States**: Active, Completed, Pending with distinct styling
- **Tab Navigation**: Switch between Flow and Results views
- **Smooth Transitions**: Page transitions with Framer Motion

## 🎯 Key Components

### Home Page (`/`)
- Centered hero section with gradient branding
- Chat-style interface with message bubbles
- Quick action buttons with gradients
- Example use cases grid
- Input area with file upload
- Animated status indicator
- Right-side results panel (slides in on demand)

### Validation Flow (`/flow`)
- Tab-based interface (Flow / Results)
- Interactive node diagram with 6 agent stages
- Real-time progress tracking
- Animated connections between nodes
- Results dashboard with provider cards
- Confidence score visualizations

### Sidebar
- Minimal 80px width design
- Gradient logo with rotation animation
- Active state with gradient background
- Smooth hover effects
- Notification badges on icons

## 🎨 Design System

### Colors
- **Primary**: Cyan-600 (#0891b2)
- **Secondary**: Blue-600 (#2563eb)
- **Accent**: Purple-600 (#9333ea)
- **Success**: Emerald-600 (#059669)
- **Warning**: Amber-600 (#d97706)
- **Error**: Rose-600 (#dc2626)

### Gradients
- **Brand**: `from-cyan-600 via-blue-600 to-purple-600`
- **Button**: `from-cyan-600 to-blue-600`
- **Success**: `from-emerald-600 to-teal-600`

### Animations
- **Shimmer**: Loading state animation
- **Float**: Subtle floating effect
- **Spring**: Physics-based transitions
- **Scale**: Hover scale transformations
- **Slide**: Panel slide-in animations

## 🛠 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **React Flow** - Interactive diagrams
- **React Router** - Navigation
- **React Icons** - Icon library
- **Radix UI** - Accessible components

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5174`

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.tsx       # Main layout wrapper
│   └── Sidebar.tsx      # Navigation sidebar
├── pages/
│   ├── Home.tsx         # Chat interface with results panel
│   └── ValidationFlow.tsx # Flow diagram and dashboard
├── types/              # TypeScript interfaces
├── data/               # Mock data
└── index.css          # Global styles & animations
```

## 🎭 Animations

### Message Animations
- Fade in with slide up
- Scale from 0.95 to 1
- Exit with fade out

### Panel Animations
- Slide from right (x: 400)
- Spring physics (damping: 25, stiffness: 200)
- Smooth backdrop blur

### Node Animations
- Initial scale: 0.8
- Hover scale: 1.05
- Hover lift: y: -5
- Rotation on active state

### Button Animations
- Hover scale: 1.05
- Tap scale: 0.95
- Gradient background shift

## 💡 Features in Action

### Chat Flow
1. User types message → Gradient input border
2. Submit → Message appears with slide animation
3. AI processes → Shimmer loading bubble
4. Response → AI bubble with gradient background
5. Results → Right panel slides in with provider cards

### Validation Flow
1. Navigate to flow → Tab transition
2. View diagram → Animated nodes appear
3. Active agents → Rotating icons + progress bars
4. Switch to results → Smooth tab transition
5. Provider cards → Staggered appearance

## 🎨 Custom CSS Classes

- `.gradient-text` - Text with gradient effect
- `.chat-bubble` - User message style
- `.chat-bubble-ai` - AI message style
- `.btn-primary` - Primary action button
- `.stat-card` - Statistic display card
- `.animate-shimmer` - Loading shimmer
- `.scrollbar-thin` - Custom scrollbar

## 🔥 Performance

- Code splitting with React lazy loading
- Optimized animations with GPU acceleration
- Efficient re-renders with React.memo
- Smooth 60fps animations
- Minimal bundle size

---

Built with ❤️ for EY Hackathon
