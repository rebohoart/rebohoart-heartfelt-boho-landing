import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  active: boolean;
  created_at: string;
}

const empty = { name: "", role: "", text: "", active: true };

const TestimonialsTab = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const startAdd = () => {
    setEditing(null);
    setForm(empty);
    setAdding(true);
  };

  const startEdit = (t: Testimonial) => {
    setAdding(false);
    setEditing(t);
    setForm({ name: t.name, role: t.role, text: t.text, active: t.active });
  };

  const cancel = () => {
    setAdding(false);
    setEditing(null);
    setForm(empty);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Nome e testemunho são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("testimonials")
          .update({ name: form.name, role: form.role, text: form.text, active: form.active, updated_at: new Date().toISOString() })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Testemunho atualizado!");
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert({ name: form.name, role: form.role, text: form.text, active: form.active });
        if (error) throw error;
        toast.success("Testemunho adicionado!");
      }
      invalidate();
      cancel();
    } catch {
      toast.error("Erro ao guardar. Tenta novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (t: Testimonial) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ active: !t.active, updated_at: new Date().toISOString() })
        .eq("id", t.id);
      if (error) throw error;
      invalidate();
    } catch {
      toast.error("Erro ao atualizar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tens a certeza que queres eliminar este testemunho?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast.success("Testemunho eliminado.");
      invalidate();
    } catch {
      toast.error("Erro ao eliminar.");
    }
  };

  const showForm = adding || !!editing;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold">Testemunhos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Apenas os testemunhos ativos aparecem no site.
          </p>
        </div>
        {!showForm && (
          <Button onClick={startAdd} className="gap-2 rounded-full">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 mb-6 border-primary/30">
          <h3 className="font-serif text-lg font-semibold mb-4">
            {editing ? "Editar testemunho" : "Novo testemunho"}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="t-name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="t-name"
                  placeholder="Ex: Ana M., Lisboa"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-role">
                  Contexto{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                  id="t-role"
                  placeholder="Ex: Comprou um macramé de parede"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-text">
                Testemunho <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="t-text"
                placeholder="O que a cliente disse sobre a peça ou a experiência..."
                rows={3}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="t-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label htmlFor="t-active" className="cursor-pointer">
                Visível no site
              </Label>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-full">
                <Check className="w-4 h-4" />
                {saving ? "A guardar..." : "Guardar"}
              </Button>
              <Button variant="outline" onClick={cancel} className="gap-2 rounded-full">
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">A carregar...</p>
      ) : testimonials.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Ainda não há testemunhos. Adiciona o primeiro!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              className={`p-4 flex items-start gap-4 ${!t.active ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  {t.role && (
                    <span className="text-xs text-muted-foreground">· {t.role}</span>
                  )}
                  {!t.active && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      oculto
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/80 italic line-clamp-2">"{t.text}"</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Switch
                  checked={t.active}
                  onCheckedChange={() => handleToggle(t)}
                  aria-label="Visível no site"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEdit(t)}
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(t.id)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsTab;
