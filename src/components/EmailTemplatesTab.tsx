import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Save } from "lucide-react";

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

const EmailTemplatesTab = () => {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({ subject: "", html_content: "" });
  const [saving, setSaving] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type');

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const startEdit = (template: EmailTemplate) => {
    setEditingTemplate(template.template_type);
    setFormData({
      subject: template.subject,
      html_content: template.html_content,
    });
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setFormData({ subject: "", html_content: "" });
  };

  const saveTemplate = async (templateType: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: formData.subject,
          html_content: formData.html_content,
        })
        .eq('template_type', templateType);

      if (error) throw error;

      // Aguardar pela invalidação e refetch dos dados
      await queryClient.invalidateQueries({ queryKey: ['email-templates'] });

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
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Templates de Email</h3>
          <p className="text-sm text-blue-800">
            Personalize os emails enviados para a loja e para os clientes. Use as seguintes variáveis nos templates:
          </p>
          <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc space-y-1">
            <li><code className="bg-blue-100 px-1 rounded">{'{{customerName}}'}</code> - Nome do cliente</li>
            <li><code className="bg-blue-100 px-1 rounded">{'{{customerEmail}}'}</code> - Email do cliente</li>
            <li><code className="bg-blue-100 px-1 rounded">{'{{details}}'}</code> - Detalhes da encomenda/orçamento</li>
            <li><code className="bg-blue-100 px-1 rounded">{'{{subject}}'}</code> - Assunto do email</li>
          </ul>
        </div>
      </div>

      {templates.map((template) => {
        const isEditing = editingTemplate === template.template_type;
        const label = TEMPLATE_LABELS[template.template_type];

        return (
          <Card key={template.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold">{label?.title || template.template_type}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {label?.description || "Template de email"}
                </p>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`subject-${template.template_type}`}>Assunto do Email</Label>
                    <Input
                      id={`subject-${template.template_type}`}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Assunto do email"
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
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => saveTemplate(template.template_type)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "A guardar..." : "Guardar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Assunto</Label>
                    <p className="text-sm mt-1">{template.subject}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Última atualização</Label>
                    <p className="text-sm mt-1">
                      {new Date(template.updated_at).toLocaleString('pt-PT')}
                    </p>
                  </div>

                  <Button onClick={() => startEdit(template)}>
                    Editar Template
                  </Button>
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
