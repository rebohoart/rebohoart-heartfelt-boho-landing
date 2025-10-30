import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().trim().min(6, { message: "Password deve ter pelo menos 6 caracteres" }).max(100),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (isRecovery) {
        // Password recovery mode - only validate email
        const emailValidation = z.string().trim().email({ message: "Email inválido" }).max(255).safeParse(email);
        if (!emailValidation.success) {
          toast.error(emailValidation.error.errors[0].message);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) {
          toast.error("Erro ao enviar email de recuperação");
        } else {
          toast.success("Email de recuperação enviado! Verifique a sua caixa de entrada.");
          setIsRecovery(false);
          setEmail("");
        }
      } else {
        // Login mode - validate email and password
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }

        const { error } = await signIn(email, password);
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
          {isRecovery ? "Recuperar Password" : "Login"}
        </h1>

        {isRecovery && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            Insira o seu email para receber um link de recuperação de password.
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "A processar..." : isRecovery ? "Enviar Email" : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRecovery(!isRecovery);
              setPassword("");
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isRecovery ? "Voltar ao login" : "Esqueceu a password?"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
