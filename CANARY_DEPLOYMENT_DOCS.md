# Canary Deployment Feature Documentation

## 📋 Overview

The Canary Deployment feature enables users to connect their Google Cloud Platform (GCP) accounts and deploy canary proxies for gradual rollout of new features. This feature is currently in **Beta** and under active development.

## 🏗️ Architecture

### Frontend Components
- **Main Page**: `/app/canary-deployment/page.tsx`
- **OAuth Callback**: `/app/canary-deployment/callback/page.tsx`
- **Sidebar Integration**: Updated to include canary deployment link

### Backend Endpoints
- `POST /gcp/auth/initiate` - Initiates OAuth flow
- `POST /gcp/auth/callback` - Handles OAuth callback
- `GET /gcp/projects` - Retrieves user's GCP projects
- `POST /gcp/projects/select` - Sets active project

## 🔐 Authentication Flow

### 1. OAuth Initiation
```typescript
// User clicks "Connect with Google Cloud"
const handleConnect = async () => {
  const data = await apiPost<GCPAuthInitiateResponse>('/gcp/auth/initiate', {
    userId: userId,
    redirectUri: `${window.location.origin}/canary-deployment/callback`
  });
  
  // Store state token and redirect to Google OAuth
  localStorage.setItem('gcp_state', data.state);
  window.location.href = data.authUrl;
};
```

### 2. OAuth Callback Processing
```typescript
// Callback page handles Google's response
const handleCallback = async () => {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const data = await apiPost<GCPAuthCallbackResponse>('/gcp/auth/callback', {
    code,
    state,
    userId: userId
  });
  
  if (data.success) {
    // Redirect to main page with success state
    router.push('/canary-deployment?connected=true&projectId=' + data.projectId);
  }
};
```

## 🎨 User Interface

### Connection State
When user is **not connected** to GCP:
- Beta notice warning
- "Connect with Google Cloud" button
- Loading states and error handling

### Connected State
When user is **connected** to GCP:
- Success indicator with checkmark
- Statistics dashboard (Total Projects, Active Projects, Selected Project)
- Interactive project grid
- Project selection functionality

### Project Cards
Each project card displays:
- **Project Name** with truncation
- **Project ID** in monospace font
- **Project Number** with building icon
- **Creation Date** formatted nicely
- **Lifecycle State** with color-coded badges
- **Active Status** indicator

## 📊 Data Models

### GCP Project Interface
```typescript
interface GCPProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
  isActive?: boolean;
}
```

### API Response Interfaces
```typescript
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

## 🔧 Technical Implementation

### State Management
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [userId, setUserId] = useState<string | null>(null);
const [isConnected, setIsConnected] = useState(false);
const [projects, setProjects] = useState<GCPProject[]>([]);
const [activeProject, setActiveProject] = useState<GCPProject | null>(null);
const [loadingProjects, setLoadingProjects] = useState(false);
```

### API Client Integration
Uses the existing `apiClient` pattern:
- Automatic Supabase authentication
- Consistent error handling
- Request/response logging
- Type safety with TypeScript

### User Authentication
Retrieves user ID from Supabase session:
```typescript
useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };
  getUser();
}, []);
```

## 🎯 Features

### ✅ Implemented
1. **GCP OAuth Integration** - Complete OAuth 2.0 flow
2. **Project Discovery** - Fetches and displays all user's GCP projects
3. **Project Selection** - Interactive project selection with visual feedback
4. **Statistics Dashboard** - Real-time project statistics
5. **Responsive Design** - Works on mobile, tablet, and desktop
6. **Loading States** - Beautiful loading indicators
7. **Error Handling** - User-friendly error messages
8. **Type Safety** - Full TypeScript implementation

### 🚧 In Development
1. **Canary Proxy Deployment** - Actual deployment functionality
2. **Deployment Monitoring** - Real-time deployment status
3. **Rollback Functionality** - Quick rollback capabilities
4. **Advanced Configuration** - Custom deployment settings

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Three column layout with full statistics

