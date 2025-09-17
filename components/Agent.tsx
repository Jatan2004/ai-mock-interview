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

    const onMessage = (message: Message) => {
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
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
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
    if (questions) {
      formattedQuestions = questions
        .map((question) => `- ${question}`)
        .join("\n");
    }

    await vapi.start(interviewer, {
      variableValues: {
        questions: formattedQuestions,
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
              className="absolute right-3 top-3 text-light-400 hover:text-light-200 cursor-pointer text-2xl leading-none p-1 rounded-md hover:bg-dark-100"
              onClick={() => setShowCreateForm(false)}
              title="Close"
            >
              ×
            </button>
            <form className="card p-6 md:p-8 flex flex-col gap-6 form" onSubmit={handleCreateAndStart}>
              <div>
                <h3 id="create-interview-title">Create interview</h3>
                <p className="text-sm text-light-400 mt-1">Fill in a few details so we can tailor your mock session.</p>
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
                <span id="role-help" className="text-xs text-light-400">Job title or role you are interviewing for.</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Frontend Developer","Backend Developer","Data Analyst"].map((preset) => (
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
                        {(["technical","behavioral","mixed"] as const).map((t) => (
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
                    {["React","Node","SQL"].map((tag) => (
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
          <div className="text-xs text-light-400">
            Session time: <span className="text-primary-200 font-semibold">{formatTime(elapsedSeconds)}</span>
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
      </div>
    </>
  );
};

export default Agent;
