# Security

This is a **portfolio demo** repository. It must not contain production credentials, artist submission data, or private infrastructure details.

## Reporting

If you believe you found a secret or vulnerability in this repo, please open a private security advisory on GitHub or email the maintainer. Do not open public issues with sensitive details.

## For maintainers

- Never commit `.env`, `.env.dev`, or real API keys.
- Use `.env.example` placeholders only.
- Run a secret scan before each release (`gitleaks detect --source .` or equivalent).
- Rotate any credential that was ever committed to a private fork of the production app.
