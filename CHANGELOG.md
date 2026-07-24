# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- FLOSS compliance documentation (LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, GOVERNANCE.md)
- GitHub issue and pull request templates
- CI/CD workflows for automated testing and releases
- Developer Certificate of Origin (DCO)

### Security
- Initial security policy and vulnerability reporting process

## [3.0.0] - 2024-01-20

### Added
- Initial release of SMILE Platform Backend
- Node.js 18+ support
- TypeScript 5+ with native ESM
- Hono.js framework
- Kysely query builder and migrations
- Pino logging
- RabbitMQ job queue
- ESLint & Prettier configuration
- JSX Email templating
- Vitest testing framework
- Docker support with docker-compose

### Infrastructure
- Database configuration
- Keycloak integration
- Message queue setup
- Storage configuration

### Documentation
- Architecture Decision Records (ADR)
- API documentation
- Database models documentation
- Infrastructure monitoring guides

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

- **MAJOR**: Incompatible API changes
- **MINOR**: Added functionality in a backward compatible manner
- **PATCH**: Backward compatible bug fixes

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.2.3`
4. Push tag: `git push origin v1.2.3`
5. GitHub Actions will automatically create a release

## How to Contribute

If you want to contribute to this project, please read our [Contributing Guidelines](CONTRIBUTING.md).
