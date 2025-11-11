"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { IconAlertCircle, IconLoader2, IconSend } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClaimChat } from "@/hooks/use-claim-chat";
import { cn } from "@/lib/utils";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";

const PROMPT_SUGGESTIONS = [
  "Kenapa klaim ini ditandai fraud?",
  "Bandingkan biaya dengan peer group",
  "Apa flag aktif dan tindak lanjutnya?",
  "Dokumen apa yang perlu diverifikasi?",
];

export function ClaimChatPanel({ claimId }: { claimId?: string }) {
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, isError, refetch, sendMessage, isSending } =
    useClaimChat(claimId);

  const sortedMessages = useMemo(() => data ?? [], [data]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !claimId || isSending) return;
    await sendMessage(message.trim());
    setMessage("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  if (!claimId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Chat Copilot</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Pilih klaim untuk mulai percakapan dengan copilot.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Chat Copilot</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat Copilot</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Coba lagi
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <IconAlertCircle className="text-destructive size-6" />
          <p className="font-medium">Gagal memuat chat</p>
          <p className="text-muted-foreground text-sm">Silakan coba ulang.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Chat Copilot</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex-1 space-y-3 overflow-auto pr-2">
          {sortedMessages.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Belum ada percakapan. Tanyakan sesuatu ke copilot.
            </p>
          )}
          {sortedMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] rounded-lg border px-3 py-2 text-sm",
                msg.role === "assistant"
                  ? "bg-muted/80 text-foreground"
                  : "ml-auto bg-primary text-primary-foreground"
              )}
            >
              <div className="text-xs text-muted-foreground opacity-70">
                {msg.sender} •{" "}
                {new Date(msg.created_at ?? "").toLocaleString("id-ID")}
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div>
          <div className="grid shrink-0 gap-4 pt-4">
            <Suggestions className="px-1">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={() => setMessage(suggestion)}
                />
              ))}
            </Suggestions>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Tuliskan pertanyaan"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={isSending}
              />
              <Button type="submit" disabled={isSending || !message.trim()}>
                {isSending ? (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <IconSend className="mr-2 size-4" />
                )}
                Kirim
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
