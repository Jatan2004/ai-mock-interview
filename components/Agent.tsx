"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  role,
  techstack,
  numQuestions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [newInterviewId, setNewInterviewId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formRole, setFormRole] = useState<string>("");
  const [formType, setFormType] = useState<string>("technical");
  const [formLevel, setFormLevel] = useState<string>("");
  const [formTechstack, setFormTechstack] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showTypeOptions, setShowTypeOptions] = useState<boolean>(false);
  const [textReply, setTextReply] = useState<string>("");
  const [isSendingText, setIsSendingText] = useState<boolean>(false);
  const [lastAssistantSpokenAt, setLastAssistantSpokenAt] = useState<number>(0);
  const [lastAssistantSpeechStartedAt, setLastAssistantSpeechStartedAt] = useState<number>(0);
  const [textInputEnabled, setTextInputEnabled] = useState<boolean>(true);
  const maxTextChars = 500;
  const [formNumQuestions, setFormNumQuestions] = useState<number>(5);

  // Browser TTS fallback removed to ensure consistent agent voice
  // Close modal with ESC
  useEffect(() => {
    if (!showCreateForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCreateForm(false);
    };
    window.addEventListener("keydown", onKey as unknown as EventListener);
    return () => window.removeEventListener("keydown", onKey as unknown as EventListener);
  }, [showCreateForm]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript") {
        if (message.role === "user") {
          if (message.transcriptType === "partial") {
            setIsUserSpeaking(true);
          }
          if (message.transcriptType === "final") {
            setIsUserSpeaking(false);
            const newMessage = { role: message.role, content: message.transcript };
            setMessages((prev) => [...prev, newMessage]);
          }
          return;
        }

        if (message.transcriptType === "final") {
          const newMessage = { role: message.role, content: message.transcript };
          setMessages((prev) => [...prev, newMessage]);
        }
        return;
      }

      // Fallback for text messages from the assistant (non-transcript payloads)
      try {
        const maybeContent = message?.content ?? message?.message ?? message?.text;
        const maybeRole = message?.role ?? "assistant";
        if (typeof maybeContent === "string" && maybeContent.trim().length > 0) {
          const newMessage = { role: maybeRole, content: maybeContent } as SavedMessage;
          setMessages((prev) => [...prev, newMessage]);
          // No local TTS here; rely on SDK voice only
        }
      } catch (e) {
        console.warn("Unhandled message payload", message);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
      setLastAssistantSpeechStartedAt(Date.now());
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
      setLastAssistantSpokenAt(Date.now());
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        // Stay on the page and surface the newly created interview link
        // so the user can start it from here as well.
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    if (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE) {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleCall = async () => {
    if (type === "generate") {
      if (!newInterviewId) {
        setShowCreateForm(true);
        return;
      }
      setCallStatus(CallStatus.CONNECTING);
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
      return;
    }

    setCallStatus(CallStatus.CONNECTING);
    let formattedQuestions = "";
    let maxQuestions = 0;
    // If user supplied their own question texts, use those
    if (questions && questions.length > 0) {
      formattedQuestions = questions.map((question) => `- ${question}`).join("\n");
      maxQuestions = questions.length;
    } else if (numQuestions && numQuestions > 0) {
      // No user texts: enforce strict AI cap
      formattedQuestions = `(Auto-generate ${numQuestions} questions based on topic/role, do not exceed)`;
      maxQuestions = numQuestions;
    }

    await vapi.start(interviewer, {
      variableValues: {
        questions: formattedQuestions,
        role: role || "",
        techstack: (techstack || []).join(", "),
        type: "interview",
        level: "",
        max_questions: maxQuestions,
      },
    });
  };

  const handleCreateAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!formRole.trim()) return;
    try {
      setIsCreating(true);
      const res = await fetch("/api/interviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: formRole.trim(),
          type: formType,
          level: formLevel.trim(),
          techstack: formTechstack.trim(),
          questions: [],
          numQuestions: formNumQuestions,
          userid: userId,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.interviewId) {
        setNewInterviewId(data.interviewId);
        setShowCreateForm(false);
        setCallStatus(CallStatus.CONNECTING);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
            role: formRole.trim(),
            techstack: formTechstack.trim(),
            type: formType,
            level: formLevel.trim(),
            max_questions: 0,
          },
        });
      }
    } catch (e) {
      console.error("Failed to create interview before starting call", e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const handleSendText = async () => {
    const trimmed = textReply.trim();
    if (!trimmed) return;
    if (callStatus !== CallStatus.ACTIVE) return;
    try {
      setIsSendingText(true);
      // Send a text message to the agent during the active call.
      // Try multiple supported shapes for compatibility across SDK versions.
      const anyVapi = vapi as any;
      if (typeof anyVapi.send === "function") {
        try {
          await anyVapi.send({ type: "input_text", text: trimmed });
        } catch (e) {
          // fallback shapes
          try {
            await anyVapi.send({ type: "message", role: "user", content: trimmed });
          } catch (e2) {
            try {
              await anyVapi.send({ event: "input_text", text: trimmed });
            } catch (e3) {
              // ignore; other fallbacks below
            }
          }
        }
      }
      if (typeof (anyVapi.sendMessage) === "function") {
        try {
          await anyVapi.sendMessage(trimmed);
        } catch { }
      }
      if (typeof (anyVapi.inputText) === "function") {
        try {
          await anyVapi.inputText(trimmed);
        } catch { }
      }
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setTextReply("");
      // Voice-first: rely on Vapi to process and speak the reply during the call.
      // If no assistant speech occurs shortly, synthesize via backend + say() as a fallback.
      const before = Date.now();
      setTimeout(async () => {
        // If assistant hasn't started speaking since we sent the message, fallback
        if (lastAssistantSpeechStartedAt < before) {
          try {
            const res = await fetch("/api/chat-reply", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userText: trimmed,
                role: role || "",
                techstack: (techstack || []).join(", "),
                type: "interview",
                level: "",
                max_questions: 0,
                contextQuestions: messages
                  .filter((m) => m.role !== "system")
                  .map((m) => `${m.role}: ${m.content}`)
                  .join("\n"),
              }),
            });
            const data = await res.json();
            const reply: string | undefined = data?.reply;
            if (data?.success && reply) {
              setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
              // First try to play via SDK voice (same call voice)
              const anyVapi2 = vapi as any;
              let attemptedAt = Date.now();
              if (typeof anyVapi2.say === "function") {
                try { await anyVapi2.say(reply); } catch { }
                attemptedAt = Date.now();
              } else if (typeof anyVapi2.send === "function") {
                try { await anyVapi2.send({ type: "output_text", text: reply }); } catch { }
                attemptedAt = Date.now();
              }
              // No local TTS fallback; rely on SDK voice only
            }
          } catch { }
        }
      }, 2000);
    } catch (e) {
      console.error("Failed to send text message", e);
    } finally {
      setIsSendingText(false);
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
          <div className="mt-2">
            <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-dark-200 text-primary-200">
              <span
                className={cn(
                  "size-2 rounded-full",
                  isSpeaking ? "bg-success-100" : "bg-light-400"
                )}
              />
              {isSpeaking ? "Speaking…" : "Listening…"}
            </span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <div className="avatar">
              <Image
                src="/profile.svg"
                alt="profile-image"
                width={539}
                height={539}
                className="rounded-full object-cover size-[120px]"
              />
              {isUserSpeaking && <span className="animate-speak" />}
            </div>
            <h3>{userName}</h3>
            <div className="mt-2">
              <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-dark-200 text-primary-200">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isUserSpeaking ? "bg-success-100" : "bg-light-400"
                  )}
                />
                {isUserSpeaking ? "Speaking…" : "Listening…"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {showCreateForm && type === "generate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-interview-title">
          <div className="card-border w-full max-w-2xl relative rounded-xl shadow-2xl">
            <button
              type="button"
              aria-label="Close create interview"
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer text-2xl leading-none p-1 rounded-md hover:bg-secondary"
              onClick={() => setShowCreateForm(false)}
              title="Close"
            >
              ×
            </button>
            <form className="card p-6 md:p-8 flex flex-col gap-6 form" onSubmit={handleCreateAndStart}>
              <div>
                <h3 id="create-interview-title">Create interview</h3>
                <p className="text-sm text-muted-foreground mt-1">Fill in a few details so we can tailor your mock session.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label" htmlFor="role">Role</label>
                <input
                  id="role"
                  className="input"
                  placeholder="e.g., Frontend Developer"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  required
                  aria-describedby="role-help"
                />
                <span id="role-help" className="text-xs text-muted-foreground">Job title or role you are interviewing for.</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Frontend Developer", "Backend Developer", "Data Analyst"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="px-3 py-1 rounded-full bg-dark-200 hover:bg-dark-100 text-xs"
                      onClick={() => setFormRole(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2 min-w-0">
                  <label className="label">Type</label>
                  <div className="relative w-full">
                    <button
                      type="button"
                      className="input flex items-center justify-between"
                      aria-haspopup="listbox"
                      aria-expanded={showTypeOptions}
                      onClick={() => setShowTypeOptions((prev) => !prev)}
                    >
                      <span>{formType.charAt(0).toUpperCase() + formType.slice(1)}</span>
                      <span aria-hidden>▾</span>
                    </button>
                    {showTypeOptions && (
                      <div
                        role="listbox"
                        className="absolute z-20 mt-1 w-full rounded-md bg-dark-200 border border-input shadow-lg overflow-hidden"
                      >
                        {(["technical", "behavioral", "mixed"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            role="option"
                            aria-selected={formType === t}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm transition-colors",
                              formType === t ? "bg-dark-100" : "hover:bg-dark-100"
                            )}
                            onClick={() => {
                              setFormType(t);
                              setShowTypeOptions(false);
                            }}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label" htmlFor="level">Level</label>
                  <input
                    id="level"
                    className="input"
                    placeholder="e.g., Junior, Mid, Senior"
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label" htmlFor="numQuestions">Number of Questions</label>
                  <input
                    id="numQuestions"
                    type="number"
                    min={1}
                    max={20}
                    value={formNumQuestions}
                    className="input"
                    onChange={e => setFormNumQuestions(Number(e.target.value))}
                    required
                  />
                  <span className="text-xs text-muted-foreground">How many questions should the interviewer ask?</span>
                </div>
                <div className="flex flex-col gap-2 md:col-span-1 md:col-start-auto">
                  <label className="label" htmlFor="techstack">Tech stack</label>
                  <input
                    id="techstack"
                    className="input"
                    placeholder="e.g., React, Node, SQL"
                    value={formTechstack}
                    onChange={(e) => setFormTechstack(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["React", "Node", "SQL"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="px-3 py-1 rounded-full bg-dark-200 hover:bg-dark-100 text-xs"
                        onClick={() => {
                          const list = formTechstack ? formTechstack.split(',').map((t) => t.trim()).filter(Boolean) : [];
                          if (!list.includes(tag)) list.push(tag);
                          setFormTechstack(list.join(', '));
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating…" : "Create & start"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-3">
        {callStatus === "ACTIVE" && (
          <div className="text-xs text-muted-foreground">
            Session time: <span className="text-primary dark:text-primary-200 font-semibold">{formatTime(elapsedSeconds)}</span>
          </div>
        )}
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
        {newInterviewId && callStatus === "FINISHED" && (
          <Link href={`/interview/${newInterviewId}`} className="btn-primary inline-block px-7 py-3 leading-5 shadow-sm min-w-28">
            Start interview
          </Link>
        )}
        {/* Text reply controls */}
        <div className="w-full max-w-2xl mt-2 flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="accent-primary"
              checked={textInputEnabled}
              onChange={(e) => setTextInputEnabled(e.target.checked)}
            />
            Enable typed replies
          </label>
        </div>
        <div className="w-full max-w-2xl mt-2">
          <div className="relative flex items-end gap-3 rounded-xl border border-dark-200 bg-dark-200/60 p-3 shadow-sm focus-within:border-primary/60 focus-within:bg-dark-100 transition-colors">
            <textarea
              className="flex-1 min-h-12 max-h-40 resize-y bg-transparent text-foreground placeholder:text-muted-foreground border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:shadow-none"
              placeholder={callStatus === "ACTIVE" ? (textInputEnabled ? "Type your reply... (Enter to send, Shift+Enter for newline)" : "Typed replies disabled") : "Start the call to send messages"}
              value={textReply}
              onChange={(e) => {
                if (e.target.value.length <= maxTextChars) setTextReply(e.target.value);
              }}
              onKeyDown={(e) => {
                if (!textInputEnabled) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (textReply.trim() && callStatus === "ACTIVE" && !isSendingText) {
                    handleSendText();
                  }
                }
              }}
              disabled={callStatus !== "ACTIVE" || isSendingText || !textInputEnabled}
              aria-label="Text reply"
              maxLength={maxTextChars}
            />
            <div className="flex flex-col items-end gap-2 min-w-24">
              <div className="text-[10px] text-muted-foreground" aria-live="polite">
                {textReply.length}/{maxTextChars}
              </div>
              <button
                className="btn-primary px-4 py-2"
                onClick={handleSendText}
                disabled={callStatus !== "ACTIVE" || isSendingText || !textInputEnabled || !textReply.trim()}
                aria-label="Send typed reply"
                title="Send"
              >
                {isSendingText ? "Sending…" : "Send ↩"}
              </button>
            </div>
            {!textInputEnabled && (
              <div className="absolute inset-0 rounded-xl bg-black/30 pointer-events-none" aria-hidden />
            )}
          </div>

          {/* Quick suggestions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {["Could you clarify that?", "Here is my approach…", "Can you give an example?", "I’d like to add…"].map((s) => (
              <button
                key={s}
                type="button"
                className="px-3 py-1 rounded-full bg-dark-200 hover:bg-dark-100 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  if (!textInputEnabled) return;
                  const next = textReply ? `${textReply} ${s}` : s;
                  if (next.length <= maxTextChars) setTextReply(next);
                }}
                disabled={!textInputEnabled || callStatus !== "ACTIVE"}
                aria-label={`Insert suggestion: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Agent;
