# Authentication Security Audit

**Last Audit Date**: 2026-10-21
**Auditor**: Auth Security Agent

**Files reviewed** (all under `src/`): `auth.ts`, `auth.config.ts`, `proxy.ts`, `lib/tokens.ts`, `lib/mail.ts`, `lib/zod.ts`, `actions/forgot-password.ts`, `actions/reset-password.ts`, `actions/profile.ts`, and the API routes `register`, `verify-email`, `resend-verification` and `check-email-verified` under `app/api/auth/`.

## Executive Summary

The core primitives are sound. Passwords are hashed with bcrypt, tokens come from a CSPRNG, reset tokens expire after 1 hour and are deleted after use, and profile actions take the user ID from the session. The weak points are everything around those primitives: there is no rate limiting anywhere, account enumeration is possible through several endpoints, password reset and password change do not invalidate existing sessions, single-use token enforcement is not atomic, and the sign-in page has an open redirect.

## Findings

### Critical Issues

None found.

### High Severity

#### 1. No rate limiting on any auth endpoint

**Severity**: High
**Files**:
- `src/auth.ts`, lines 21-35 (credentials login)
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/resend-verification/route.ts`
- `src/app/api/auth/check-email-verified/route.ts`
- `src/actions/forgot-password.ts`
- `src/actions/reset-password.ts`
- `src/actions/profile.ts` (`changePassword`)

**Problem**: None of these have throttling or lockout. That allows:
- Credential stuffing and brute force on login
- Email bombing through `forgotPassword` and `resend-verification`, which email any address on request. Each call also costs Resend quota
- Mass registration
- bcrypt CPU exhaustion
- Brute-forcing the current password through `changePassword` from a hijacked session

**Fix**: The project already lists Upstash Redis in its stack.

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const loginLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "login",
});

export const emailLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "email",
});

// in authorize(), before the DB lookup (key on IP + email):
const { success } = await loginLimiter.limit(`${ip}:${email.toLowerCase()}`);
if (!success) return null;

// likewise in forgotPassword, resend-verification, register (key on IP + email),
// and changePassword (key on user id)
```

---

#### 2. Password reset does not invalidate existing sessions

**Severity**: High
**Files**: `src/actions/reset-password.ts`, lines 36-47; `src/actions/profile.ts`, lines 35-41

**Problem**: Sessions use the JWT strategy, so an attacker who already holds a session stays logged in for the JWT lifetime (30 days by default). That holds even after the victim resets or changes their password.

**Fix**: Add a `passwordChangedAt` column to `User` (requires a migration) and check it in the `jwt` callback.

```typescript
// reset-password.ts and changePassword: set passwordChangedAt: new Date() in the update

// auth.ts jwt callback
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.iat = Math.floor(Date.now() / 1000);
  } else if (token.id) {
    const u = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { passwordChangedAt: true },
    });
    if (
      !u ||
      (u.passwordChangedAt &&
        u.passwordChangedAt.getTime() / 1000 > (token.iat as number))
    ) {
      return null;
    }
  }
  return token;
}
```

The `jwt` callback runs in the Node `auth.ts`, not in the edge-safe `proxy.ts` config, so the DB call is fine there.

---

#### 3. Reset token is not consumed atomically (race condition)

**Severity**: High
**File**: `src/actions/reset-password.ts`, lines 15-46

**Problem**: The code reads the token, hashes the password, updates the user, and only then deletes the token. Two concurrent requests with the same token can both succeed. Also, if the `delete` fails after the update, the token stays valid. The same read-then-delete pattern exists in `src/app/api/auth/verify-email/route.ts`, lines 14-41, but the impact there is minor.

**Fix**: Consume the token first, atomically.

```typescript
const hashed = await bcrypt.hash(password, 12);

const result = await prisma.$transaction(async (tx) => {
  const del = await tx.verificationToken.deleteMany({
    where: {
      token,
      identifier: { startsWith: "pwd-reset:" },
      expires: { gt: new Date() },
    },
  });
  if (del.count !== 1) return null;
  return tx.user.update({
    where: { email: resetToken.email },
    data: { password: hashed, passwordChangedAt: new Date() },
  });
});
```

---

