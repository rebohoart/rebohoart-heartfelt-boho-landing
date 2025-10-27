import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sofia M.",
    role: "Interior Designer",
    text: "The macramé wall hanging transformed my living room. You can feel the love and craftsmanship in every knot. It's not just décor—it's a conversation piece that brings such warmth to the space.",
  },
  {
    name: "João P.",
    role: "Boho Lifestyle Enthusiast",
    text: "I've been following Rebohoart for months, and finally bought three pieces for my home. The quality is exceptional, and knowing each piece is handmade makes them even more special. Truly meaningful décor!",
  },
  {
    name: "Mariana L.",
    role: "Sustainable Living Advocate",
    text: "Finding artisans who care about sustainability AND beauty is rare. Rebohoart delivers both. The ceramic planters are stunning, and I love that they're made with ethical materials. Highly recommend!",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            What Our Community Says
          </h2>
          <p className="text-lg text-muted-foreground">
            Join the growing family of boho art lovers who've brought meaning home
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="border-border/50 shadow-soft hover:shadow-warm transition-all duration-300 bg-card animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                
                <p className="text-foreground/90 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Featured in local designer markets · Trusted by the Instagram boho community
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
