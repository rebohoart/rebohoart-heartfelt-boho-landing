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
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, updatePassword } = useAuth();

  // Detect password recovery event from email link
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordReset(true);
        setIsRecovery(false);
        setIsSignUp(false);
      }
    });
  }, []);

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
        const validation = passwordResetSchema.safeParse({
          password: trimmedPassword,
          confirmPassword: confirmPassword
        });

        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }

        const { error } = await updatePassword(trimmedPassword);

        if (error) {
          toast.error("Erro ao atualizar password");
        } else {
          toast.success("Password atualizada com sucesso! Pode agora fazer login.");
          setIsPasswordReset(false);
          setPassword("");
          setConfirmPassword("");
        }
      } else if (isRecovery) {
        // Password recovery mode - only validate email
        const emailValidation = z.string().email({ message: "Email inválido" }).max(255).safeParse(trimmedEmail);
        if (!emailValidation.success) {
          toast.error(emailValidation.error.errors[0].message);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) {
          toast.error("Erro ao enviar email de recuperação");
        } else {
          toast.success("Email de recuperação enviado! Verifique a sua caixa de entrada.");
          setIsRecovery(false);
          setEmail("");
        }
      } else if (isSignUp) {
        // Sign up mode - validate email and password
        const validation = authSchema.safeParse({ email: trimmedEmail, password: trimmedPassword });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }

        const { error } = await signUp(trimmedEmail, trimmedPassword);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Conta criada com sucesso! Por favor, verifique o seu email para confirmar.");
          setIsSignUp(false);
          setEmail("");
          setPassword("");
        }
      } else {
        // Login mode - validate email and password
        const validation = authSchema.safeParse({ email: trimmedEmail, password: trimmedPassword });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
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
        } else {
          console.log('✅ Login successful');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-natural px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-serif text-3xl font-bold text-center mb-6">
          {isPasswordReset ? "Definir Nova Password" : isRecovery ? "Recuperar Password" : isSignUp ? "Criar Conta" : "Login"}
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

        {isSignUp && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            Crie uma conta para aceder ao backoffice. Após criar a conta, contacte o administrador para receber permissões.
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
            {loading ? "A processar..." : isPasswordReset ? "Atualizar Password" : isRecovery ? "Enviar Email" : isSignUp ? "Criar Conta" : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center">
          {!isRecovery && !isSignUp && !isPasswordReset && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setPassword("");
                  setShowPassword(false);
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Não tem conta? Criar conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRecovery(true);
                  setPassword("");
                  setShowPassword(false);
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueceu a password?
              </button>
            </>
          )}

          {(isRecovery || isSignUp || isPasswordReset) && (
            <button
              type="button"
              onClick={() => {
                setIsRecovery(false);
                setIsSignUp(false);
                setIsPasswordReset(false);
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
