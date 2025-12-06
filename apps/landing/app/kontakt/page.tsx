"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
} from "@/components/ui/input-group";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { MailIcon, UserIcon } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Wpisz poprawne imię"),
  email: z.string().email("Niepoprawny adres email"),
  message: z.string().min(10, "Wiadomość musi mieć przynajmniej 10 znaków"),
});

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error();

      setStatus("success");
      form.reset();
    } catch (e) {
      setStatus("error");
    }
  }

  return (
    <section className="relative min-h-screen w-full bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bydgoszcz.jpg')" }}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <Navbar />

      <div className="absolute top-1/2 left-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 px-6">
        <div
          className="
            bg-background/50 backdrop-blur-xl rounded-3xl border border-border 
            shadow-[0_8px_30px_rgba(0,0,0,0.08)] 
            p-8 md:p-10 space-y-8
          "
        >
          <h1 className="text-3xl font-semibold text-white">
            Skontaktuj się z nami
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Imię</FormLabel>
                    <FormControl>
                      <InputGroup className="bg-background/25">
                        <InputGroupInput
                          type="text"
                          placeholder="Twoje imię"
                          className="placeholder:text-white/75"
                          {...field}
                        />
                        <InputGroupAddon>
                          <UserIcon className="text-white/50" />
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Email</FormLabel>
                    <FormControl>
                      <InputGroup className="bg-background/25">
                        <InputGroupInput
                          type="email"
                          placeholder="Twój adres email"
                          className="placeholder:text-white/75"
                          {...field}
                        />
                        <InputGroupAddon>
                          <MailIcon className="text-white/50" />
                        </InputGroupAddon>
                      </InputGroup>
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
                    <FormLabel className="text-white/80">Wiadomość</FormLabel>
                    <FormControl>
                      <InputGroup className="bg-background/25">
                        <InputGroupTextarea
                          placeholder="Napisz nam, jak możemy pomóc..."
                          className="min-h-[140px] placeholder:text-white/75"
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CTA */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground font-semibold"
              >
                Wyślij wiadomość
              </Button>

              {status === "success" && (
                <p className="text-sm text-green-600">
                  Wiadomość wysłana pomyślnie!
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-600">
                  Wystąpił błąd. Spróbuj ponownie.
                </p>
              )}
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
