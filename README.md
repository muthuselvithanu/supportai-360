# SupportAI 360

SupportAI 360 is a headless Salesforce customer support portal built with Next.js, React, TypeScript, Tailwind CSS, and Salesforce REST APIs.

The goal of this project is to show how an external React application can connect securely to Salesforce, authenticate with OAuth, and perform customer support actions without using the Salesforce UI.

## Features

- Salesforce OAuth Authorization Code Flow with PKCE
- Headless React/Next.js frontend
- Secure httpOnly cookie storage for Salesforce OAuth session data
- Customer support dashboard backed by Salesforce Cases
- Salesforce Cases list and case detail views
- AI-style assistant page with guided chat workflows
- Create real Salesforce Cases from chat
- Update Salesforce Contacts by email
- Request callbacks by creating Salesforce Cases
- Salesforce REST API integration through backend API routes
- Environment-based configuration

## Architecture

```text
React / Next.js UI
        ↓
Next.js API Routes
        ↓
Salesforce OAuth
        ↓
Salesforce REST API
        ↓
Salesforce Objects such as Contact, Account, and Case
```

## Current Version

The current version connects to Salesforce using OAuth and performs real Salesforce REST API actions:

- Create Case
- Get Cases
- View Case Details
- Update Contact
- Request Callback

Agentforce integration is planned as the next phase. A future version can route chat messages through the Agentforce API, where the Salesforce agent can decide which Flow or action to execute.

## Salesforce Setup

Create an External Client App or Connected App in Salesforce.

Required OAuth callback URL:

```text
http://localhost:3000/api/auth/callback
```

Recommended OAuth scopes:

- Manage user data via APIs
- Perform requests at any time
- OpenID
- Profile
- Email

Create sample Salesforce data:

- Account
- Contact records with email addresses
- Case records

The app creates Cases for Contacts using the Contact email address. If a matching Contact is found, the Case is linked with `ContactId`. If no matching Contact is found, the Case is still created with `SuppliedEmail`.

## Environment Variables

Create a `.env.local` file in the project root.

Use `.env.local.example` as a reference.

```env
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SALESFORCE_API_VERSION=v61.0
```

For a Salesforce sandbox, use:

```env
SALESFORCE_LOGIN_URL=https://test.salesforce.com
```

Do not commit `.env.local` to GitHub.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Click **Sign in with Salesforce** and complete the OAuth login.

After login, use the Assistant page to create a Salesforce Case, update a Contact, or request a callback.

## Available Workflows

### Create Case

The Assistant can collect:

- Customer email
- Case subject
- Case description
- Priority

Then it creates a real Salesforce Case.

### Update Contact

The Assistant can collect:

- Contact email
- First name
- Last name
- Phone number

Then it updates the matching Salesforce Contact.

### Request Callback

The Assistant can collect:

- Customer email
- Phone number
- Preferred callback time
- Reason

Then it creates a Salesforce Case with the callback details.

## Important Notes

This project does not store Salesforce passwords.

Salesforce authentication is handled using OAuth.

Secrets are stored only in environment variables and used by backend API routes.

The frontend does not expose the Salesforce Client Secret or Salesforce access token.

## Future Enhancements

- Replace direct REST API actions with Agentforce API orchestration
- Add Agentforce chat support
- Add Flow-backed actions
- Add richer Contact and Account profile views
- Add Omni-Channel escalation for human agent handoff
- Add production deployment configuration
- Deploy to Vercel

## Portfolio Summary

This project demonstrates a headless Salesforce architecture where React provides the user experience and Salesforce acts as the secure backend system. It shows practical knowledge of React, Next.js, Salesforce OAuth, REST APIs, secure API routes, and customer support workflows.

GitHub: https://github.com/muthuselvithanu
