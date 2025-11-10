-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on template_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read templates (needed by edge function)
CREATE POLICY "Allow public read access to email_templates"
  ON email_templates FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only authenticated users can update templates
CREATE POLICY "Allow authenticated users to update email_templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default templates
INSERT INTO email_templates (template_type, subject, html_content) VALUES
(
  'custom_order_store',
  'Novo Pedido de Orcamento - Peca Personalizada',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      .info-block { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #D4A574; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      h1 { margin: 0; font-size: 24px; }
      h2 { color: #D4A574; font-size: 18px; margin-top: 0; }
      .label { font-weight: bold; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>{{subject}}</h1>
      </div>
      <div class="content">
        <h2>Detalhes do Pedido de Orcamento</h2>
        <div class="info-block">
          <p><span class="label">Cliente:</span> {{customerName}}</p>
          <p><span class="label">Email:</span> {{customerEmail}}</p>
        </div>
        <h2>Descricao da Peca</h2>
        <div class="info-block">
          {{details}}
        </div>
      </div>
      <div class="footer">
        <p>ReBoho Art - Email automatico do sistema</p>
      </div>
    </div>
  </body>
</html>'
),
(
  'cart_order_store',
  'Nova Encomenda ReBoho',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      .info-block { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #D4A574; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      h1 { margin: 0; font-size: 24px; }
      h2 { color: #D4A574; font-size: 18px; margin-top: 0; }
      .label { font-weight: bold; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>{{subject}}</h1>
      </div>
      <div class="content">
        <h2>Detalhes da Encomenda</h2>
        <div class="info-block">
          <p><span class="label">Cliente:</span> {{customerName}}</p>
          <p><span class="label">Email:</span> {{customerEmail}}</p>
        </div>
        <h2>Produtos</h2>
        <div class="info-block">
          {{details}}
        </div>
      </div>
      <div class="footer">
        <p>ReBoho Art - Email automatico do sistema</p>
      </div>
    </div>
  </body>
</html>'
),
(
  'custom_order_customer',
  'Pedido de Orcamento Recebido - ReBoho Art',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      h1 { margin: 0; font-size: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Pedido de Orcamento Recebido!</h1>
      </div>
      <div class="content">
        <p>Ola {{customerName}},</p>
        <p>Recebemos o teu pedido de orcamento para uma peca personalizada!</p>
        <p>Vamos analisar o teu pedido e entraremos em contacto contigo em breve.</p>
        <p>Com carinho,<br><strong>ReBoho Art</strong></p>
      </div>
    </div>
  </body>
</html>'
),
(
  'cart_order_customer',
  'Encomenda Recebida - ReBoho Art',
  '<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
      h1 { margin: 0; font-size: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Obrigada pela tua encomenda!</h1>
      </div>
      <div class="content">
        <p>Ola {{customerName}},</p>
        <p>Recebemos a tua encomenda com sucesso!</p>
        <p>Iremos entrar em contacto contigo brevemente com informacoes de pagamento e envio.</p>
        <p>Com carinho,<br><strong>ReBoho Art</strong></p>
      </div>
    </div>
  </body>
</html>'
)
ON CONFLICT (template_type) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();
