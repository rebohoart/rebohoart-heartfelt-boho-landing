import { Instagram } from "lucide-react";
import { Card } from "@/components/ui/card";

const Contact = () => {
  return (
    <main className="min-h-screen font-sans pt-20">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Vamos Conversar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entre em contacto connosco através do Instagram. Adoramos ouvir de si 
            e responder a todas as suas questões sobre os nossos produtos artesanais.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8">
            <Card className="p-8 md:p-12 text-center bg-gradient-warm">
              <div className="max-w-2xl mx-auto">
                <Instagram className="w-16 h-16 text-primary-foreground mx-auto mb-6" />
                <h2 className="font-serif text-3xl font-bold mb-4 text-primary-foreground">
                  Siga-nos no Instagram
                </h2>
                <p className="text-lg text-primary-foreground/90 mb-8">
                  O Instagram é a nossa casa. É onde partilhamos os nossos produtos, 
                  o processo criativo e onde pode fazer as suas encomendas através de mensagem direta.
                </p>
                <a
                  href="https://www.instagram.com/rebohoart/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-background text-foreground hover:bg-background/90 px-8 py-4 rounded-full font-semibold text-lg shadow-warm transition-all hover:scale-105"
                >
                  <Instagram className="w-6 h-6" />
                  <span>@rebohoart</span>
                </a>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-serif text-xl font-bold mb-4 text-center">
                  Como Fazer uma Encomenda
                </h3>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Siga-nos no Instagram @rebohoart</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Envie-nos uma mensagem direta (DM)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Diga-nos qual o produto que deseja</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>Confirmaremos disponibilidade e detalhes</span>
                  </li>
                </ol>
              </Card>

              <Card className="p-6">
                <h3 className="font-serif text-xl font-bold mb-4 text-center">
                  Encomendas Personalizadas
                </h3>
                <p className="text-muted-foreground mb-4">
                  Todos os nossos produtos podem ser personalizados de acordo com as suas 
                  preferências. Cores, tamanhos e detalhes especiais - basta perguntar!
                </p>
                <div className="bg-accent/30 p-4 rounded-lg">
                  <p className="text-sm text-foreground font-medium text-center">
                    ✨ Cada peça é feita à mão com amor<br />
                    🌿 Materiais sustentáveis e naturais<br />
                    🇵🇹 Criado em Portugal
                  </p>
                </div>
              </Card>
            </div>

            <Card className="p-8 text-center bg-accent/20">
              <h3 className="font-serif text-2xl font-bold mb-3">
                Pronto para começar?
              </h3>
              <p className="text-muted-foreground mb-6">
                Visite o nosso Instagram e descubra todas as nossas criações artesanais
              </p>
              <a
                href="https://www.instagram.com/rebohoart/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-warm transition-all hover:scale-105"
              >
                <Instagram className="w-5 h-5" />
                Visitar Instagram
              </a>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
