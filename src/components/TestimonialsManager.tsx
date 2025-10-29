import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  active: boolean;
}

export const TestimonialsManager = () => {
  const queryClient = useQueryClient();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    text: "",
    active: true,
  });

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast.success("Testemunho atualizado!");
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([formData]);

        if (error) throw error;
        toast.success("Testemunho criado!");
      }

      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que quer eliminar este testemunho?")) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Testemunho eliminado!");
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ active: !testimonial.active })
        .eq('id', testimonial.id);

      if (error) throw error;
      toast.success(testimonial.active ? "Testemunho ocultado" : "Testemunho ativado");
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      active: testimonial.active,
    });
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: "",
      role: "",
      text: "",
      active: true,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form */}
      <Card className="p-6">
        <h2 className="font-serif text-2xl font-bold mb-4">
          {editingTestimonial ? "Editar Testemunho" : "Adicionar Testemunho"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Função/Papel</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="text">Testemunho</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              required
              rows={5}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Visível no site</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {editingTestimonial ? "Atualizar" : "Criar"}
            </Button>
            {editingTestimonial && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Testimonials List */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold">Testemunhos</h2>
        
        {isLoading ? (
          <p>A carregar...</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm mt-2 italic">"{testimonial.text}"</p>
                    <p className={`text-sm mt-2 ${testimonial.active ? 'text-green-600' : 'text-red-600'}`}>
                      {testimonial.active ? 'Visível' : 'Oculto'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleToggleActive(testimonial)}
                    >
                      <Switch checked={testimonial.active} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => startEdit(testimonial)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(testimonial.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
