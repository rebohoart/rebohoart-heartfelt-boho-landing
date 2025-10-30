import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-primary/5 border-t border-border">
      <div className="container mx-auto">
        <div className="flex justify-center items-center">
          <a 
            href="https://www.instagram.com/rebohoart/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
          >
            <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">@rebohoart</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
