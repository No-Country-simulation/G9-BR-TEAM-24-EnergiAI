import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Send, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useContactUs } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contato — BeeBuzz" },
      { name: "description", content: "Fale com a equipe do BeeBuzz sobre eficiência energética." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const contactMutation = useContactUs();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes("@") || !subject.trim() || message.trim().length < 5) {
      toast.error(
        "Preencha todos os campos corretamente (assunto obrigatório, mensagem mín. 5 caracteres).",
      );
      return;
    }

    try {
      await contactMutation.mutateAsync({ name, email, subject, message });
      setSubmitted(true);
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar mensagem. Tente novamente.";
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-dvh hero-bg py-12 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Voltar ao Início
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg gradient-primary-bg">
              <Zap className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">BeeBuzz</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-soft">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-display text-3xl font-bold">Fale Conosco</CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Dúvidas, sugestões ou suporte sobre a plataforma de eficiência energética.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {submitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 text-success">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">Obrigado pelo contato!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Sua mensagem foi entregue com sucesso para a equipe BeeBuzz (POST /contact-us).
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmitted(false);
                        setSubject("");
                        setMessage("");
                      }}
                    >
                      Enviar outra mensagem
                    </Button>
                    <Button asChild className="gradient-primary-bg text-primary-foreground">
                      <Link to="/">Voltar à Home</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={contactMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail para contato</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={contactMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      placeholder="Ex: Dúvida sobre análise de consumo"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      disabled={contactMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Escreva sua mensagem ou dúvida sobre o BeeBuzz..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      disabled={contactMutation.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full gradient-primary-bg text-primary-foreground shadow-glow"
                  >
                    {contactMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Enviando…
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 size-4" /> Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
