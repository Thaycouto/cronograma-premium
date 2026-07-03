import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { getPremiumSession } from "@/lib/premium-session";

const errorMessages: Record<string, string> = {
  dados: "Informe seu e-mail e senha para entrar.",
  credenciais: "E-mail ou senha incorretos. Confira os dados e tente novamente.",
  "email-nao-confirmado": "Seu e-mail ainda não foi confirmado.",
  "sem-acesso": "Não encontramos uma compra aprovada para este e-mail.",
  vinculado: "Este acesso já está vinculado a outra conta.",
  validacao: "Não foi possível validar seu acesso agora. Tente novamente em instantes.",
  login: "Não foi possível entrar agora. Confira os dados e tente novamente.",
};

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ erro?: string; senha?: string; conta?: string }> }) {
  const session = await getPremiumSession();

  console.log("/login carregou", {
    premiumSessionValid: Boolean(session),
    email: session?.email || null,
  });

  if (session) {
    console.log("/login redirect decidido", {
      redirectTo: "/dashboard",
      reason: "valid_chp_session",
    });
    redirect("/dashboard");
  }

  const initialMessage = await getInitialMessage(searchParams);

  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <LoginForm initialMessage={initialMessage} />
    </main>
  );
}

async function getInitialMessage(searchParams?: Promise<{ erro?: string; senha?: string; conta?: string }>) {
  const params = searchParams ? await searchParams : undefined;

  if (params?.senha === "criada") {
    return "Senha criada. Entre para acessar seu cronograma.";
  }

  if (params?.conta === "existente") {
    return "Este e-mail já tem senha criada. Faça login para continuar.";
  }

  return params?.erro ? errorMessages[params.erro] : undefined;
}