#### 4. Reset and verification tokens are stored in plaintext

**Severity**: High
**File**: `src/lib/tokens.ts`

**Problem**: Anyone with read access to the database (leaked backup, Neon branch) can take over any account with a pending reset by using the raw token directly. The same applies to verification tokens.

**Fix**: Store `sha256(token)` in the DB and email the raw token. On lookup, hash the incoming token before querying.

```typescript
import crypto from "crypto";

const raw = crypto.randomBytes(32).toString("hex");
const hash = crypto.createHash("sha256").update(raw).digest("hex");
// store hash in DB; send raw token in email
```

This also gives you 256-bit tokens instead of UUIDv4's 122 bits.

---

### Medium Severity

#### 5. Open redirect via `callbackUrl`

**Severity**: Medium
**File**: `src/app/(auth)/sign-in/page.tsx`, lines 22 and 72

**Problem**: `callbackUrl` comes straight from the query string and is passed to `router.push` after a successful login. NextAuth's callback URL validation is bypassed because `redirect: false` is used. A link like `/sign-in?callbackUrl=https://evil.example/login` sends the user to the attacker's site right after authentication, which makes phishing convincing. The same unvalidated value is passed to `signIn("github", { callbackUrl })` on line 92.

**Fix**:

```typescript
const raw = searchParams.get("callbackUrl") ?? "/dashboard";
const callbackUrl =
  raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")
    ? raw
    : "/dashboard";
```

Also change `proxy.ts` line 10 to use `req.nextUrl.pathname + req.nextUrl.search` so callback URLs stay relative.

---

#### 6. Unauthenticated account and verification-state oracle

**Severity**: Medium
**File**: `src/app/api/auth/check-email-verified/route.ts`, lines 4-20

**Problem**: Anyone can POST an email address with no password required. A response of `{ verified: false }` confirms that a credentials account exists for that address and is unverified. The sign-in page calls this endpoint after any failed login, so it is a public, unthrottled enumeration endpoint.

**Fix**: Delete the endpoint. Have `authorize` return a distinct error only after the password has verified correctly (it already throws `EMAIL_NOT_VERIFIED` at that point). Surface that error code to the client through a custom `CredentialsSignin` subclass with a `code`. If you keep the endpoint, require the password and rate limit it.

---

#### 7. Registration reveals which emails are registered

**Severity**: Medium
**File**: `src/app/api/auth/register/route.ts`, lines 20-25

**Problem**: The "Email already in use" response lets an attacker enumerate accounts.

**Fix**: Return the same success response in both cases. For an existing account, send an "already registered" email instead of creating a new one. At minimum, add rate limiting.

---

#### 8. Timing-based enumeration at login and forgot-password

**Severity**: Medium
**Files**: `src/auth.ts` line 25; `src/actions/forgot-password.ts` lines 11-19

**Problem**:
- In `authorize`, an unknown user returns before the bcrypt compare, so the response is fast. A known user takes ~100ms+.
- In `forgotPassword`, the branch for a real user writes to the DB and calls Resend, so it takes noticeably longer than the branch for an unknown email.

**Fix**:
- Always run `bcrypt.compare` against a dummy hash when the user is missing.
- For forgot-password, do the work after responding using `after()` from `next/server`, or queue it.

---

#### 9. `resend-verification` and `check-email-verified` accept unvalidated input

**Severity**: Medium
**Files**: `src/app/api/auth/resend-verification/route.ts`, lines 8-26; `check-email-verified/route.ts`, line 5

**Problem**: The `email` field is passed to Prisma without Zod validation. A JSON object instead of a string would reach `findUnique` as a filter object, giving a 500 or unexpected behavior. These routes also resend to any unverified address with no cooldown.

**Fix**: Parse with Zod schema and normalize the email, and add a per-email cooldown.

---

#### 10. Email is not normalized

**Severity**: Medium
**Files**: `src/lib/zod.ts`, lines 4, 15, and 44

**Problem**: Email schemas do not lowercase or trim. Prisma `findUnique` on `email` is case-sensitive in Postgres. So `A@x.com` and `a@x.com` can register as two separate accounts, and sign-in or reset with a different case fails. Duplicate accounts can also be used for impersonation.

