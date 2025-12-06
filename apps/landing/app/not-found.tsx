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
import Link from "next/link";

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
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/95 to-background/10" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/95 via-background/10 to-transparent" />

      <Navbar />

      <div className="absolute top-1/2 w-full max-w-xl md:ml-48 -translate-y-1/2 px-6 space-y-8">
        <h1 className="text-3xl font-semibold text-foreground">
          Strona nie została znaleziona.
        </h1>
        <Button asChild>
          <Link href="/">Wróć do strony głównej</Link>
        </Button>
      </div>
    </section>
  );
}
