import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

interface DebugInfo {
  productsCount: number;
  activeProductsCount: number;
  products: any[];
  error?: string;
  userAuthenticated: boolean;
  isAdmin: boolean;
  userId?: string;
}

const Debug = () => {
  const { user, isAdmin, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    productsCount: 0,
    activeProductsCount: 0,
    products: [],
    userAuthenticated: false,
    isAdmin: false,
  });
  const [checking, setChecking] = useState(false);

  const checkDatabase = async () => {
    setChecking(true);
    try {
      // Verificar produtos
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (allError) throw allError;

      const activeProducts = allProducts?.filter(p => p.active) || [];

      setDebugInfo({
        productsCount: allProducts?.length || 0,
        activeProductsCount: activeProducts.length,
        products: allProducts || [],
        userAuthenticated: !!user,
        isAdmin: isAdmin,
        userId: user?.id,
      });

      toast.success("Verificação concluída!");
    } catch (error: any) {
      setDebugInfo({
        ...debugInfo,
        error: error.message,
        userAuthenticated: !!user,
        isAdmin: isAdmin,
        userId: user?.id,
      });
      toast.error("Erro ao verificar: " + error.message);
    } finally {
      setChecking(false);
    }
  };

  const insertTestProducts = async () => {
    try {
      const products = [
        {
          title: 'Macramé Wall Hanging',
          description: 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.',
          image: 'product-macrame-wall.jpg',
          images: ['product-macrame-wall.jpg'],
          price: 45.00,
          category: 'Wall Art',
          active: true,
        },
        {
          title: 'Ceramic Planter Set',
          description: 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.',
          image: 'product-ceramic-planter.jpg',
          images: ['product-ceramic-planter.jpg'],
          price: 38.00,
          category: 'Home Decor',
          active: true,
        },
        {
          title: 'Woven Storage Basket',
          description: 'Natural seagrass basket with organic patterns. Functional art for mindful living.',
          image: 'product-woven-basket.jpg',
          images: ['product-woven-basket.jpg'],
          price: 32.00,
          category: 'Storage',
          active: true,
        },
        {
          title: 'Abstract Canvas Art',
          description: 'Original painting on canvas featuring warm desert tones and organic shapes.',
          image: 'product-canvas-art.jpg',
          images: ['product-canvas-art.jpg'],
          price: 65.00,
          category: 'Wall Art',
          active: true,
        },
      ];

      const { error } = await supabase
        .from('products')
        .insert(products);

      if (error) throw error;

      toast.success("Produtos de teste inseridos!");
      checkDatabase();
    } catch (error: any) {
      toast.error("Erro ao inserir produtos: " + error.message);
      console.error("Erro completo:", error);
    }
  };

  useEffect(() => {
    if (!loading) {
      checkDatabase();
    }
  }, [loading, user]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-natural py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl font-bold mb-8">🔍 Debug - Base de Dados</h1>

          <div className="space-y-6">
            {/* Autenticação */}
            <Card className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">👤 Autenticação</h2>
              <div className="space-y-2">
                <p>
                  <strong>Utilizador autenticado:</strong>{" "}
                  {debugInfo.userAuthenticated ? "✅ Sim" : "❌ Não"}
                </p>
                {debugInfo.userId && (
                  <p>
                    <strong>User ID:</strong> {debugInfo.userId}
                  </p>
                )}
                <p>
                  <strong>É Admin:</strong> {debugInfo.isAdmin ? "✅ Sim" : "❌ Não"}
                </p>
                {!debugInfo.isAdmin && (
                  <p className="text-yellow-600 mt-2">
                    ⚠️ Precisa ser admin para inserir/editar produtos
                  </p>
                )}
              </div>
            </Card>

            {/* Produtos */}
            <Card className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">📦 Produtos</h2>

              {debugInfo.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Erro:</strong> {debugInfo.error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-3xl font-bold text-blue-600">{debugInfo.productsCount}</p>
                    <p className="text-sm text-muted-foreground">Total de produtos</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-3xl font-bold text-green-600">{debugInfo.activeProductsCount}</p>
                    <p className="text-sm text-muted-foreground">Produtos ativos</p>
                  </div>
                </div>

                {debugInfo.productsCount === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <p className="text-yellow-800 font-semibold mb-2">
                      ⚠️ Nenhum produto encontrado na base de dados!
                    </p>
                    <p className="text-sm text-yellow-700 mb-4">
                      Isso explica porque não vê produtos no site.
                    </p>
                    {debugInfo.isAdmin ? (
                      <Button onClick={insertTestProducts} variant="default">
                        Inserir Produtos de Teste
                      </Button>
                    ) : (
                      <p className="text-sm text-red-600">
                        ❌ Precisa fazer login como admin para inserir produtos
                      </p>
                    )}
                  </div>
                )}

                {debugInfo.productsCount > 0 && debugInfo.activeProductsCount === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <p className="text-yellow-800 font-semibold">
                      ⚠️ Existem produtos mas todos estão inativos (active = false)
                    </p>
                    <p className="text-sm text-yellow-700">
                      Os produtos não aparecem no site porque o frontend filtra por active = true
                    </p>
                  </div>
                )}

                {debugInfo.products.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Lista de Produtos:</h3>
                    <div className="space-y-2">
                      {debugInfo.products.map((product, index) => (
                        <div key={product.id} className="border rounded p-3 bg-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{index + 1}. {product.title}</p>
                              <p className="text-sm text-muted-foreground">{product.category} - €{product.price}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Imagem: {product.image} | Array: {product.images?.length || 0} imagens
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {product.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button onClick={checkDatabase} disabled={checking}>
                    {checking ? "A verificar..." : "🔄 Atualizar"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Variáveis de Ambiente */}
            <Card className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">⚙️ Configuração</h2>
              <div className="space-y-2">
                <p>
                  <strong>Supabase URL:</strong>{" "}
                  {import.meta.env.VITE_SUPABASE_URL ? "✅ Configurado" : "❌ Não configurado"}
                </p>
                <p>
                  <strong>Supabase Key:</strong>{" "}
                  {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✅ Configurado" : "❌ Não configurado"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Debug;
