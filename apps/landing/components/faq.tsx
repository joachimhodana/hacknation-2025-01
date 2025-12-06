import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInView } from "@/lib/hooks";
import { RoughNotation } from "react-rough-notation";

const faqs = [
  {
    question: "Ile zajmuje rozpoczęcie korzystania z aplikacji?",
    answer:
      "Instalujesz aplikację, wybierasz trasę i możesz ruszać od razu. Nie trzeba żadnej konfiguracji — wszystko działa od pierwszego uruchomienia.",
  },
  {
    question: "Czy potrzebuję internetu podczas zwiedzania?",
    answer:
      "Nie zawsze. Mapy i trasy zapisują się w pamięci, więc najważniejsze funkcje działają nawet offline. Ciekawostki i multimedia dograją się, gdy wrócisz do zasięgu.",
  },
  {
    question: "Czy aplikacja jest darmowa?",
    answer: "Tak. Korzystanie z podstawowych tras jest bezpłatne.",
  },
  {
    question: "Czy aplikacja nadaje się dla turystów i mieszkańców?",
    answer:
      "Tak. Turyści odkrywają miasto po raz pierwszy, a mieszkańcy poznają miejsca i historie, o których często nie mieli pojęcia.",
  },
  {
    question: "Czy BydGO jest przyjazne osobom z niepełnosprawnościami?",
    answer:
      "Tak. Obsługujemy lektora, tryb wysokiego kontrastu i wskazówki głosowe, a trasy są projektowane z myślą o różnych potrzebach użytkowników.",
  },
];

export default function FAQ() {
  const { ref: headingRef, isInView } = useInView<HTMLHeadingElement>();

  return (
    <section id="faq" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8 px-6 md:px-8 lg:px-0">
        <div className="space-y-6 text-center">
          <h2 ref={headingRef} className="text-2xl font-semibold md:text-3xl text-primary">
            <RoughNotation type="underline" show={isInView}>
              Najczęściej zadawane pytania
            </RoughNotation>
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Odpowiadamy na najważniejsze wątpliwości dotyczące działania
            aplikacji.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm md:text-base data-[state=open]:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