### Interactive Elements
- **Hover Effects**: Cards scale and show shadow on hover
- **Selection States**: Active project highlighted with blue ring
- **Loading Animations**: Smooth spinners and transitions
- **Color Coding**: Different colors for different states

## 🔒 Security Considerations

### OAuth Security
- **State Parameter**: CSRF protection with state token
- **HTTPS Only**: All OAuth redirects use HTTPS
- **Token Storage**: Secure token storage in database
- **Scope Limitation**: Minimal required scopes

### User Data Protection
- **User Validation**: Users can only access their own GCP connections
- **Token Encryption**: Refresh tokens stored encrypted
- **Session Management**: Proper session handling with Supabase

## 🧪 Testing

### Manual Testing Scenarios
1. **Happy Path**: Connect → OAuth → Success → Project Display
2. **Error Scenarios**: OAuth denied, network errors, invalid tokens
3. **Edge Cases**: Multiple projects, no projects, token refresh
4. **Responsive Testing**: Different screen sizes and devices

### Automated Testing (Planned)
- Unit tests for components
- Integration tests for API calls
- E2E tests for OAuth flow
- Accessibility tests

## 🚀 Deployment

### Environment Variables
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/canary-deployment/callback
```

### Database Schema
```sql
CREATE TABLE gcp_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    active_project_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📈 Performance

### Optimization Strategies
- **Lazy Loading**: Projects loaded on demand
- **Caching**: Project data cached locally
- **Debouncing**: Search and filter debounced
- **Virtual Scrolling**: For large project lists (future)

### Monitoring
- **API Response Times**: Track endpoint performance
- **OAuth Success Rates**: Monitor authentication success
- **User Engagement**: Track feature usage
- **Error Rates**: Monitor and alert on failures

## 🔄 Future Enhancements

### Phase 2 Features
1. **Multi-Environment Support** - Dev, staging, production
2. **Advanced Rollout Strategies** - Percentage-based, user-based
3. **Integration with CI/CD** - Automated deployments
4. **Real-time Monitoring** - Live deployment metrics
5. **Team Collaboration** - Shared project access

### Phase 3 Features
1. **Advanced Analytics** - Deployment performance insights
2. **Custom Rules Engine** - Sophisticated rollout rules
3. **API Management** - RESTful API for external tools
4. **Webhook Integration** - Event-driven deployments

## 🐛 Known Issues

### Current Limitations
1. **Beta Status**: Feature is in beta, use test projects only
2. **Single Project**: Only one active project per user
3. **Manual Deployment**: No automated deployment yet
4. **Limited Monitoring**: Basic status only

### Planned Fixes
1. **Multi-Project Support**: Allow multiple active projects
2. **Automated Deployments**: CI/CD integration
3. **Advanced Monitoring**: Real-time metrics and alerts
4. **Production Ready**: Remove beta restrictions

## 📞 Support

### Getting Help
- **Documentation**: This document and inline code comments
- **Error Messages**: User-friendly error descriptions
- **Logs**: Detailed logging for debugging
- **Beta Feedback**: Report issues during beta period

### Contact
- **Development Team**: For technical issues
- **Product Team**: For feature requests
- **Support Team**: For user assistance

---

## 📝 Changelog

### Version 1.0.0 (Beta) - Current
- ✅ Initial GCP OAuth integration
- ✅ Project discovery and display
- ✅ Interactive project selection
- ✅ Responsive UI design
- ✅ TypeScript implementation
- ✅ Error handling and loading states

### Version 1.1.0 (Planned)
- 🔄 Canary proxy deployment
- 🔄 Real-time monitoring
- 🔄 Rollback functionality
- 🔄 Advanced configuration

---

*Last updated: June 24, 2024*
*Status: Beta - Under Active Development* 