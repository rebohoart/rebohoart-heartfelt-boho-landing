import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const authSchema = z.object({
  email: z.string().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Password deve ter pelo menos 6 caracteres" }).max(100),
});

const passwordResetSchema = z.object({
  password: z.string().min(6, { message: "Password deve ter pelo menos 6 caracteres" }).max(100),
  confirmPassword: z.string().min(6, { message: "Password deve ter pelo menos 6 caracteres" }).max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As passwords não coincidem",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessingReset, setIsProcessingReset] = useState(false);
  const { signIn, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Detect password recovery event from email link
  useEffect(() => {
    console.log('🔍 Setting up auth state change listener');

    // Track if password reset has been triggered to prevent duplicates
    let hasTriggeredReset = false;

    // Check URL for password recovery token (hash fragment or query params)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    // Check for access_token in hash or query params (indicates password recovery)
    const hasAccessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const tokenType = hashParams.get('type') || queryParams.get('type');

    console.log('🔍 URL Check:', {
      hash: window.location.hash,
      search: window.location.search,
      hasAccessToken: !!hasAccessToken,
      tokenType: tokenType
    });

    // If there's an access token and type is recovery, activate password reset mode
    if (hasAccessToken && tokenType === 'recovery') {
      console.log('🔐 Recovery token detected in URL - switching to password reset mode');
      hasTriggeredReset = true;
      setIsPasswordReset(true);
      setIsRecovery(false);
      toast.info("Por favor, defina a sua nova password");

      // Clean URL to prevent re-detection
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email);

      // Only process PASSWORD_RECOVERY if we haven't already triggered reset
      if (event === 'PASSWORD_RECOVERY' && !hasTriggeredReset) {
        console.log('🔐 PASSWORD_RECOVERY event detected - switching to password reset mode');
        hasTriggeredReset = true;
        setIsPasswordReset(true);
        setIsRecovery(false);
        toast.info("Por favor, defina a sua nova password");

        // Clean URL to prevent re-detection
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // If password was updated successfully, clear the reset flag
      if (event === 'USER_UPDATED') {
        console.log('✅ USER_UPDATED event - password changed successfully');
        setIsProcessingReset(false);
      }
    });

    return () => {
      console.log('🔌 Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []); // Empty dependencies - only run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Trim email to remove whitespace
      // IMPORTANT: Do NOT trim password - passwords must be used exactly as entered
      const trimmedEmail = email.trim();
      const trimmedPassword = password;

      if (isPasswordReset) {
        // Password reset mode - validate new password and confirmation
        console.log('🔄 Password reset mode - updating password');
        const validation = passwordResetSchema.safeParse({
          password: trimmedPassword,
          confirmPassword: confirmPassword
        });

        if (!validation.success) {
          console.error('❌ Password validation failed:', validation.error.errors[0].message);
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        try {
          console.log('🔐 Updating password...');
          setIsProcessingReset(true);

          const { error } = await updatePassword(trimmedPassword);

          if (error) {
            console.error('❌ Error updating password:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            // Provide more specific error messages
            if (error.message.includes('session') || error.message.includes('refresh_token_not_found')) {
              toast.error("Sessão expirada. Solicite um novo link de recuperação.");
            } else if (error.message.includes('weak')) {
              toast.error("Password muito fraca. Use pelo menos 6 caracteres.");
            } else {
              toast.error(`Erro ao atualizar password: ${error.message}`);
            }
            setIsProcessingReset(false);
          } else {
            console.log('✅ Password updated successfully');
            toast.success("Password atualizada com sucesso! Pode agora fazer login.");

            // Clear form and reset state
            setPassword("");
            setConfirmPassword("");
            setShowPassword(false);
            setShowConfirmPassword(false);

            // Wait a bit for the success message to be visible
            setTimeout(() => {
              setIsPasswordReset(false);
              setIsProcessingReset(false);
            }, 1000);
          }
        } catch (err) {
          console.error('❌ Unexpected error updating password:', err);
          toast.error("Erro inesperado ao atualizar password. Tente novamente.");
          setIsProcessingReset(false);
        } finally {
          setLoading(false);
        }
      } else if (isRecovery) {
        // Password recovery mode - only validate email
        console.log('📧 Password recovery mode - sending reset email');
        const emailValidation = z.string().email({ message: "Email inválido" }).max(255).safeParse(trimmedEmail);
        if (!emailValidation.success) {
          console.error('❌ Email validation failed:', emailValidation.error.errors[0].message);
          toast.error(emailValidation.error.errors[0].message);
          setLoading(false);
          return;
        }

        // Construct the redirect URL for password reset
        // IMPORTANT: This URL must be in the Supabase "Redirect URLs" whitelist
        // Configure at: Supabase Dashboard > Authentication > URL Configuration
        const redirectUrl = `${window.location.origin}/auth`;
        console.log('🔐 Sending password reset email to:', trimmedEmail);
        console.log('🔗 Redirect URL:', redirectUrl);

        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: redirectUrl,
        });

        if (error) {
          console.error('❌ Error sending password reset email:', error);
          toast.error("Erro ao enviar email de recuperação");
        } else {
          console.log('✅ Password reset email sent successfully');
          toast.success("Email de recuperação enviado! Verifique a sua caixa de entrada.");
          setIsRecovery(false);
          setEmail("");
        }
        setLoading(false);
      } else {
        // Login mode - validate email and password
        const validation = authSchema.safeParse({ email: trimmedEmail, password: trimmedPassword });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        console.log('🔐 Attempting login with:', { email: trimmedEmail, passwordLength: trimmedPassword.length });
        const { error } = await signIn(trimmedEmail, trimmedPassword);
        if (error) {
          console.error('❌ Login error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          if (error.message.includes('Invalid login credentials')) {
            toast.error("Email ou password incorretos");
          } else {
            toast.error(`Erro: ${error.message}`);
          }
          setLoading(false);
        } else {
          console.log('✅ Login successful');
          setLoading(false);
          navigate('/backoffice');
        }
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error('Unexpected error during form submission:', error);
      toast.error("Erro inesperado. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-natural px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-serif text-3xl font-bold text-center mb-6">
          {isPasswordReset ? "Definir Nova Password" : isRecovery ? "Recuperar Password" : "Login"}
        </h1>

        {isPasswordReset && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            Defina a sua nova password. Deve ter pelo menos 6 caracteres.
          </p>
        )}

        {isRecovery && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            Insira o seu email para receber um link de recuperação de password.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isPasswordReset && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
          )}

          {!isRecovery && !isPasswordReset && (
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={100}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Esconder password" : "Mostrar password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {isPasswordReset && (
            <>
              <div>
                <Label htmlFor="new-password">Nova Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Esconder password" : "Mostrar password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Esconder password" : "Mostrar password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "A processar..." : isPasswordReset ? "Atualizar Password" : isRecovery ? "Enviar Email" : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center">
          {!isRecovery && !isPasswordReset && (
            <button
              type="button"
              onClick={() => {
                console.log('🔑 Switching to password recovery mode');
                setIsRecovery(true);
                setPassword("");
                setShowPassword(false);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Esqueceu a password?
            </button>
          )}

          {(isRecovery || isPasswordReset) && (
            <button
              type="button"
              onClick={() => {
                console.log('🔙 Returning to login mode');
                setIsRecovery(false);
                setIsPasswordReset(false);
                setIsProcessingReset(false);
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Voltar ao login
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
