# Canary Deployment Components

This directory contains modular React components for the canary deployment feature. Each component is designed to be reusable, maintainable, and follows a consistent design pattern.

## 📁 Component Structure

```
components/canary-deployment/
├── README.md                 # This documentation
├── index.ts                  # Barrel exports for all components
├── types.ts                  # Shared TypeScript interfaces
├── BetaNotice.tsx           # Beta warning component
├── ConnectionCard.tsx       # GCP connection interface
├── StatisticsDashboard.tsx  # Project statistics display
├── ProjectCard.tsx          # Individual project card
├── ProjectsGrid.tsx         # Grid layout for projects
├── DeployAction.tsx         # Deployment action section
├── ConnectedHeader.tsx      # Header for connected state
├── DisconnectedHeader.tsx   # Header for disconnected state
├── ErrorMessage.tsx         # Error display component
└── LoadingSpinner.tsx       # Loading state component
```

## 🧩 Components Overview

### Core Components

#### `BetaNotice`
- **Purpose**: Displays beta warning message
- **Props**: `className` (optional)
- **Usage**: Used at the top of both connected and disconnected states

#### `ConnectionCard`
- **Purpose**: GCP connection interface with connect button
- **Props**: `loading`, `onConnect`
- **Usage**: Main interface when user is not connected to GCP

#### `StatisticsDashboard`
- **Purpose**: Displays project statistics in a grid layout
- **Props**: `projects`, `activeProject`
- **Usage**: Shows total projects, active projects, and selected project

#### `ProjectsGrid`
- **Purpose**: Grid layout for displaying GCP projects
- **Props**: `projects`, `activeProject`, `onProjectSelect`
- **Usage**: Renders a responsive grid of project cards

#### `ProjectCard`
- **Purpose**: Individual project display card
- **Props**: `project`, `isActive`, `onSelect`
- **Usage**: Displays project details with interactive selection

#### `DeployAction`
- **Purpose**: Deployment action section
- **Props**: `activeProject`, `onDeploy` (optional)
- **Usage**: Shows deployment button when project is selected

### Header Components

#### `ConnectedHeader`
- **Purpose**: Header for connected state
- **Props**: None
- **Usage**: Shows success message with checkmark icon

#### `DisconnectedHeader`
- **Purpose**: Header for disconnected state
- **Props**: None
- **Usage**: Shows connection prompt message

### Utility Components

#### `ErrorMessage`
- **Purpose**: Displays error messages
- **Props**: `error`, `className` (optional)
- **Usage**: Shows user-friendly error messages

#### `LoadingSpinner`
- **Purpose**: Loading state display
- **Props**: `message` (optional), `className` (optional)
- **Usage**: Shows loading spinner with custom message

## 📊 Data Types

All components use shared TypeScript interfaces defined in `types.ts`:

```typescript
interface GCPProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
  isActive?: boolean;
}

interface GCPAuthInitiateResponse {
  authUrl: string;
  state: string;
  expiresAt: string;
}

interface GCPAuthCallbackResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  projectId?: string;
}

interface GCPProjectsResponse {
  projects: GCPProject[];
  activeProject?: GCPProject;
}
```

## 🎨 Design System

### Color Scheme
- **Blue**: Primary actions, statistics
- **Green**: Success states, active projects
- **Purple**: Selected items, highlights
- **Yellow**: Beta notices, warnings
- **Red**: Errors, destructive actions

### Responsive Design
- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Three column layout

### Interactive Elements
- **Hover Effects**: Scale and shadow on cards
- **Selection States**: Blue ring for active items
- **Loading States**: Spinner animations
- **Transitions**: Smooth 200ms transitions

## 🔧 Usage Examples

### Basic Import
```typescript
import { BetaNotice, ConnectionCard, StatisticsDashboard } from '@/components/canary-deployment';
```

### Component Usage
```typescript
// Beta notice
<BetaNotice />

// Connection card
<ConnectionCard loading={loading} onConnect={handleConnect} />

// Statistics dashboard
<StatisticsDashboard projects={projects} activeProject={activeProject} />

// Projects grid
<ProjectsGrid 
  projects={projects} 
  activeProject={activeProject} 
  onProjectSelect={handleProjectSelect} 
/>
```

## 🧪 Testing

Each component should have:
- Unit tests for props and interactions
- Integration tests for API calls
- Accessibility tests for screen readers
- Responsive design tests

## 🔄 State Management

Components use local state with props for:
- **Loading states**: Managed by parent component
- **Error handling**: Centralized error display
- **User interactions**: Callback functions passed as props
- **Data flow**: Props down, events up pattern

## 🚀 Performance

### Optimization Strategies
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For large project lists (future)
- **Image Optimization**: Proper image sizing and formats

### Bundle Size
- **Tree Shaking**: Only import used components
- **Code Splitting**: Lazy load non-critical components
- **Minification**: Production builds optimized

## 🔒 Accessibility

### ARIA Labels
- Proper labels for interactive elements
- Screen reader friendly descriptions
- Keyboard navigation support

### Color Contrast
- WCAG AA compliant color ratios
- High contrast mode support
- Color-blind friendly design

## 📱 Mobile Support

### Touch Interactions
- Proper touch targets (44px minimum)
- Swipe gestures for navigation
- Mobile-optimized layouts

### Performance
- Optimized for mobile networks
- Reduced bundle size for mobile
- Touch-friendly interactions

## 🔧 Customization

### Theming
- CSS custom properties for colors
- Configurable spacing and typography
- Dark mode support (future)

### Styling
- Tailwind CSS classes
- Consistent design tokens
- Responsive breakpoints

## 📈 Future Enhancements

### Planned Features
- **Dark Mode**: Complete dark theme support
- **Animations**: Advanced micro-interactions
- **Accessibility**: Enhanced screen reader support
- **Performance**: Virtual scrolling for large lists
- **Testing**: Comprehensive test coverage

### Component Extensions
- **Advanced Filters**: Project filtering and search
- **Sorting Options**: Multiple sort criteria
- **Bulk Actions**: Multi-select operations
- **Export Features**: Data export functionality

---

*Last updated: June 24, 2024*
*Component Version: 1.0.0* 