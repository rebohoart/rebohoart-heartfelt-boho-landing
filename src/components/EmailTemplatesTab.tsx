import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Save, Eye, EyeOff, Code } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  html_content: string;
  updated_at: string;
}

const TEMPLATE_LABELS: Record<string, { title: string; description: string }> = {
  custom_order_store: {
    title: "Email para Loja - Orçamento Personalizado",
    description: "Email enviado para a loja quando um cliente solicita um orçamento personalizado",
  },
  cart_order_store: {
    title: "Email para Loja - Encomenda",
    description: "Email enviado para a loja quando um cliente faz uma encomenda",
  },
  custom_order_customer: {
    title: "Email para Cliente - Confirmação de Orçamento",
    description: "Email de confirmação enviado ao cliente após solicitar um orçamento",
  },
  cart_order_customer: {
    title: "Email para Cliente - Confirmação de Encomenda",
    description: "Email de confirmação enviado ao cliente após fazer uma encomenda",
  },
};

const PREVIEW_VARIABLES: Record<string, string> = {
  customerName: "Maria Silva",
  customerEmail: "maria.silva@exemplo.com",
  details: "<p><strong>Produto:</strong> Retrato Personalizado</p><p><strong>Quantidade:</strong> 1</p><p><strong>Total:</strong> €45,00</p>",
  subject: "Nova Encomenda",
};

const applyPreviewVariables = (html: string): string => {
  let result = html;
  for (const [key, value] of Object.entries(PREVIEW_VARIABLES)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
};

const EmailTemplatesTab = () => {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({ subject: "", html_content: "" });
  const [saving, setSaving] = useState(false);
  const [showHtml, setShowHtml] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_type");
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const startEdit = (template: EmailTemplate) => {
    setPreviewTemplate(null);
    setEditingTemplate(template.template_type);
    setFormData({ subject: template.subject, html_content: template.html_content });
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setFormData({ subject: "", html_content: "" });
    setShowHtml(false);
  };

  const togglePreview = (templateType: string) => {
    setPreviewTemplate(previewTemplate === templateType ? null : templateType);
    setEditingTemplate(null);
  };

  const saveTemplate = async (templateType: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({ subject: formData.subject, html_content: formData.html_content })
        .eq("template_type", templateType);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template atualizado com sucesso!");
      cancelEdit();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao salvar template";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">A carregar templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Templates de Email</h3>
          <p className="text-sm text-blue-800">
            Personalize os emails. Variáveis disponíveis:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {["{​{customerName}}", "{​{customerEmail}}", "{​{details}}", "{​{subject}}"].map((v) => (
              <code key={v} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{v}</code>
            ))}
          </div>
        </div>
      </div>

      {templates.map((template) => {
        const isEditing = editingTemplate === template.template_type;
        const isPreviewing = previewTemplate === template.template_type;
        const label = TEMPLATE_LABELS[template.template_type];

        return (
          <Card key={template.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold">{label?.title || template.template_type}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{label?.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Assunto:</span> {template.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Atualizado:</span> {new Date(template.updated_at).toLocaleString("pt-PT")}
                  </p>
                </div>
                {!isEditing && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview(template.template_type)}
                    >
                      {isPreviewing ? (
                        <><EyeOff className="w-4 h-4 mr-1" /> Fechar</>
                      ) : (
                        <><Eye className="w-4 h-4 mr-1" /> Preview</>
                      )}
                    </Button>
                    <Button size="sm" onClick={() => startEdit(template)}>
                      Editar
                    </Button>
                  </div>
                )}
              </div>

              {/* Preview */}
              {isPreviewing && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Preview</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHtml(!showHtml)}
                      className="h-7 text-xs"
                    >
                      <Code className="w-3 h-3 mr-1" />
                      {showHtml ? "Ver renderizado" : "Ver HTML"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      (com dados de exemplo)
                    </span>
                  </div>

                  {showHtml ? (
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96 font-mono whitespace-pre-wrap border">
                      {template.html_content}
                    </pre>
                  ) : (
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      {/* Email client simulation bar */}
                      <div className="bg-white border-b px-4 py-2 text-xs text-muted-foreground flex gap-4">
                        <span><strong>De:</strong> ReBoho Art</span>
                        <span><strong>Assunto:</strong> {template.subject}</span>
                      </div>
                      <iframe
                        srcDoc={applyPreviewVariables(template.html_content)}
                        className="w-full min-h-96"
                        style={{ height: "500px" }}
                        sandbox="allow-same-origin"
                        title={`Preview: ${label?.title}`}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor={`subject-${template.template_type}`}>Assunto do Email</Label>
                    <Input
                      id={`subject-${template.template_type}`}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Assunto do email"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`content-${template.template_type}`}>Conteúdo HTML</Label>
                    <Textarea
                      id={`content-${template.template_type}`}
                      value={formData.html_content}
                      onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                      placeholder="Conteúdo HTML do email"
                      rows={15}
                      className="font-mono text-sm mt-1"
                    />
                  </div>

                  {/* Live preview while editing */}
                  <div>
                    <Label className="mb-2 block">Preview em tempo real</Label>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <div className="bg-white border-b px-4 py-2 text-xs text-muted-foreground">
                        <strong>Assunto:</strong> {formData.subject}
                      </div>
                      <iframe
                        srcDoc={applyPreviewVariables(formData.html_content)}
                        className="w-full"
                        style={{ height: "400px" }}
                        sandbox="allow-same-origin"
                        title="Preview em tempo real"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => saveTemplate(template.template_type)} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "A guardar..." : "Guardar"}
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default EmailTemplatesTab;
