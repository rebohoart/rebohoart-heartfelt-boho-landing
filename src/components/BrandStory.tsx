import { Heart, Leaf, Sparkles } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Made with Heart",
    description: "Every piece is crafted with intention, care, and genuine passion for the art of handmade creation.",
  },
  {
    icon: Leaf,
    title: "Sustainable Materials",
    description: "We use natural, eco-friendly materials—from organic cotton to reclaimed wood—honoring the earth in every creation.",
  },
  {
    icon: Sparkles,
    title: "Meaningful Décor",
    description: "Our art tells stories. Each piece invites you to slow down and connect with the beauty of intentional living.",
  },
];

const BrandStory = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-accent/30 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Story Content */}
          <div className="animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Our Story
            </h2>
            
            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <p className="text-lg">
                Rebohoart was born from a deep love of natural beauty and the art of slow creation. 
                What started as a personal passion for weaving, painting, and crafting with sustainable 
                materials has grown into a heartfelt mission: to bring meaningful, handmade art into homes 
                that value authenticity.
              </p>
              
              <p className="text-lg">
                Each piece we create carries intention. We believe your space should tell your story—filled 
                with objects that connect you to nature, inspire calm, and celebrate the beauty of things 
                made by hand, with time, care, and heart.
              </p>
              
              <p className="text-lg font-medium text-primary">
                Welcome to the Rebohoart family. Let's fill your home with pieces that speak to your soul.
              </p>
            </div>
          </div>
          
          {/* Values */}
          <div className="space-y-6 animate-fade-in-up">
            {values.map((value, index) => (
              <div 
                key={index}
                className="flex gap-4 p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 shadow-soft hover:shadow-warm transition-all duration-300 hover:-translate-x-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
