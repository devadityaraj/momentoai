# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to adityaraj94505@gmail.com All security vulnerabilities will be promptly addressed.

## Security Measures

### Authentication
- Google OAuth 2.0 integration
- Secure token management
- Session persistence with proper expiration

### Data Protection
- Firebase security rules enforce user isolation
- Server-side rate limiting validation
- Input sanitization and validation
- No sensitive data in client-side code

### Infrastructure
- HTTPS-only in production
- Content Security Policy headers
- Environment variable protection
- Docker container security

### Rate Limiting
- 5 prompts per 12-hour period per user
- Server-side enforcement
- Automatic reset mechanism

## Best Practices

### Environment Variables
- Never commit `.env` files
- Use GitHub Secrets for CI/CD
- Rotate keys regularly
- Use least-privilege access

### Firebase Security
- Implement proper security rules
- Use Firebase Admin SDK for server operations
- Validate all user inputs
- Monitor for suspicious activity

### Docker Security
- Use non-root user in containers
- Scan images for vulnerabilities
- Keep base images updated
- Limit container permissions

## Incident Response

1. **Detection** - Monitor logs and alerts
2. **Assessment** - Evaluate impact and scope
3. **Containment** - Isolate affected systems
4. **Eradication** - Remove threats and vulnerabilities
5. **Recovery** - Restore normal operations
6. **Lessons Learned** - Document and improve
