import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Server, Mail, Coffee, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso e Sanidade — BeeBuzz" },
      { name: "description", content: "Termos de uso oficiais e divertidos para a banca do Hackathon." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="relative min-h-dvh hero-bg py-12 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Voltar ao Cadastro
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg gradient-primary-bg">
              <Zap className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">BeeBuzz</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-soft border-primary/20">
            <CardHeader className="text-center pb-4 border-b">
              <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <CardTitle className="font-display text-3xl font-bold">
                Acordo de Sanidade e Termos de Luz
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Edição Especial Hackathon Atom 2026 — Leia com atenção e um sorriso no rosto.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-6 text-sm text-foreground">
              {/* Cláusula 1 */}
              <div className="space-y-2 rounded-2xl border p-5 bg-card/40">
                <div className="flex items-center gap-2 font-display text-base font-semibold text-primary">
                  <Server className="size-4 shrink-0" /> Cláusula 1 (Privacidade e Cloud)
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Nós não coletamos seus dados pessoais. Seus dados de login estão protegidos pelos servidores da Oracle Cloud (OCI). Além disso, nossa cota gratuita no Neon Tech DB é preciosa e preferimos gastar armazenamento salvando seu histórico de economia de energia do que seu email e senha que voce usa para tudo.
                </p>
              </div>

              {/* Cláusula 2 */}
              <div className="space-y-2 rounded-2xl border p-5 bg-card/40">
                <div className="flex items-center gap-2 font-display text-base font-semibold text-primary">
                  <Mail className="size-4 shrink-0" /> Cláusula 2 (Zero Spam)
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Usamos a Resend para enviar e-mails de confirmação. Fique tranquilo, não mandaremos spam, pois nossa API Key no plano free não permite.
                </p>
              </div>

              {/* Cláusula 3 */}
              <div className="space-y-2 rounded-2xl border p-5 bg-card/40">
                <div className="flex items-center gap-2 font-display text-base font-semibold text-primary">
                  <Zap className="size-4 shrink-0" /> Cláusula 3 (Infraestrutura)
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  O Backend está em uma vm na OCI, e o front-end está hospedado na Vercel e o DNS protegido pela Cloudflare com um domínio conseguido pelo beneficio do GitHub Student Pack. Se o site cair, a culpa provavelmente é do Wi-Fi na hora do evento, não nossa.
                </p>
              </div>

              {/* Cláusula 4 */}
              <div className="space-y-2 rounded-2xl border border-primary/40 p-5 bg-primary/5">
                <div className="flex items-center gap-2 font-display text-base font-bold text-primary">
                  <Coffee className="size-4 shrink-0" /> Cláusula 4 (Aviso Legal do Hackathon)
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Ao clicar em 'Criar conta', você concorda que este software foi movido a base de café, mais café, energético, café extraforte e uma pitada de desespero de última hora. Não nos responsabilizamos por bugs encontrados após o término do cronômetro da apresentação. Por favor, deem nota 10 pelo esforço!
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t">
                <span className="text-xs text-muted-foreground">
                  Documento auditado pela banca avaliadora da Equipe G9.
                </span>
                <Button asChild className="gradient-primary-bg text-primary-foreground shadow-glow">
                  <Link to="/signup">Concordar e Voltar ao Cadastro</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
