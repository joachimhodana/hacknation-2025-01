import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react"

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  submittedAt: string
  status: "new" | "read" | "archived"
}

export function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">("all")

  useEffect(() => {
    loadSubmissions()
    // Odśwież co 5 sekund, aby zobaczyć nowe zgłoszenia
    const interval = setInterval(loadSubmissions, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadSubmissions = () => {
    const stored = localStorage.getItem("contactSubmissions")
    if (stored) {
      const parsed = JSON.parse(stored)
      setSubmissions(
        parsed.sort(
          (a: ContactSubmission, b: ContactSubmission) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
      )
    }
  }

  const updateSubmissionStatus = (id: string, status: ContactSubmission["status"]) => {
    const updated = submissions.map((s) => (s.id === id ? { ...s, status } : s))
    setSubmissions(updated)
    localStorage.setItem("contactSubmissions", JSON.stringify(updated))
    if (selectedSubmission?.id === id) {
      setSelectedSubmission({ ...selectedSubmission, status })
    }
  }

  const deleteSubmission = (id: string) => {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem("contactSubmissions", JSON.stringify(updated))
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(null)
    }
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "all") return true
    return s.status === filter
  })

  const newCount = submissions.filter((s) => s.status === "new").length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zgłoszenia kontaktowe</h1>
        <p className="text-muted-foreground">
          Przegląd wiadomości przesłanych przez formularz kontaktowy
        </p>
      </div>

      {/* Niebieska wstawka -> na tokeny */}
      <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-2">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Zgłoszenia z formularza kontaktowego
            </h3>
            <p className="text-sm text-muted-foreground">
              Tutaj znajdziesz wszystkie wiadomości przesłane przez użytkowników z sekcji kontaktowej
              strony landing. Nowe zgłoszenia są automatycznie odświeżane.
            </p>
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
        >
          Wszystkie ({submissions.length})
        </Button>
        <Button
          variant={filter === "new" ? "default" : "outline"}
          onClick={() => setFilter("new")}
          className={filter === "new" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
        >
          Nowe ({newCount})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          onClick={() => setFilter("read")}
          className={filter === "read" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
        >
          Przeczytane ({submissions.filter((s) => s.status === "read").length})
        </Button>
        <Button
          variant={filter === "archived" ? "default" : "outline"}
          onClick={() => setFilter("archived")}
          className={filter === "archived" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
        >
          Zarchiwizowane ({submissions.filter((s) => s.status === "archived").length})
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Lista zgłoszeń */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">Lista zgłoszeń</h2>
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Brak zgłoszeń</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card
                key={submission.id}
                className={`cursor-pointer transition-all ${
                  selectedSubmission?.id === submission.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md"
                    : "hover:border-primary/40"
                } ${
                  submission.status === "new"
                    ? "border-l-4 border-l-primary"
                    : ""
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{submission.subject}</h3>
                        {submission.status === "new" && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            Nowe
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {submission.name} • {submission.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(submission.submittedAt).toLocaleString("pl-PL")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {submission.status === "new" && (
                        <Clock className="h-4 w-4 text-primary" />
                      )}
                      {submission.status === "read" && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                      {submission.status === "archived" && (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Szczegóły zgłoszenia */}
        {selectedSubmission && (
          <div className="md:col-span-2 lg:col-span-2">
            <Card className="border-primary/20 dark:border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      {selectedSubmission.subject}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedSubmission.name} • {selectedSubmission.email}
                    </CardDescription>
                    <CardDescription>
                      {new Date(selectedSubmission.submittedAt).toLocaleString("pl-PL")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedSubmission.status === "new" && (
                      <Button
                        size="sm"
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, "read")}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Oznacz jako przeczytane
                      </Button>
                    )}
                    {selectedSubmission.status === "read" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, "archived")}
                      >
                        Zarchiwizuj
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSubmission(selectedSubmission.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Wiadomość:</h3>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <a
                    href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="bg-primary/5 hover:bg-primary/10 border-primary/20"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Odpowiedz
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
