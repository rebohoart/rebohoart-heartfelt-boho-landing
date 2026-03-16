// src/components/AboutMe.tsx

const AboutMe = () => {
  return (
    <section id="sobre" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Foto */}
          <div className="w-full md:w-2/5 flex-shrink-0 animate-fade-in">
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-warm bg-muted flex items-center justify-center">
                {/* 
                  SUBSTITUIR: Coloca aqui o caminho para a tua foto.
                  Exemplo: src="/images/catarina.jpg"
                  A foto ideal é vertical (4:5), com luz natural, mãos visíveis a trabalhar.
                */}
                <div className="w-full h-full bg-gradient-natural flex items-center justify-center">
                  <p className="text-muted-foreground text-sm text-center px-6">
                    A tua foto aqui
                  </p>
                </div>
              </div>
              {/* Detalhe decorativo */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/10 -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-secondary/10 -z-10" />
            </div>
          </div>

          {/* Texto */}
          <div className="w-full md:w-3/5 animate-fade-in-up space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              ReBoho
            </h2>

            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Do apelido <em>Rebocho</em> nasce <em>ReBoho</em> — e dentro do nome está tudo:{" "}
                o <em>re</em> de recriar, de retratar, de respirar.{" "}
                O <em>boho</em> de livre, natural, autêntico.
              </p>

              <p className="font-medium text-foreground">
                Sou a Catarina. Faço tudo à mão — pinturas, macramé, retratos.{" "}
                Peças com alma, para quem escolhe viver com intenção.
              </p>
            </div>

            {/* Linha decorativa */}
            <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutMe;