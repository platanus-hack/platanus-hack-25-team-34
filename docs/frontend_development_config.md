# Frontend Development Configuration

## Environment Variables

The frontend uses Vite environment variables (prefixed with `VITE_`).

### Available Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_URL` | string | `http://localhost:8000/api/v1` | Backend API base URL |
| `VITE_LOCAL_DEVELOPMENT` | boolean | `true` | Bypass authentication for local development |

### Configuration Files

- **`.env`** - Active environment variables (gitignored)
- **`.env.example`** - Template with all available variables

## Local Development Mode

### What is it?

When `VITE_LOCAL_DEVELOPMENT=true`, the app bypasses authentication to make development and testing easier.

### Features in Local Development Mode

✅ **Auto-authentication**: Automatically logs in with a mock user  
✅ **Skip login screen**: Direct access to all protected routes  
✅ **Mock user data**: Uses predefined dev user (1M CLP balance)  
✅ **Console indicator**: Shows "🔧 LOCAL_DEVELOPMENT mode" message  

### Usage

#### Enable Local Development Mode

```bash
# In frontend/.env
VITE_LOCAL_DEVELOPMENT=true
```

Then restart the dev server:

```bash
docker-compose restart frontend
# or
cd frontend && npm run dev
```

#### Disable Local Development Mode

```bash
# In frontend/.env
VITE_LOCAL_DEVELOPMENT=false
# or remove the line entirely
```

### When to Use

**Use LOCAL_DEVELOPMENT=true when:**
- Developing new features
- Testing UI components
- Working on styling/design
- Debugging frontend issues
- Running quick demos

**Use LOCAL_DEVELOPMENT=false when:**
- Testing authentication flow
- Testing protected routes
- Production builds
- User acceptance testing
- Final integration testing

## Mock User Data (Local Development)

When `VITE_LOCAL_DEVELOPMENT=true`, you're automatically logged in as:

```typescript
{
  id: 1,
  name: 'Dev User (Local)',
  balance_clp: 1000000
}
```

This user:
- Has 1,000,000 CLP balance
- Can invest in any tracker
- Portfolio data persists in backend (using user_id: 1)

## Implementation Details

### AuthContext Changes

The `AuthContext` now:

1. **Checks environment variable** on initialization
2. **Auto-authenticates** if `VITE_LOCAL_DEVELOPMENT=true`
3. **Exposes `isLocalDevelopment` flag** for conditional logic
4. **Logs to console** when in local dev mode

### Protected Routes

The `ProtectedRoute` component now:

1. **Checks `isLocalDevelopment` first**
2. **Bypasses auth check** if in local dev mode
3. **Falls back to normal auth** otherwise

### Code Example

```tsx
// In AuthContext.tsx
const isLocalDevelopment = import.meta.env.VITE_LOCAL_DEVELOPMENT === 'true';

if (isLocalDevelopment) {
  setUser(mockDevUser);
  console.log('🔧 LOCAL_DEVELOPMENT mode: Auto-authenticated');
}

// In App.tsx
const ProtectedRoute = ({ children }) => {
  const { isLocalDevelopment, isAuthenticated } = useAuth();
  
  if (isLocalDevelopment) {
    return <>{children}</>;  // Allow access
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};
```

## Testing Different Modes

### Test Local Development Mode

1. Set `VITE_LOCAL_DEVELOPMENT=true`
2. Restart frontend
3. Navigate directly to any route:
   - http://localhost:5173/marketplace
   - http://localhost:5173/dashboard
   - http://localhost:5173/tracker/1
4. Should see content without login screen
5. Check console for "🔧 LOCAL_DEVELOPMENT mode" message

### Test Normal Authentication Mode

1. Set `VITE_LOCAL_DEVELOPMENT=false`
2. Restart frontend
3. Navigate to http://localhost:5173
4. Should redirect to `/login`
5. Must select user to access protected routes

## Production Deployment

⚠️ **IMPORTANT**: Always set `VITE_LOCAL_DEVELOPMENT=false` (or remove it) in production!

### Production Checklist

- [ ] Set `VITE_LOCAL_DEVELOPMENT=false` in production `.env`
- [ ] Verify authentication works
- [ ] Test protected routes redirect to login
- [ ] Ensure no console logs about dev mode
- [ ] Update `VITE_API_URL` to production backend URL

### Docker Production Build

```dockerfile
# In Dockerfile, ensure production env
ENV VITE_LOCAL_DEVELOPMENT=false
ENV VITE_API_URL=https://api.hedgie.app/api/v1
```

## Troubleshooting

### Issue: Still showing login screen in local dev mode

**Solution**: 
1. Check `.env` file has `VITE_LOCAL_DEVELOPMENT=true`
2. Restart dev server completely
3. Check browser console for the "🔧 LOCAL_DEVELOPMENT mode" message
4. Clear localStorage and refresh

### Issue: Can't test authentication flow

**Solution**: Set `VITE_LOCAL_DEVELOPMENT=false` and restart

### Issue: Environment variable not updating

**Solution**: 
- Vite caches env vars at build time
- Must restart dev server (`Ctrl+C` then `npm run dev`)
- For Docker: `docker-compose restart frontend`

### Issue: Works locally but not in Docker

**Solution**: 
- Check `.env` is copied to container
- Verify Dockerfile doesn't override `VITE_LOCAL_DEVELOPMENT`
- Rebuild image: `docker-compose build frontend`

## Best Practices

### Development Workflow

1. **Start with LOCAL_DEVELOPMENT=true** for initial development
2. **Switch to false** when testing auth-related features
3. **Use true** for rapid iteration and UI work
4. **Use false** before committing to test complete flows

### Team Collaboration

- Keep `.env.example` updated with latest variables
- Document any new environment variables here
- Communicate when adding new env-dependent features
- Default to `true` for local dev, `false` for production

### Security

- Never commit `.env` file (already in `.gitignore`)
- Never expose `VITE_LOCAL_DEVELOPMENT=true` in production
- Use environment-specific configs for different deployments
- Review environment variables before each deployment

## Related Files

- `/frontend/.env` - Your local environment config
- `/frontend/.env.example` - Template for environment variables
- `/frontend/src/context/AuthContext.tsx` - Auth implementation
- `/frontend/src/App.tsx` - Protected route logic
- `/docs/track4_frontend.md` - Frontend architecture docs

## Future Enhancements

Potential improvements to the dev mode:

- [ ] Different mock users (via env variable)
- [ ] Configurable mock balance
- [ ] Dev mode indicator in UI
- [ ] Quick user switcher in dev mode
- [ ] Feature flags system
- [ ] Environment-specific API mocking
