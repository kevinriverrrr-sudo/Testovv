# Contributing to HomeNet VPN

Thank you for your interest in contributing to HomeNet VPN! 🎉

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear use case
   - Expected behavior
   - Why it would benefit users
   - Potential implementation ideas

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write/update tests if applicable
5. Run linting: `npm run lint`
6. Build the extension: `npm run build`
7. Test in browser (Chrome, Firefox, Edge)
8. Commit with clear message: `git commit -m "Add: feature description"`
9. Push: `git push origin feature/my-feature`
10. Create Pull Request with description

### Commit Message Format

```
Type: Short description

Longer description if needed

Fixes #123
```

Types:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Changes to existing feature
- `Remove:` Removed feature/code
- `Docs:` Documentation changes
- `Style:` Code style changes (formatting, etc.)
- `Refactor:` Code refactoring
- `Test:` Test additions/changes
- `Chore:` Build process, dependencies, etc.

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/vpn-extension-mvp.git

# Install dependencies
npm install

# Start development build (watch mode)
npm run watch

# In another terminal, start API server
npm run server
```

## Code Style

- Use TypeScript for all new code
- Follow existing code style
- Use meaningful variable/function names
- Add comments for complex logic
- Keep functions small and focused
- Prefer async/await over callbacks

## Testing

- Test in Chrome, Firefox, and Edge
- Test both connected and disconnected states
- Test with different privacy settings
- Verify no console errors
- Check network requests in DevTools

## Security

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email security@homenetvpn.com with details
3. We'll respond within 48 hours
4. We'll work with you on a fix
5. We'll credit you in the security advisory

## Questions?

- Open a Discussion on GitHub
- Join our Discord (link in README)
- Email dev@homenetvpn.com

Thank you for contributing! 🚀
