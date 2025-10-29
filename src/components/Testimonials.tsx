import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  active: boolean;
}

const Testimonials = () => {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Testimonial[];
    },
  });
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
