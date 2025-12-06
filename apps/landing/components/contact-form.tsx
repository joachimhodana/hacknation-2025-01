"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Symulacja wysyłania - w rzeczywistości tutaj byłoby API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Zapis do localStorage, które będzie dostępne w admin panelu
    const contactSubmission = {
      id: Date.now().toString(),
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "new",
    };

    // Pobierz istniejące zgłoszenia
    const existingSubmissions = JSON.parse(
      localStorage.getItem("contactSubmissions") || "[]"
    );
    existingSubmissions.push(contactSubmission);
    localStorage.setItem(
      "contactSubmissions",
      JSON.stringify(existingSubmissions)
    );

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset formularza
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    // Reset komunikatu po 5 sekundach
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <Card className="border border-border/70 bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Mail className="h-5 w-5 text-primary" />
          Skontaktuj się z nami
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Wypełnij formularz, a odpowiemy tak szybko, jak to możliwe.
        </p>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Wiadomość wysłana!</h3>
              <p className="text-sm text-muted-foreground">
                Dziękujemy za kontakt. Odpowiemy wkrótce.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Jan Kowalski"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="jan.kowalski@example.com"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Temat *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Temat wiadomości"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Wiadomość *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Twoja wiadomość..."
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Wyślij wiadomość
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

