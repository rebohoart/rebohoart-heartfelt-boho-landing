# 🚨 EMAIL DIAGNOSIS & SOLUTION - RIGHT NOW

**Date**: 2025-10-31
**Problem**: Emails are not being sent
**System**: Gmail SMTP via Supabase Edge Function

---

## ✅ QUICK CHECKLIST - FOLLOW THIS ORDER

### 1️⃣ CHECK IF GMAIL APP PASSWORD EXISTS

**What to do:**
1. Go to: https://myaccount.google.com/apppasswords
2. Check if you have an App Password created for "ReBoho" or similar
3. If you DON'T have one, **STOP HERE** and go to [Step 2: Create Gmail App Password](#2️⃣-create-gmail-app-password)

**Important note:**
- App Password is DIFFERENT from your normal Gmail password
- It has 16 characters without spaces (ex: `abcdabcdabcdabcd`)
- Only works if you have 2-Step Verification enabled

---

### 2️⃣ CREATE GMAIL APP PASSWORD

**Step 2.1: Enable 2-Step Verification** (if you don't have it yet)

1. Go to: https://myaccount.google.com/security
2. Look for "2-Step Verification"
3. Click and follow the instructions to enable it
4. Wait a few minutes after enabling

**Step 2.2: Create App Password**

1. Go to: https://myaccount.google.com/apppasswords
2. If it asks for login, log in again
3. In "Select app": choose **Mail**
4. In "Select device": choose **Other (Custom name)**
5. Type: `ReBoho Supabase`
6. Click **Generate**
7. **COPY THE PASSWORD** that appears (16 yellow characters)
8. Save it somewhere safe (you'll need it in the next step)

**App Password example:**
```
abcdabcdabcdabcd
```
(copy WITHOUT spaces, all together)

---

### 3️⃣ CONFIGURE SECRETS IN SUPABASE

**Step 3.1: Go to Secrets**

1. Open: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/settings/functions
2. Look for the **"Edge Function Secrets"** or **"Secrets"** section
3. Or go directly to: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions

**Step 3.2: Add or Update Secrets**

Add these 3 secrets (or update them if they already exist):

**Secret #1:**
- Name: `GMAIL_USER`
- Value: `catarinarebocho30@gmail.com` (or your full Gmail address)

**Secret #2:**
- Name: `GMAIL_APP_PASSWORD`
- Value: `abcdabcdabcdabcd` (paste the 16-character App Password you copied)
  ⚠️ **NO SPACES!** All together!

**Secret #3:**
- Name: `STORE_EMAIL`
- Value: `catarinarebocho30@gmail.com` (email that receives order notifications)

**Step 3.3: Save**

Click **Save** or **Add** for each secret.

---

### 4️⃣ CHECK IF EDGE FUNCTION IS DEPLOYED

**Step 4.1: View Functions**

1. Go to: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
2. Look for the `send-order-email` function
3. Check the status:
   - ✅ **Deployed** - Good! Go to [Step 5](#5️⃣-test-emails)
   - ❌ **Not deployed** or doesn't exist - Continue below

**Step 4.2: Deploy the Function**

**Option A: Via Dashboard (EASIEST)**

1. In the functions list, click on `send-order-email`
2. If it doesn't exist, click **"Create function"**
   - Name: `send-order-email`
   - ⚠️ **UNCHECK** "Verify JWT"
3. In the editor, paste the code from: `/supabase/functions/send-order-email/index.ts`
4. Click **Deploy** or **Save & Deploy**
5. Wait for deployment to complete (success message appears)

**Option B: Via CLI (for those who have Supabase CLI installed)**

```bash
cd /home/user/rebohoart-heartfelt-boho-landing
supabase functions deploy send-order-email --project-ref gyvtgzdkuhypteiyhtaq
```

---

### 5️⃣ TEST EMAILS

**Step 5.1: Do Real Test**

1. Open your website in browser
2. Add a product to cart
3. Click on the cart icon
4. Fill out the checkout form with:
   - Name: `Test`
   - Email: `your-personal-email@gmail.com` (use your own email to test)
5. Click **"Finalizar Encomenda"** (Complete Order)

**Step 5.2: Check Result**

**If it works:**
- ✅ Message appears: "Encomenda enviada com sucesso!" (Order sent successfully!)
- ✅ Store receives email (STORE_EMAIL)
- ✅ Customer receives confirmation email

**If it DOESN'T work:**
- ❌ Error message appears
- Continue to [Step 6: View Error Logs](#6️⃣-view-error-logs)

---

### 6️⃣ VIEW ERROR LOGS

**Step 6.1: Access Logs**

1. Go to: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email/logs
2. Or: Functions → send-order-email → Logs
3. Sort by **"Most recent"**

**Step 6.2: Identify the Error**

Look for error messages. Most common errors:

**❌ Error: "Missing environment variables"**
- **Problem**: Secrets are not configured
- **Solution**: Go back to [Step 3](#3️⃣-configure-secrets-in-supabase) and add the secrets

**❌ Error: "Invalid credentials" or "Authentication failed"**
- **Problem**: Wrong App Password or GMAIL_USER incorrect
- **Solution**:
  1. Check if `GMAIL_USER` has the complete email: `youremail@gmail.com`
  2. Check if `GMAIL_APP_PASSWORD` was copied correctly (16 characters, no spaces)
  3. If needed, generate a NEW App Password and update the secret

**❌ Error: "Connection refused" or "Timeout"**
- **Problem**: Network issue or SMTP configuration
- **Solution**:
  1. Wait 5 minutes and try again
  2. Check if App Password is still valid
  3. Try generating a new App Password

**❌ Error: "Function not found"**
- **Problem**: Edge Function was not deployed
- **Solution**: Go back to [Step 4](#4️⃣-check-if-edge-function-is-deployed)

---

## 🔧 SOLUTIONS FOR COMMON PROBLEMS

### Problem: Emails go to SPAM

**Temporary solution:**
1. Check SPAM/Junk folder
2. Mark email as "Not spam"
3. Add sender to contacts

**Permanent solution:**
- Gmail generally doesn't go to spam when sending from Gmail domain itself
- If it continues, consider using a service like Resend or SendGrid

---

### Problem: "Order sent successfully" but don't receive email

**Possible causes:**

1. **Email is in SPAM**
   - Check SPAM folder

2. **STORE_EMAIL incorrect**
   - Check the `STORE_EMAIL` secret in Supabase
   - Confirm the email exists and is accessible

3. **Gmail temporarily blocked**
   - Gmail has a limit of 500 emails per day
   - If exceeded, wait 24h

**How to verify:**
1. Go to Edge Function logs
2. Look for: `"✓ Email sent successfully"`
3. If it appears, email was sent (check SPAM)
4. If it doesn't appear, see error in logs

---

### Problem: Can't create App Password

**Cause:** 2-Step Verification is not active or hasn't propagated.

**Solution:**
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Wait 10-15 minutes
3. Log out and log back into Google
4. Try creating App Password again

---

## 📋 ULTRA-QUICK SUMMARY

```
1. ✅ Create App Password: https://myaccount.google.com/apppasswords
2. ✅ Copy 16-character password
3. ✅ Go to Supabase Secrets: Dashboard → Functions → Secrets
4. ✅ Add 3 secrets:
   - GMAIL_USER = your-email@gmail.com
   - GMAIL_APP_PASSWORD = abcdabcdabcdabcd (no spaces)
   - STORE_EMAIL = catarinarebocho30@gmail.com
5. ✅ Deploy Edge Function (if needed)
6. ✅ Test on website
7. ✅ Check logs if it fails
```

---

## 🆘 STILL NOT WORKING?

If you followed ALL steps above and it still doesn't work:

### Final Checklist:

- [ ] 2-Step Verification is ACTIVE on Google
- [ ] App Password was created (16 characters)
- [ ] App Password was copied WITHOUT SPACES
- [ ] The 3 secrets are in Supabase (GMAIL_USER, GMAIL_APP_PASSWORD, STORE_EMAIL)
- [ ] GMAIL_USER has the COMPLETE email (with @gmail.com)
- [ ] Edge Function `send-order-email` is DEPLOYED
- [ ] Waited at least 2-3 minutes after configuring secrets
- [ ] Checked Edge Function LOGS
- [ ] Checked SPAM folder

### If it still doesn't work:

1. **Check logs in real-time:**
   - Open: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email/logs
   - Leave page open
   - Make a test order
   - See the exact error that appears in logs

2. **Test App Password manually:**
   - Use an online SMTP testing tool
   - Test if you can send email with the credentials
   - This confirms if the problem is the App Password or Edge Function

3. **Generate a NEW App Password:**
   - Delete the old App Password
   - Create a new one
   - Update the secret in Supabase

---

## 📞 DEBUG INFORMATION

If you need additional help, provide this information:

1. **Screenshot of Secrets** (hide the password!)
2. **Screenshot of Edge Function Logs** (last 10 lines)
3. **Exact error message** that appears in browser
4. **Confirmation:**
   - [ ] Is 2-Step Verification active? (Yes/No)
   - [ ] Was App Password created? (Yes/No)
   - [ ] Were secrets added? (Yes/No)
   - [ ] Is Edge Function deployed? (Yes/No)

---

## 🎯 DIRECT LINKS FOR YOUR PROJECT

- **Supabase Dashboard**: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq
- **Edge Functions**: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions
- **Function Logs**: https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/functions/send-order-email/logs
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Gmail 2-Step Verification**: https://myaccount.google.com/security

---

**Last updated:** 2025-10-31
**Version:** 1.0.0 - Complete Diagnosis
