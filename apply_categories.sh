#!/bin/bash
set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
echo "📁 Repositório: $REPO_ROOT"

# ─── 1. Migração SQL ───────────────────────────────────────────────────────
echo "📄 A copiar migração..."
cp "$(dirname "$0")/20250312000000_create_categories.sql" \
   "$REPO_ROOT/supabase/migrations/20250312000000_create_categories.sql"
echo "   ✅ supabase/migrations/20250312000000_create_categories.sql"

# ─── 2. CategoriesTab.tsx ──────────────────────────────────────────────────
echo "📄 A copiar CategoriesTab..."
cp "$(dirname "$0")/CategoriesTab.tsx" \
   "$REPO_ROOT/src/components/CategoriesTab.tsx"
echo "   ✅ src/components/CategoriesTab.tsx"

# ─── 3. ProductHighlights.tsx ─────────────────────────────────────────────
echo "📄 A copiar ProductHighlights..."
cp "$(dirname "$0")/ProductHighlights.tsx" \
   "$REPO_ROOT/src/components/ProductHighlights.tsx"
echo "   ✅ src/components/ProductHighlights.tsx"

# ─── 4. Backoffice.tsx patches via Python ─────────────────────────────────
echo "🔧 A aplicar patches no Backoffice.tsx..."

python3 - <<'PYEOF'
import re, sys

path = "src/pages/Backoffice.tsx"

with open(path, "r") as f:
    src = f.read()

original = src

# PATCH 1 — imports
old = 'import Dashboard from "@/components/Dashboard";\nimport EmailTemplatesTab from "@/components/EmailTemplatesTab";'
new = '''import Dashboard from "@/components/Dashboard";
import EmailTemplatesTab from "@/components/EmailTemplatesTab";
import CategoriesTab from "@/components/CategoriesTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";'''
if old in src:
    src = src.replace(old, new, 1)
    print("   ✅ PATCH 1: imports adicionados")
else:
    print("   ⚠️  PATCH 1: bloco não encontrado (talvez já aplicado)")

# PATCH 2 — query de categorias (inserir antes da query de logos)
old2 = '  const { data: logos = [], isLoading: logosLoading } = useQuery({'
new2 = '''  const { data: adminCategories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    enabled: !!user && isAdmin,
  });

  const { data: logos = [], isLoading: logosLoading } = useQuery({'''
if old2 in src:
    src = src.replace(old2, new2, 1)
    print("   ✅ PATCH 2: query de categorias adicionada")
else:
    print("   ⚠️  PATCH 2: bloco não encontrado (talvez já aplicado)")

# PATCH 3 — Input categoria → Select
old3 = '''              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>'''
new3 = '''              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecionar categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {adminCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {adminCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cria categorias no tab "Categorias" antes de associar produtos.
                  </p>
                )}
              </div>'''
if old3 in src:
    src = src.replace(old3, new3, 1)
    print("   ✅ PATCH 3: campo categoria → Select")
else:
    print("   ⚠️  PATCH 3: bloco não encontrado (talvez já aplicado)")

# PATCH 4 — TabsList
old4 = '''          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="emails">Templates de Email</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>'''
new4 = '''          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="emails">Templates de Email</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>'''
if old4 in src:
    src = src.replace(old4, new4, 1)
    print("   ✅ PATCH 4: tab Categorias adicionado à TabsList")
else:
    print("   ⚠️  PATCH 4: bloco não encontrado (talvez já aplicado)")

# PATCH 5 — TabsContent categorias (inserir antes do tab emails)
old5 = '          <TabsContent value="emails">'
new5 = '''          <TabsContent value="categories">
            <Card className="p-6">
              <CategoriesTab />
            </Card>
          </TabsContent>

          <TabsContent value="emails">'''
if old5 in src:
    src = src.replace(old5, new5, 1)
    print("   ✅ PATCH 5: TabsContent Categorias adicionado")
else:
    print("   ⚠️  PATCH 5: bloco não encontrado (talvez já aplicado)")

if src == original:
    print("\n⚠️  Nenhum patch foi aplicado. Verifica se o ficheiro já tem as alterações.")
else:
    with open(path, "w") as f:
        f.write(src)
    print("\n   ✅ Backoffice.tsx guardado!")
PYEOF

# ─── 5. supabase db push ───────────────────────────────────────────────────
echo ""
echo "🗄️  A aplicar migração na base de dados..."
cd "$REPO_ROOT"
supabase db push
echo "   ✅ Migração aplicada!"

# ─── 6. git commit & push ─────────────────────────────────────────────────
echo ""
echo "🚀 A fazer commit e push..."
git add \
  supabase/migrations/20250312000000_create_categories.sql \
  src/components/CategoriesTab.tsx \
  src/components/ProductHighlights.tsx \
  src/pages/Backoffice.tsx

git commit -m "feat: filtro por categoria na loja + gestão de categorias no backoffice"
git push

echo ""
echo "✅ Tudo feito!"
echo "   → Backoffice: tab 'Categorias' para criar/apagar categorias"
echo "   → Backoffice: campo categoria agora é um Select"
echo "   → Loja: botões de filtro por categoria acima dos produtos"
