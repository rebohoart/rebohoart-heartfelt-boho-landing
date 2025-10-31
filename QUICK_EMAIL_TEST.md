# 🚀 QUICK EMAIL TEST - See Exact Error

**Problem**: Emails don't work and you can't see logs in Supabase
**Solution**: Use direct browser test to see the exact error

---

## 🎯 METHOD 1: Direct HTML Test (EASIEST)

I created a test file that shows the exact error in the browser.

### Step 1: Open the Test

1. Open the file: `test-email.html` in your browser
2. Or copy this path and paste in the address bar:
   ```
   file:///home/user/rebohoart-heartfelt-boho-landing/test-email.html
   ```

### Step 2: Fill the Data

**Supabase URL:** (already filled)
```
https://jjfqljrbgoymwwvyyvam.supabase.co
```

**Supabase Anon Key:** (paste this key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnFsanJiZ295bXd3dnl5dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQwNDEsImV4cCI6MjA3NzM0MDA0MX0.Rqv7g7DTvhiDqtoWh6H6mVsc7U4jo-MS67SW2HuCf18
```

**Customer Name:** (any test name)
```
Test Customer
```

**Customer Email:** (use your email to receive the test)
```
catarinarebocho30@gmail.com
```

### Step 3: Send and See the Error

1. Click the **"🚀 Enviar Teste de Email"** button
2. **Open Browser Console** (F12 or Ctrl+Shift+I)
3. See the error that appears (both on the page and in the console)

### Step 4: Interpret the Error

**If it shows "Missing environment variables":**
```
❌ Problem: Secrets are not configured in Supabase
✅ Solution:
   1. Go to: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
   2. Click "Manage secrets"
   3. Add the 3 secrets (see below)
```

**If it shows "Invalid credentials" or "Authentication failed":**
```
❌ Problem: Gmail App Password is incorrect
✅ Solution:
   1. Generate a NEW App Password: https://myaccount.google.com/apppasswords
   2. Copy the password (16 characters, no spaces)
   3. Update the GMAIL_APP_PASSWORD secret in Supabase
```

**If it shows "Function not found" or 404 error:**
```
❌ Problem: Edge Function was not deployed
✅ Solution:
   1. Go to: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
   2. Click "Create function" (if doesn't exist)
   3. Name: send-order-email
   4. UNCHECK "Verify JWT"
   5. Paste the code from: supabase/functions/send-order-email/index.ts
   6. Click "Deploy"
```

**If it shows error 500:**
```
❌ Problem: Internal function error (probably incorrect secrets)
✅ Solution:
   1. Check the secrets in Supabase
   2. GMAIL_USER must have the COMPLETE email (with @gmail.com)
   3. GMAIL_APP_PASSWORD must have 16 characters, NO spaces
   4. Generate a new App Password if needed
```

---

## 🎯 METHOD 2: Browser Console on Real Site

If you prefer to test on the real site:

### Step 1: Open Site and Console

1. Open your site: `http://localhost:8080`
2. Open Browser Console: **F12** or **Ctrl+Shift+I** (Windows/Linux) or **Cmd+Option+I** (Mac)
3. Go to the **"Console"** tab

### Step 2: Make an Order

1. Add a product to cart
2. Click on the cart icon
3. Fill the form:
   - Name: `Test`
   - Email: `catarinarebocho30@gmail.com`
4. Click "Finalizar Encomenda" (Complete Order)

### Step 3: See the Error in Console

In the browser console, you'll see messages like:

```
Checkout form error: Error: Failed to send email
Function invocation error: {...}
```

**Copy the complete error and send it to me** so I can help better.

---

## 🔧 REQUIRED SECRETS IN SUPABASE

If the error is "Missing environment variables", you need to add these secrets:

**Direct link:** https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions

### Secret #1: GMAIL_USER
```
Name: GMAIL_USER
Value: catarinarebocho30@gmail.com
```

### Secret #2: GMAIL_APP_PASSWORD
```
Name: GMAIL_APP_PASSWORD
Value: [your 16-character App Password]
```

**How to get the App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. App: Mail
3. Device: Other → "ReBoho Supabase"
4. Copy the password (16 characters, no spaces)

### Secret #3: STORE_EMAIL (optional)
```
Name: STORE_EMAIL
Value: catarinarebocho30@gmail.com
```

---

## 🆘 QUICK VERIFICATION

Before testing, confirm:

### ✅ Configuration Checklist:

- [ ] **2-Step Verification active** on Google
  - Link: https://myaccount.google.com/security

- [ ] **App Password created** (16 characters)
  - Link: https://myaccount.google.com/apppasswords

- [ ] **3 Secrets added** in Supabase
  - Link: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
  - Secrets: GMAIL_USER, GMAIL_APP_PASSWORD, STORE_EMAIL

- [ ] **Edge Function deployed**
  - Link: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
  - Name: `send-order-email`
  - Verify JWT: UNCHECKED ❌

---

## 📞 WHAT TO DO AFTER THE TEST

After running the test and seeing the error:

### If the test works ✅
```
Great! The problem is solved.
Now test on the real site to confirm.
```

### If a specific error appears ❌
```
1. Copy the COMPLETE error message
2. Also copy what appears in the browser console
3. Check the "Step 4: Interpret the Error" section above
4. Follow the solution for your specific error
```

### If you can't resolve it ❌
```
Send me:
1. Screenshot of the error in test-email.html
2. Screenshot of the browser console (F12)
3. Confirmation that the 3 secrets are in Supabase
4. Screenshot of the Edge Functions list (hide sensitive data)
```

---

## 🎯 ULTRA-QUICK SUMMARY

```bash
# 1. Open the test
Open: test-email.html in browser

# 2. Fill
- URL: https://jjfqljrbgoymwwvyyvam.supabase.co
- Key: [paste the Anon Key from .env file]
- Name: Test
- Email: catarinarebocho30@gmail.com

# 3. Send and see error
- Click "Send Test"
- Open Console (F12)
- Read the error that appears

# 4. Resolve
- If "Missing env vars" → Add secrets in Supabase
- If "Invalid credentials" → Generate new App Password
- If "Function not found" → Deploy the function
- If error 500 → Check if secrets are correct
```

---

## 📚 Useful Links

- **Test Email HTML**: `file:///home/user/rebohoart-heartfelt-boho-landing/test-email.html`
- **Supabase Functions**: https://supabase.com/dashboard/project/jjfqljrbgoymwwvyyvam/functions
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Gmail Security**: https://myaccount.google.com/security
- **Complete Guide (EN)**: EMAIL_DEBUG_NOW.md
- **Guia Completo (PT)**: DIAGNOSTICO_EMAIL_AGORA.md

---

**Date**: 2025-10-31
**Version**: 1.0.0 - Direct Test
