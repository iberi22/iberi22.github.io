# Security & Artifact Integrity Policy

## 🔒 100% Client-Side / Zero Data Leaks
All tools, simulators, and prompt generators in this repository are **100% serverless and execute exclusively within the user's browser**.
- **No telemetry or analytics tracking code.**
- **No storage or transit of API keys or user credentials.**
- **Sanitized `.env.example` templates with redacted placeholder tokens.**

## 🛡️ VirusTotal & SHA-256 Integrity Verification
You can independently verify the published static bundle using VirusTotal:
1. Navigate to [VirusTotal URL Scanner](https://www.virustotal.com/gui/home/url).
2. Input the official production URL: `https://iberi22.github.io/portfolio-iberi22/`.
3. Check the analysis report confirming **0 security vendor flags / clean rating**.

## 📦 Automated Cryptographic Ledger
Every build automatically generates `.security/integrity-sha256.txt` with SHA-256 checksums for every source file and public artifact to guarantee authenticity.
