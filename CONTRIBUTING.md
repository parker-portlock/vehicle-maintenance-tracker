# Contributing to Vehicle Maintenance Tracker (VMT) [WIP]

Thanks for your interest in contributing! This document covers the basics of getting involved.

## Project Philosophy

VMT exists so individuals, small shops, and businesses can track vehicle maintenance without paying for overpriced, locked-down software. It is free to use, free to modify, and free to build upon — with the single restriction that the software itself (or derivatives of its source code) cannot be sold.

## Licensing Terms for Contributions

**By submitting a contribution (pull request, patch, issue-provided code, or documentation), you agree that your contribution is licensed under the same terms as this project: Apache License 2.0 with Commons Clause.**

This keeps things simple:

- You retain authorship credit for your work
- Your contribution becomes part of VMT under the project's existing license
- It allows the project maintainer to adjust licensing in the future if the project's needs change
- No separate CLA signing required — submitting a PR constitutes agreement

If you're not comfortable with these terms, please open an issue describing the change instead of submitting code, and we can discuss it.

## How to Contribute

### Reporting Bugs

1. Check existing issues first to avoid duplicates
2. Open a new issue with:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment details (OS, browser/runtime version, database version)
3. Screenshots or logs help a lot

### Suggesting Features

Open an issue tagged as a feature request. Describe the problem you're trying to solve, not just the solution you have in mind — there may be a better path.

### Submitting Code

1. Fork the repo and create a branch from `main`:
   ```bash
   git checkout -b feature/short-description
   ```
2. Make your changes, keeping commits focused and messages descriptive
3. Test your changes — PRs that break existing functionality will be sent back
4. Open a pull request linking any related issues (`Fixes #123`)
5. Be responsive to review feedback

### Code Expectations

- Follow the existing style of the codebase — consistency wins over preference
- New features should include tests where practical
- Bug fixes should include a test that fails before the fix and passes after
- Changes that alter the database schema get a `### Database` section in the release's CHANGELOG entry — the README tells users to check it before upgrading

## Code of Conduct Basics

Be decent. Disagreement about technical decisions is fine; personal attacks aren't. Maintainers reserve the right to close threads that go off the rails.

## Questions?

Open an issue and tag it as a question — happy to help.