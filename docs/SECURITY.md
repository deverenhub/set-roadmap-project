# Security Documentation

Security architecture and best practices for the SET Interactive Roadmap Platform.

## 📋 Table of Contents

- [Security Overview](#security-overview)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Infrastructure Security](#infrastructure-security)
- [Audit Logging](#audit-logging)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

---

## Security Overview

### Security Principles

1. **Zero Trust** - Verify every request, trust no one by default
2. **Defense in Depth** - Multiple layers of security controls
3. **Least Privilege** - Users get minimum necessary permissions
4. **Secure by Default** - Security enabled out of the box

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    HTTPS/TLS 1.3                        │  ← Transport
├─────────────────────────────────────────────────────────┤
│                   JWT Authentication                     │  ← Identity
├─────────────────────────────────────────────────────────┤
│                 Row Level Security (RLS)                 │  ← Authorization
├─────────────────────────────────────────────────────────┤
│                  Input Validation                        │  ← Data Integrity
├─────────────────────────────────────────────────────────┤
│                   Audit Logging                          │  ← Accountability
└─────────────────────────────────────────────────────────┘
```

---

## Authentication

### Authentication Flow

```
User                    App                     Supabase Auth
  │                      │                           │
  │  Email + Password    │                           │
  │─────────────────────▶│                           │
  │                      │    signInWithPassword()   │
  │                      │──────────────────────────▶│
  │                      │                           │
  │                      │    Verify credentials     │
  │                      │◀──────────────────────────│
  │                      │                           │
  │                      │    JWT + Refresh Token    │
  │  Session cookie      │◀──────────────────────────│
  │◀─────────────────────│                           │
  │                      │                           │
  │  Authenticated!      │                           │
```

### Supported Authentication Methods

| Method | Security Level | Use Case |
|--------|----------------|----------|
| Email/Password | Standard | Default for most users |
| Magic Link | High | Passwordless option |
| OAuth (Google) | High | SSO integration |
| OAuth (Microsoft) | High | Corporate SSO |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Management

| Setting | Value | Description |
|---------|-------|-------------|
| JWT Expiry | 1 hour | Access token lifetime |
| Refresh Token Expiry | 7 days | Refresh token lifetime |
| Session Inactivity | 24 hours | Auto-logout after inactivity |

### Multi-Factor Authentication (Optional)

MFA can be enabled for additional security:

```typescript
// Enable TOTP MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});
```

---

## Authorization

### Role-Based Access Control (RBAC)

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Full system access | Create, Read, Update, Delete, Manage Users |
| **Editor** | Can modify data | Create, Read, Update |
| **Viewer** | Read-only access | Read only |

### Permission Matrix

| Resource | Viewer | Editor | Admin |
|----------|--------|--------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Capabilities | ✅ | ✅ | ✅ |
| Edit Capabilities | ❌ | ✅ | ✅ |
| Delete Capabilities | ❌ | ❌ | ✅ |
| View Quick Wins | ✅ | ✅ | ✅ |
| Edit Quick Wins | ❌ | ✅ | ✅ |
| Use AI Chat | ✅ | ✅ | ✅ |
| AI Write Operations | ❌ | ✅ | ✅ |
| View Activity Log | Own only | Own only | ✅ All |
| Manage Users | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ✅ |

### Row Level Security (RLS)

All authorization is enforced at the database level using PostgreSQL RLS.

```sql
-- Example: Only editors and admins can update capabilities
CREATE POLICY "capabilities_update" ON capabilities
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );
```

### Role Assignment

Roles are stored in the `users` table and assigned by admins:

```sql
-- Assign editor role
UPDATE users 
SET role = 'editor' 
WHERE email = 'user@example.com';
```

---

## Data Protection

### Encryption at Rest

| Data | Encryption | Provider |
|------|------------|----------|
| Database | AES-256 | Supabase/AWS |
| Backups | AES-256 | Supabase |
| File Storage | AES-256 | Supabase |

### Encryption in Transit

- All connections use TLS 1.3
- HTTPS enforced (HTTP redirects to HTTPS)
- WebSocket connections secured (WSS)

### Sensitive Data Handling

| Data Type | Storage | Access |
|-----------|---------|--------|
| Passwords | Hashed (bcrypt) | Never exposed |
| API Keys | Environment variables | Server-side only |
| JWT Tokens | HTTP-only cookies | Automatic refresh |
| User PII | Encrypted columns | RLS protected |

### Data Retention

| Data Type | Retention | Deletion |
|-----------|-----------|----------|
| User accounts | Until deleted | Hard delete available |
| Activity logs | 1 year | Automatic purge |
| Chat history | 90 days | User can delete |
| Backups | 7 days | Automatic rotation |

---

## API Security

### Request Authentication

All API requests require a valid JWT:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
apikey: <SUPABASE_ANON_KEY>
```

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth endpoints | 10 | per minute |
| API requests | 1000 | per second |
| AI chat | 20 | per minute |
| File uploads | 50 | per hour |

### Input Validation

All inputs are validated:

```typescript
// Example: Zod schema validation
const capabilitySchema = z.object({
  name: z.string().min(1).max(255),
  current_level: z.number().int().min(1).max(5),
  target_level: z.number().int().min(1).max(5),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
});
```

### CORS Configuration

```javascript
// Allowed origins (production)
const allowedOrigins = [
  'https://roadmap.set.com',
  'https://www.roadmap.set.com'
];
```

### Content Security Policy

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com;
```

---

## Infrastructure Security

### Vercel (Frontend)

- Edge network with DDoS protection
- Automatic SSL/TLS certificates
- Immutable deployments
- No server access (serverless)

### Supabase (Backend)

- SOC 2 Type II compliant
- Data encrypted at rest and in transit
- VPC isolation
- Automatic security patches
- Daily backups (Pro tier)

### Network Security

```
Internet
    │
    ▼
┌─────────────────┐
│  Vercel Edge    │  ← DDoS protection, WAF
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase API   │  ← Rate limiting, auth
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  ← RLS, encryption
└─────────────────┘
```

---

## Audit Logging

### What's Logged

| Event | Logged Data |
|-------|-------------|
| Login success | User ID, timestamp, IP |
| Login failure | Email, timestamp, IP |
| Data create | User, table, new values |
| Data update | User, table, old/new values |
| Data delete | User, table, old values |
| Permission denied | User, attempted action |

### Log Format

```json
{
  "id": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": "uuid",
  "action": "UPDATE",
  "table_name": "capabilities",
  "record_id": "uuid",
  "old_values": { "current_level": 1 },
  "new_values": { "current_level": 2 },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

### Log Retention

- Activity logs: 1 year
- Auth logs: 90 days
- System logs: 30 days

### Accessing Logs

**Admins can view logs:**
1. Navigate to Settings → Activity Log
2. Filter by user, table, or date range
3. Export for analysis

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Data breach, system down | Immediate |
| High | Security vulnerability | 4 hours |
| Medium | Suspicious activity | 24 hours |
| Low | Minor security issue | 72 hours |

### Response Procedures

#### 1. Data Breach

1. **Contain**: Disable affected accounts
2. **Assess**: Determine scope of breach
3. **Notify**: Alert affected users within 72 hours
4. **Remediate**: Fix vulnerability
5. **Report**: Document incident

#### 2. Compromised Credentials

1. **Revoke**: Rotate all API keys immediately
2. **Invalidate**: Force logout all sessions
3. **Investigate**: Check audit logs
4. **Reset**: Require password resets
5. **Monitor**: Watch for suspicious activity

#### 3. Unauthorized Access Attempt

1. **Block**: Ban IP if repeated attempts
2. **Alert**: Notify security team
3. **Investigate**: Review access patterns
4. **Strengthen**: Add MFA if needed

### Emergency Contacts

| Role | Contact |
|------|---------|
| Security Lead | security@set.com |
| Supabase Support | support.supabase.com |
| Anthropic Support | support.anthropic.com |

---

## Security Checklist

### Development

- [ ] No secrets in code (use environment variables)
- [ ] Dependencies updated regularly
- [ ] Input validation on all endpoints
- [ ] Output encoding to prevent XSS
- [ ] SQL injection prevention (parameterized queries)
- [ ] CSRF protection enabled

### Deployment

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS restricted to known origins
- [ ] Rate limiting enabled
- [ ] Error messages don't leak info
- [ ] Debug mode disabled in production

### Operations

- [ ] Strong passwords required
- [ ] Unused accounts disabled
- [ ] Permissions reviewed quarterly
- [ ] Logs monitored for anomalies
- [ ] Backups tested regularly
- [ ] Incident response plan documented

### Compliance

- [ ] Data retention policies defined
- [ ] Privacy policy published
- [ ] User consent obtained
- [ ] Data deletion process available
- [ ] Access controls documented

---

## Security Updates

### Staying Current

1. **Subscribe** to security advisories:
   - Supabase: status.supabase.com
   - Vercel: vercel.com/changelog
   - npm: npmjs.com/advisories

2. **Update dependencies** monthly:
   ```bash
   pnpm audit
   pnpm update
   ```

3. **Review** RLS policies quarterly

### Reporting Vulnerabilities

If you discover a security vulnerability:

1. **Do not** create a public GitHub issue
2. **Email** security@set.com with details
3. **Include** steps to reproduce
4. **Wait** for acknowledgment before disclosure

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Deployment](./DEPLOYMENT.md)