**Fix**: Use `z.string().trim().toLowerCase().email().max(254)` in every schema, and store emails lowercase.

---

### Low Severity

#### 11. Password max length of 32 and bcrypt at 10 rounds

**Severity**: Low
**Files**: `src/lib/zod.ts` (every password field); `bcrypt.hash(..., 10)` calls in register, reset-password, and profile

**Problem**: A 32-character maximum blocks passphrases for no security benefit. Cost factor 10 is below OWASP guidance (12 is the recommended default). There is also no complexity check or breached-password check.

**Fix**: Use `.max(72)` (bcrypt truncates at 72 bytes) and cost 12. Move the cost into a shared constant.

---

#### 12. `deleteAccount` has no re-authentication

**Severity**: Low
**File**: `src/actions/profile.ts`, lines 45-56

**Problem**: A stolen session can permanently delete the account. The delete does cascade through Prisma `onDelete: Cascade`.

**Fix**: If the user has a password, require it for deletion, or require a recent sign-in.

---

#### 13. Unhandled Zod errors in server actions

**Severity**: Low
**Files**: `src/actions/forgot-password.ts` line 9; `reset-password.ts` line 13; `profile.ts` line 19; `src/auth.ts` line 22

**Problem**: `.parse()` throws on bad input. This conflicts with the project's `{ success, data, error }` standard and can surface error details.

**Fix**: Use `safeParse` and return a generic error on failure.

---

#### 14. Email failure aborts registration after the user is created

**Severity**: Low
**File**: `src/app/api/auth/register/route.ts`, lines 29-41

**Problem**: If sending the verification email fails, the user is already created and the client gets a 500. The user then cannot re-register and has to use resend. Also, `forgotPassword` throws if Resend fails for an existing user, which leaks account existence through the error.

**Fix**: Catch email errors and still return the generic success response.

---

#### 15. `SKIP_EMAIL_VERIFICATION` toggle and environment config

**Severity**: Low
**Files**: `src/app/api/auth/register/route.ts` line 9; `src/lib/mail.ts` line 9

**Problem**:
- If `SKIP_EMAIL_VERIFICATION=true` reaches production, verification is silently bypassed. Guard it with `process.env.NODE_ENV !== "production"`.
- Email links are built from `NEXT_PUBLIC_APP_URL` with no check that it is set. Fail fast if missing.
- The sender is `onboarding@resend.dev`, which is test-only. Use a verified domain before launch.

---

## Passed Checks

- Passwords are hashed with bcryptjs, and no plaintext passwords are logged
- `User.password` is never put into the JWT or the session. Only `id` is
- Reset and verification tokens use `crypto.randomUUID()` (a CSPRNG)
- Reset tokens expire after 1 hour and verification tokens after 24 hours. Both are enforced on use
- Tokens are deleted after use and also when found expired. A new request deletes older tokens for the same identifier
- Reset tokens are namespaced with `pwd-reset:`. `getPasswordResetTokenByToken` rejects non-reset tokens, so a verification token cannot reset a password
- `forgotPassword` returns the same response for unknown emails, and `resend-verification` does the same for unknown or already-verified emails
- `authorize` blocks unverified users only after the password has verified correctly
- `changePassword` requires a session and the current password. `changePassword` and `deleteAccount` take the user ID from the session, not from input
- Account deletion cascades through the schema relations
- GitHub account linking does not use `allowDangerousEmailAccountLinking`
- Route protection via `proxy.ts` covers `/dashboard/*`
- Resend errors are logged without the token. Reset links are not logged

## Recommendations Summary

| Priority | Issue | Severity |
| --- | --- | --- |
| 1 | Add rate limiting to login, register, forgot-password, resend-verification, change-password | High |
| 2 | Make token consumption atomic and add session invalidation on password change | High |
| 3 | Hash tokens at rest | High |
| 4 | Fix the `callbackUrl` open redirect | Medium |
| 5 | Remove or lock down `check-email-verified`, stop enumeration in register and timing paths | Medium |
| 6 | Add Zod validation and email normalization to remaining routes | Medium |
| 7 | Password length/bcrypt cost, re-auth on delete, `safeParse`, email failure handling, env guards | Low |
