import { Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-10 px-4 bg-primary/5 border-t border-border">
      <div className="container mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href="https://www.instagram.com/rebohoart/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
          >
            <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">@rebohoart</span>
          </a>
          <a
            href="mailto:rebohoart@gmail.com"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
          >
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">rebohoart@gmail.com</span>
          </a>
          <a
            href="https://wa.me/351926258799?text=Ol%C3%A1%20ReBoho%21%20Tenho%20uma%20d%C3%BAvida.%20Consegues%20ajudar-me%2C%20por%20favor%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
          >
            <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">+351 926 258 799</span>
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Envios para Portugal Continental
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date().getFullYear()} ReBoho. Feito com ♥ em Portugal
        </p>
      </div>
    </footer>
  );
};

export default Footer;
