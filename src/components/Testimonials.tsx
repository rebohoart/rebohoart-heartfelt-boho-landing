import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
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
  const autoplay = useRef(
    Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", slidesToScroll: 1 },
    [autoplay.current]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevEnabled(emblaApi.canScrollPrev());
    setNextEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-muted/40 overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-3 text-foreground">
            O que dizem as clientes
          </h2>
          {/* accent underline */}
          <div className="w-12 h-0.5 bg-accent mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground text-base">
            Peças que chegam a casa e ficam no coração
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex-[0_0_90%] md:flex-[0_0_48%] lg:flex-[0_0_38%] mx-3"
                >
                  <div className="bg-card rounded-2xl p-7 border border-border/50 shadow-soft h-full flex flex-col">
                    <Quote className="w-7 h-7 text-accent mb-4 flex-shrink-0" />
                    <p className="text-foreground/80 leading-relaxed italic flex-1 mb-6 text-sm md:text-base">
                      "{t.text}"
                    </p>
                    <div className="border-t border-border/50 pt-4">
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      {t.role && (
                        <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow buttons — desktop only */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!prevEnabled}
                aria-label="Testemunho anterior"
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-soft items-center justify-center text-foreground/60 hover:text-foreground hover:shadow-warm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextEnabled}
                aria-label="Próximo testemunho"
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-soft items-center justify-center text-foreground/60 hover:text-foreground hover:shadow-warm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-7">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                aria-label={`Ir para testemunho ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "w-5 h-2 bg-accent"
                    : "w-2 h-2 bg-muted hover:bg-accent/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;