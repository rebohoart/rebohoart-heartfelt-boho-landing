import { useState } from "react";
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

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Trim email and password to remove whitespace
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (isRecovery) {
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

        const { error } = await signIn(trimmedEmail, trimmedPassword);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error("Email ou password incorretos");
          } else {
            toast.error(error.message);
          }
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
          {isRecovery ? "Recuperar Password" : isSignUp ? "Criar Conta" : "Login"}
        </h1>

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

          {!isRecovery && (
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

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "A processar..." : isRecovery ? "Enviar Email" : isSignUp ? "Criar Conta" : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center">
          {!isRecovery && !isSignUp && (
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

          {(isRecovery || isSignUp) && (
            <button
              type="button"
              onClick={() => {
                setIsRecovery(false);
                setIsSignUp(false);
                setPassword("");
                setShowPassword(false);
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
