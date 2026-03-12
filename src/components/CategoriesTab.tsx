import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

const CategoriesTab = () => {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;

    setAdding(true);
    try {
      const { error } = await supabase.from("categories").insert({ name });
      if (error) throw error;
      toast.success(`Categoria "${name}" criada!`);
      setNewCategory("");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar categoria";
      if (message.includes("unique") || message.includes("duplicate")) {
        toast.error("Já existe uma categoria com esse nome.");
      } else {
        toast.error(message);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Eliminar a categoria "${category.name}"? Os produtos associados ficam sem categoria.`)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (error) throw error;
      toast.success(`Categoria "${category.name}" eliminada!`);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao eliminar";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1">Categorias</h2>
        <p className="text-sm text-muted-foreground">
          Gere as categorias disponíveis para os produtos. Estas categorias aparecem como filtros na loja.
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="new-category" className="sr-only">Nova categoria</Label>
          <Input
            id="new-category"
            placeholder="Nome da categoria (ex: Pinturas)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={adding}
          />
        </div>
        <Button type="submit" disabled={adding || !newCategory.trim()}>
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </form>

      {/* Categories list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">A carregar...</p>
      ) : categories.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <p className="text-muted-foreground text-sm">Nenhuma categoria criada ainda.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-4 flex items-center justify-between">
              <span className="font-medium">{cat.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(cat)}
                aria-label={`Eliminar ${cat.name}`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesTab;
