import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Upload, X } from "lucide-react";
import { validateImageFile } from "@/lib/sanitize";
import Dashboard from "@/components/Dashboard";
import EmailTemplatesTab from "@/components/EmailTemplatesTab";
import AIImageGenerator from "@/components/AIImageGenerator";

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  category: string;
  active: boolean;
}

interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

interface Logo {
  id: string;
  url: string;
  is_active: boolean;
  created_at: string;
}

const Backoffice = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    images: "",
    price: 0,
    category: "",
    active: true,
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user && isAdmin,
  });

  const { data: logos = [], isLoading: logosLoading } = useQuery({
    queryKey: ['logos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Logo[];
    },
    enabled: !!user && isAdmin,
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];
    let hasErrors = false;

    try {
      for (const file of Array.from(files)) {
        // Validate file before upload
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          toast.error(validation.error || "Ficheiro inválido");
          hasErrors = true;
          continue; // Skip this file and continue with others
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('📤 Uploading file:', fileName);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          toast.error(`Erro ao carregar ${file.name}: ${uploadError.message}`);
          hasErrors = true;
          continue;
        }

        console.log('✅ Upload successful:', uploadData);

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        console.log('🔗 Public URL:', publicUrl);
        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setUploadedImages([...uploadedImages, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} imagem(ns) carregada(s) com sucesso!`);
      } else if (hasErrors) {
        toast.error("Nenhuma imagem foi carregada devido a erros.");
      }
    } catch (error: unknown) {
      console.error('❌ Unexpected error during upload:', error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar imagens: ${message}`);
    } finally {
      setUploading(false);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const imagesArray = uploadedImages.length > 0 ? uploadedImages : [formData.image];
      const mainImage = uploadedImages.length > 0 ? uploadedImages[0] : formData.image;

      const productData = {
        title: formData.title,
        description: formData.description,
        image: mainImage,
        images: imagesArray,
        price: formData.price,
        category: formData.category,
        active: formData.active,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success("Produto criado!");
      }

      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao processar pedido";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que quer eliminar este produto?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Produto eliminado!");
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao eliminar produto";
      toast.error(message);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', product.id);

      if (error) throw error;
      toast.success(product.active ? "Produto ocultado" : "Produto ativado");
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar produto";
      toast.error(message);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      image: product.image,
      images: product.images ? product.images.join('\n') : product.image,
      price: product.price,
      category: product.category,
      active: product.active,
    });
    setUploadedImages(product.images || [product.image]);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      images: "",
      price: 0,
      category: "",
      active: true,
    });
    setUploadedImages([]);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);

    try {
      // Validate file before upload
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || "Ficheiro inválido");
        setLogoUploading(false);
        e.target.value = '';
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('📤 Uploading logo:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Logo upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Logo upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('🔗 Logo public URL:', publicUrl);

      // Add logo to logos table (not active by default)
      const { error: insertError } = await supabase
        .from('logos')
        .insert({
          url: publicUrl,
          is_active: false
        });

      if (insertError) {
        console.error('❌ Error inserting logo:', insertError);
        throw insertError;
      }

      console.log('✅ Logo added to gallery');

      queryClient.invalidateQueries({ queryKey: ['logos'] });
      toast.success("Logo adicionado à galeria!");
    } catch (error: unknown) {
      console.error('❌ Unexpected error during logo upload:', error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar logo: ${message}`);
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleSetActiveLogo = async (logoId: string) => {
    try {
      const { error } = await supabase
        .from('logos')
        .update({ is_active: true })
        .eq('id', logoId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['logos'] });
      toast.success("Logo ativo atualizado!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao ativar logo: ${message}`);
    }
  };

  const handleDeleteLogo = async (logoId: string, logoUrl: string) => {
    if (!confirm("Tem a certeza que quer eliminar este logo?")) return;

    try {
      // Extract filename from URL
      const urlParts = logoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([fileName]);

      if (storageError) {
        console.error('⚠️ Error deleting from storage:', storageError);
        // Continue anyway, as the file might not exist
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('logos')
        .delete()
        .eq('id', logoId);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['logos'] });
      toast.success("Logo eliminado!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao eliminar logo: ${message}`);
    }
  };

  if (loading || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-natural py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-4xl font-bold">Backoffice</h1>
          <Button onClick={signOut} variant="outline">
            Sair
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="ai-images">Geração IA</TabsTrigger>
            <TabsTrigger value="emails">Templates de Email</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-4">
                    {editingProduct ? "Editar Produto" : "Adicionar Produto"}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image-upload">Imagens do Produto</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                    aria-label="Upload de imagens do produto"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {uploading ? "A carregar..." : "Clique para adicionar imagens"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      A primeira imagem será a principal
                    </p>
                  </label>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Imagem do produto ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-border"
                        />
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                          {index === 0 ? "Principal" : index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remover imagem ${index + 1}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="price">Preço (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
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
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
                {editingProduct && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold">Produtos</h2>
            
            {isLoading ? (
              <p>A carregar...</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-sm font-bold text-primary mt-1">
                          €{product.price.toFixed(2)}
                        </p>
                        <p className={`text-sm mt-2 ${product.active ? 'text-green-600' : 'text-red-600'}`}>
                          {product.active ? 'Visível' : 'Oculto'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleToggleActive(product)}
                        >
                          <Switch checked={product.active} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => startEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
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
        </Card>
          </TabsContent>

          <TabsContent value="ai-images">
            <Card className="p-6">
              <AIImageGenerator />
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-6">Templates de Email</h2>
              <EmailTemplatesTab />
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-6">Configurações do Site</h2>

              <div className="space-y-6">
                {/* Logo Section */}
                <div>
                  <Label htmlFor="logo-upload" className="text-lg font-semibold">Galeria de Logos</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload de logos e escolha qual deve aparecer no site.
                  </p>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={logoUploading}
                      aria-label="Upload do logo"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer block">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        {logoUploading ? "A carregar..." : "Clique para adicionar um novo logo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formatos aceites: PNG, JPG, SVG (recomendado: fundo transparente)
                      </p>
                    </label>
                  </div>

                  {/* Logos Gallery */}
                  {logosLoading ? (
                    <p className="text-center text-muted-foreground">A carregar logos...</p>
                  ) : logos.length === 0 ? (
                    <div className="p-8 border border-dashed border-border rounded-lg text-center">
                      <p className="text-muted-foreground">
                        Nenhum logo na galeria. Faça upload do primeiro logo acima.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Logos Disponíveis</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {logos.map((logo) => (
                          <Card key={logo.id} className={`p-4 relative ${logo.is_active ? 'ring-2 ring-primary' : ''}`}>
                            {logo.is_active && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                                Ativo
                              </div>
                            )}
                            <div className="aspect-square flex items-center justify-center mb-3 bg-muted rounded-md p-4">
                              <img
                                src={logo.url}
                                alt="Logo"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="flex gap-2">
                              {!logo.is_active && (
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleSetActiveLogo(logo.id)}
                                >
                                  Ativar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className={logo.is_active ? 'flex-1' : ''}
                                onClick={() => handleDeleteLogo(logo.id, logo.url)}
                                disabled={logo.is_active}
                                title={logo.is_active ? 'Não pode eliminar o logo ativo' : 'Eliminar logo'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Backoffice;
