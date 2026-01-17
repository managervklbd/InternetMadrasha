# Go-Live Checklist & Security Audit

## 1. Environment Configuration

- [ ] **Database URL**: Switch from local/dev DB to Production Managed Database URL.
- [ ] **NextAuth URL**: Update `NEXTAUTH_URL` to the actual domain (e.g., `https://portal.internetmadrasha.com`).
- [ ] **Secret Keys**: Generate a new, strong `AUTH_SECRET` using `openssl rand -base64 32`.

## 2. Payment Gateway (SSLCOMMERZ)

- [ ] **Store Credentials**: Replace Test/Sandbox Store ID with Live Store ID.
- [ ] **Store Password**: Update to Live Store Password.
- [ ] **Is Sandbox?**: Set `SSLCOMMERZ_IS_SANDBOX=false` in `.env`.
- [ ] **IPN Listener**: Verify the IPN (Instant Payment Notification) URL is publicly accessible.

## 3. Security Hardening

- [ ] **Admin Account**: Ensure the initial `seed` admin password is changed immediately after first login.
- [ ] **RBAC Verification**: 
    - Try accessing `/admin` as a Student -> Should redirect to Dashboard.
    - Try accessing `/teacher` as a Student -> Should redirect to Dashboard.
- [ ] **Rate Limiting**: logic is implemented for critical routes (Login/Payment).
- [ ] **HTTPS**: Ensure SSL/TLS is enabled on the web server (Nginx/Vercel).

## 4. Final Data Check

- [ ] **Academic Settings**: Verify Classes/Departments are correctly seeded.
- [ ] **Fees**: Verify "Monthly Fee" amounts in Plans are correct (Real Money!).
- [ ] **Test Transaction**: Perform one real transaction of 10 BDT to verify the full flow (Bank -> SSL -> App -> Ledger).

## 5. Post-Deployment Monitoring

- [ ] **Logs**: Check `pm2 logs` or Vercel logs for any errors during startup.
- [ ] **Audit Trail**: Verify the "Test Transaction" appeared in the Audit Log.
