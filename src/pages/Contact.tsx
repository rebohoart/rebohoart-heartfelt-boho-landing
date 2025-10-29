import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Instagram, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  subject: z.string().trim().min(1, "Assunto é obrigatório").max(200, "Assunto muito longo"),
  message: z.string().trim().min(10, "Mensagem muito curta").max(1000, "Mensagem muito longa"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact = () => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    const whatsappMessage = encodeURIComponent(
      `Nome: ${data.name}\nEmail: ${data.email}\nAssunto: ${data.subject}\n\nMensagem:\n${data.message}`
    );

    window.open(`https://wa.me/351912345678?text=${whatsappMessage}`, "_blank");

    toast.success("Obrigado! Redirecionando para WhatsApp...");
    form.reset();
  };

  return (
    <main className="min-h-screen font-sans pt-20">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Vamos Conversar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tem alguma questão ou gostaria de fazer uma encomenda personalizada? 
            Adoramos ouvir de si. Preencha o formulário ou contacte-nos diretamente.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8">
                <h2 className="font-serif text-2xl font-bold mb-6">
                  Envie-nos uma Mensagem
                </h2>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="O seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seuemail@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assunto</FormLabel>
                          <FormControl>
                            <Input placeholder="Como podemos ajudar?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o seu pedido ou questão..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg shadow-warm"
                    >
                      Enviar via WhatsApp
                    </Button>
                  </form>
                </Form>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-serif text-xl font-bold mb-4">
                  Informações de Contacto
                </h3>
                <div className="space-y-4">
                  <a
                    href="mailto:hello@rebohoart.com"
                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Mail className="w-5 h-5 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm">hello@rebohoart.com</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/351912345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <MessageCircle className="w-5 h-5 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-foreground">WhatsApp</p>
                      <p className="text-sm">+351 912 345 678</p>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com/rebohoart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Instagram className="w-5 h-5 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-foreground">Instagram</p>
                      <p className="text-sm">@rebohoart</p>
                    </div>
                  </a>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-serif text-xl font-bold mb-4">
                  Localização
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Portugal</p>
                      <p className="text-sm">Envios para toda a Europa</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Horário</p>
                      <p className="text-sm">Seg-Sex: 9h-18h</p>
                      <p className="text-sm">Sáb: 10h-14h</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-warm text-primary-foreground">
                <h3 className="font-serif text-xl font-bold mb-2">
                  Encomendas Personalizadas
                </h3>
                <p className="text-sm text-primary-foreground/90">
                  Todos os nossos produtos podem ser personalizados. Entre em contacto 
                  connosco para criar algo único para o seu espaço.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
