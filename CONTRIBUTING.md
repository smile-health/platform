# Contributing to SMILE Platform Backend

Thank you for your interest in contributing to the SMILE Platform Backend! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read and follow it in all your interactions with the project.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Git
- Docker and Docker Compose (for local development)

### Setup

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone git@gitlab.badr.co.id:smile-platform/backend.git
   cd backend
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
5. Build the project:
   ```bash
   turbo build
   ```
6. Start the development server:
   ```bash
   turbo dev
   ```

## Development Process

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. Make your changes following our [coding standards](#coding-standards)

3. Test your changes thoroughly:
   ```bash
   pnpm test
   ```

4. Commit your changes with a clear and descriptive message:
   ```bash
   git commit -m "feat: add new authentication endpoint"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a pull request

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Link any relevant issues in your PR description
3. Include screenshots if your changes affect the UI
4. Ensure all tests pass
5. Wait for code review
6. Make requested changes if needed
7. Once approved, your PR will be merged

### PR Checklist

Before submitting your PR, please ensure:

- [ ] Code follows the project's coding standards
- [ ] All tests pass
- [ ] Documentation is updated if necessary
- [ ] Commit messages follow our convention
- [ ] You've tested your changes manually
- [ ] No sensitive information is committed

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style (configured with ESLint and Prettier)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused on a single responsibility

### Code Style

```bash
# Check linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh to improve user experience
and reduce authentication failures.

Closes #123
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests for specific package
turbo run test --filter=@smile/package-name
```

### Writing Tests

- Write unit tests for new functions and classes
- Write integration tests for API endpoints
- Aim for high code coverage
- Use descriptive test names
- Mock external dependencies

## Documentation

### API Documentation

- API endpoints should be documented using OpenAPI/Swagger
- Include request/response examples
- Document authentication requirements

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex business logic
- Keep README files up to date

### Architecture Documentation

- Architecture decisions should be recorded in the `adr/` directory
- Update relevant documentation when making architectural changes

## Reporting Issues

### Bug Reports

When reporting a bug, please include:

1. Clear description of the issue
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details (OS, Node version, etc.)
5. Relevant logs or screenshots

### Feature Requests

When requesting a feature, please include:

1. Clear description of the feature
2. Use case and motivation
3. Any implementation suggestions
4. Possible alternatives considered

## Security

If you discover a security vulnerability, please do not open a public issue. Instead, send an email to: arya@badr-interactive.com

## Getting Help

- Check existing documentation in the `adr/` directory
- Search existing issues before creating new ones
- Join our discussions for questions
- Email: arya@badr-interactive.com for project-specific inquiries

## License

By contributing to this project, you agree that your contributions will be licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

## Recognition

Contributors are recognized in:
- Our contributors list
- Release notes for significant contributions
- Annual project summary

Thank you for contributing to SMILE Platform Backend! 🎉
