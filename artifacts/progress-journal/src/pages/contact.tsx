import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";

const RATE_LIMIT_MS = 60_000;
const RATE_LIMIT_KEY = "contact_last_submit";

type MessageType = "Recommendation" | "Question" | "Bug report";

interface FormState {
  name: string;
  email: string;
  messageType: MessageType | "";
  message: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  messageType: "",
  message: "",
};

function getRemainingCooldown(): number {
  try {
    const last = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!last) return 0;
    const elapsed = Date.now() - parseInt(last, 10);
    return Math.max(0, RATE_LIMIT_MS - elapsed);
  } catch {
    return 0;
  }
}

function recordSubmitTime(): void {
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable — skip tracking
  }
}

function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldownMs, setCooldownMs] = useState(() => getRemainingCooldown());

  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
    else if (status === "error") errorRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (cooldownMs <= 0) return;
    const id = window.setInterval(() => {
      const remaining = getRemainingCooldown();
      setCooldownMs(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownMs]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check — drop silently if filled by a bot
    if (honeypot) {
      setStatus("success");
      setForm(EMPTY_FORM);
      return;
    }

    // Client-side cooldown display (server enforces the real rate limit)
    const remaining = getRemainingCooldown();
    if (remaining > 0) {
      setStatus("error");
      setErrorMessage(
        `Please wait ${Math.ceil(remaining / 1000)} seconds before sending another message.`,
      );
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
    if (!accessKey) {
      setStatus("error");
      setErrorMessage("The contact form is not available right now. Please try again later.");
      return;
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          name: form.name.trim(),
          email: form.email.trim(),
          subject: `EYIT Journal – ${form.messageType}`,
          message: `Type: ${form.messageType}\n\n${form.message.trim()}`,
          botcheck: honeypot || false,
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Submission failed. Please try again.");
      }

      recordSubmitTime();
      setCooldownMs(RATE_LIMIT_MS);
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  const cooldownSecs = Math.ceil(cooldownMs / 1000);
  const isRateLimited = cooldownMs > 0;

  const isValid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.messageType !== "" &&
    form.message.trim().length > 0;

  if (status === "success") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className="flex flex-col items-center text-center gap-3 py-6 outline-none"
          >
            <CheckCircle2 className="h-10 w-10 text-[hsl(var(--status-secure))]" aria-hidden="true" />
            <div>
              <p className="font-semibold text-lg">Message sent</p>
              <p className="text-sm text-muted-foreground mt-1">
                Thank you — we'll get back to you via email if a reply is needed.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setStatus("idle")}
              disabled={isRateLimited}
            >
              {isRateLimited
                ? `Send another message (${cooldownSecs}s)`
                : "Send another message"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get in touch</CardTitle>
        <CardDescription>
          All fields are required. We'll respond to your email address if a reply is needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Honeypot — hidden from humans, bots typically fill it */}
          <div aria-hidden="true" style={{ display: "none" }}>
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Your name</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Jane Smith"
                required
                autoComplete="name"
                disabled={status === "loading"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email address</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={status === "loading"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-type">Message type</Label>
            <Select
              value={form.messageType}
              onValueChange={(v) => set("messageType", v as MessageType)}
              disabled={status === "loading"}
            >
              <SelectTrigger id="contact-type">
                <SelectValue placeholder="Choose a type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Recommendation">Recommendation</SelectItem>
                <SelectItem value="Question">Question</SelectItem>
                <SelectItem value="Bug report">Bug report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Describe your recommendation, question, or bug…"
              rows={5}
              required
              disabled={status === "loading"}
              className="resize-y"
            />
          </div>

          {status === "error" && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2.5 text-sm text-destructive outline-none"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            className="gap-2"
            disabled={!isValid || status === "loading" || isRateLimited}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {status === "loading"
              ? "Sending…"
              : isRateLimited
                ? `Please wait ${cooldownSecs}s`
                : "Send message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ContactPage() {
  return (
    <div className="container max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-2 text-muted-foreground">
          Send a recommendation, question, or bug report to the development team.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
