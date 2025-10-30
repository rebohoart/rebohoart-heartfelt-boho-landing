# Security Improvements

This document outlines the security improvements made to the Rebohoart e-commerce application.

## 🔒 Critical Security Fixes

### 1. Environment Variables Protection
**Problem:** `.env` file containing Supabase credentials was committed to git repository.

**Solution:**
- Added `.env` and `.env.*` to `.gitignore`
- Removed `.env` from git tracking using `git rm --cached .env`
- Created `.env.example` template for developers
- **⚠️ IMPORTANT:** The exposed credentials should be rotated in Supabase dashboard

**Files Modified:**
- `.gitignore`
- `.env.example` (created)

### 2. Row Level Security (RLS) Policies
**Problem:** Missing RLS policies on `products` table allowed any authenticated user to modify product data.

**Solution:**
- Added RLS policies restricting INSERT, UPDATE, and DELETE operations to admin users only
- Public users can still SELECT (view) products

**Files Modified:**
- `supabase/migrations/20251030140000_add_products_rls_policies.sql` (created)

**Policies Added:**
```sql
-- Only admins can create products
CREATE POLICY "Only admins can create products"
ON public.products FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update products
CREATE POLICY "Only admins can update products"
ON public.products FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete products
CREATE POLICY "Only admins can delete products"
ON public.products FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
```

## 🛡️ XSS Protection

### 3. HTML Sanitization and Escaping
**Problem:** User input was directly inserted into HTML strings without sanitization, creating XSS vulnerabilities.

**Solution:**
- Installed `isomorphic-dompurify` for HTML sanitization
- Created utility functions in `src/lib/sanitize.ts`:
  - `sanitizeHtml()` - Sanitizes HTML with allowed tags whitelist
  - `escapeHtml()` - Escapes HTML special characters for plain text
- Updated all forms to escape user input before including in emails

**Files Modified:**
- `src/lib/sanitize.ts` (created)
- `src/components/CheckoutForm.tsx`
- `src/components/CustomOrderForm.tsx`

**Example Usage:**
```typescript
import { escapeHtml } from "@/lib/sanitize";

const safeName = escapeHtml(formData.name);
const safeEmail = escapeHtml(formData.email);
```

## 📁 File Upload Security

### 4. File Type and Size Validation
**Problem:** File uploads only validated on client-side with `accept="image/*"` attribute.

**Solution:**
- Created `validateImageFile()` function with multi-layer validation:
  - MIME type checking (whitelist: jpeg, png, gif, webp, svg)
  - File extension verification
  - File size limit (5MB maximum)
- Applied validation to all upload handlers before Supabase upload

**Files Modified:**
- `src/lib/sanitize.ts` (added `validateImageFile()`)
- `src/components/CustomOrderForm.tsx`
- `src/pages/Backoffice.tsx`

**Validation Rules:**
- **Allowed formats:** JPG, JPEG, PNG, GIF, WebP, SVG
- **Maximum size:** 5MB per file
- **Validation layers:** MIME type, file extension, file size

## 🔍 Error Handling

### 5. Sensitive Error Information
**Problem:** Detailed error messages exposed via `console.error()` and error.message in user-facing toasts.

**Solution:**
- Removed detailed error messages from user-facing toasts
- Generic error messages shown to users
- Detailed errors still logged server-side but not exposed to client

**Example:**
```typescript
catch (error: any) {
  // Don't expose detailed error messages to users
  toast.error("Erro ao enviar pedido. Por favor, tente novamente.");
}
```

## 🚀 Deployment Checklist

Before deploying to production:

1. **Rotate Supabase Credentials:**
   - [ ] Generate new API keys in Supabase dashboard
   - [ ] Update `.env` with new credentials (don't commit!)
   - [ ] Update production environment variables

2. **Apply Database Migrations:**
   - [ ] Run the new RLS policy migration:
     ```bash
     supabase db push
     ```

3. **Verify RLS Policies:**
   - [ ] Test that non-admin users cannot modify products
   - [ ] Test that admin users can still manage products
   - [ ] Verify public users can view active products

4. **Test File Uploads:**
   - [ ] Try uploading non-image files (should be rejected)
   - [ ] Try uploading files > 5MB (should be rejected)
   - [ ] Verify valid images upload successfully

5. **Security Headers:**
   - Consider adding security headers to Supabase edge function responses
   - Add Content-Security-Policy headers if not already present

## 📚 Security Best Practices for Developers

### When Adding New Features:

1. **Input Validation:**
   - Always validate user input on both client and server
   - Use the `escapeHtml()` utility for plain text in HTML context
   - Use `sanitizeHtml()` if HTML tags are needed

2. **File Uploads:**
   - Always use `validateImageFile()` before uploading
   - Consider server-side validation via Supabase Edge Functions for additional security

3. **Database Operations:**
   - Ensure RLS policies are configured for all new tables
   - Test policies with different user roles
   - Never trust client-side checks alone

4. **Environment Variables:**
   - Never commit `.env` files
   - Use `.env.example` for documentation
   - Rotate secrets regularly

5. **Error Handling:**
   - Don't expose detailed error messages to users
   - Log errors server-side for debugging
   - Use generic messages in user-facing toasts

## 🔗 Additional Resources

- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP File Upload Security](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
