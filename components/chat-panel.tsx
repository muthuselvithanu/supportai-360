"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, FilePlus2, Loader2, Send, UserRound } from "lucide-react";

type ChatRole = "assistant" | "user";
type Priority = "Low" | "Medium" | "High";
type FlowType = "case" | "contact" | "callback";
type FlowStep = "idle" | "creating" | string;
type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type CaseDraft = {
  contactEmail: string;
  subject: string;
  description: string;
  priority: Priority | "";
};

type ContactDraft = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type CallbackDraft = {
  contactEmail: string;
  phone: string;
  preferredTime: string;
  reason: string;
};

type ChatPanelProps = {
  startCaseFlowToken?: number;
  startContactFlowToken?: number;
  startCallbackFlowToken?: number;
  startAgentCaseToken?: number;
};

const priorities: Priority[] = ["Low", "Medium", "High"];
const agentforceCaseMessage =
  "Create a support case for muthuselvithanu@gmail.com. Subject is Billing issue. Description is customer was charged twice. Priority is High.";

const emptyCaseDraft: CaseDraft = {
  contactEmail: "",
  subject: "",
  description: "",
  priority: ""
};
const emptyContactDraft: ContactDraft = {
  email: "",
  firstName: "",
  lastName: "",
  phone: ""
};
const emptyCallbackDraft: CallbackDraft = {
  contactEmail: "",
  phone: "",
  preferredTime: "",
  reason: ""
};

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content
  };
}

function isCreateCaseIntent(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes("create") && normalized.includes("case");
}

function isUpdateContactIntent(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes("update") && normalized.includes("contact");
}

function isCallbackIntent(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes("callback") || normalized.includes("call back");
}

function looksLikeIssueDescription(value: string) {
  const normalized = value.toLowerCase();
  const issueWords = [
    "charged",
    "broken",
    "error",
    "issue",
    "problem",
    "failed",
    "unable",
    "cannot",
    "cant",
    "not working",
    "refund",
    "billing"
  ];

  return value.length >= 12 && issueWords.some((word) => normalized.includes(word));
}

function isPriority(value: string): value is Priority {
  return priorities.some((priority) => priority.toLowerCase() === value.toLowerCase());
}

function cleanOptionalAnswer(value: string) {
  return ["skip", "none", "no", "n/a", "na"].includes(value.toLowerCase()) ? "" : value;
}

export function ChatPanel({
  startCaseFlowToken = 0,
  startContactFlowToken = 0,
  startCallbackFlowToken = 0,
  startAgentCaseToken = 0
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "assistant",
      "Hi, I can create Salesforce cases, update contacts, or request callbacks. Choose an action or type what you need."
    )
  ]);
  const [input, setInput] = useState("");
  const [flowType, setFlowType] = useState<FlowType | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [caseDraft, setCaseDraft] = useState<CaseDraft>(emptyCaseDraft);
  const [contactDraft, setContactDraft] = useState<ContactDraft>(emptyContactDraft);
  const [callbackDraft, setCallbackDraft] = useState<CallbackDraft>(emptyCallbackDraft);
  const [isWorking, setIsWorking] = useState(false);
  const lastCaseTokenRef = useRef(startCaseFlowToken);
  const lastContactTokenRef = useRef(startContactFlowToken);
  const lastCallbackTokenRef = useRef(startCallbackFlowToken);
  const lastAgentCaseTokenRef = useRef(startAgentCaseToken);

  function addAssistantMessage(content: string) {
    setMessages((current) => [...current, createMessage("assistant", content)]);
  }

  function addUserMessage(content: string) {
    setMessages((current) => [...current, createMessage("user", content)]);
  }

  function startCaseFlow(initialDescription?: string) {
    const nextDraft = initialDescription
      ? { ...emptyCaseDraft, description: initialDescription }
      : emptyCaseDraft;

    setFlowType("case");
    setCaseDraft(nextDraft);
    setFlowStep("case-email");
    addAssistantMessage(
      initialDescription
        ? "I'll help create a support case. What is the customer's email?"
        : "I can create that Salesforce case. What is the customer email?"
    );
  }

  function startContactFlow() {
    setFlowType("contact");
    setContactDraft(emptyContactDraft);
    setFlowStep("contact-email");
    addAssistantMessage("Let's update a Salesforce contact. What email should I use to find the contact?");
  }

  function startCallbackFlow() {
    setFlowType("callback");
    setCallbackDraft(emptyCallbackDraft);
    setFlowStep("callback-email");
    addAssistantMessage("I'll create a callback request. What is the customer's email?");
  }

  function resetFlow() {
    setFlowType(null);
    setFlowStep("idle");
    setCaseDraft(emptyCaseDraft);
    setContactDraft(emptyContactDraft);
    setCallbackDraft(emptyCallbackDraft);
  }

  async function submitCase(nextDraft: CaseDraft) {
    setFlowStep("creating");
    setIsWorking(true);
    addAssistantMessage("Creating the Salesforce case now...");

    try {
      const response = await fetch("/api/salesforce/create-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextDraft)
      });
      const data = await response.json();

      if (!response.ok) {
        addAssistantMessage(data.message ?? data.error ?? "Unable to create the Salesforce case.");
        resetFlow();
        return;
      }

      addAssistantMessage(`Salesforce case created successfully: ${data.data.id}`);
      resetFlow();
    } catch {
      addAssistantMessage("Unable to reach the Salesforce case creation endpoint.");
      resetFlow();
    } finally {
      setIsWorking(false);
    }
  }

  async function submitContact(nextDraft: ContactDraft) {
    setFlowStep("creating");
    setIsWorking(true);
    addAssistantMessage("Updating the Salesforce contact now...");

    try {
      const response = await fetch("/api/salesforce/update-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextDraft)
      });
      const data = await response.json();

      if (!response.ok) {
        addAssistantMessage(data.message ?? data.error ?? "Unable to update the Salesforce contact.");
        resetFlow();
        return;
      }

      addAssistantMessage(`Salesforce contact updated successfully: ${data.data.id}`);
      resetFlow();
    } catch {
      addAssistantMessage("Unable to reach the Salesforce contact update endpoint.");
      resetFlow();
    } finally {
      setIsWorking(false);
    }
  }

  async function submitCallback(nextDraft: CallbackDraft) {
    setFlowStep("creating");
    setIsWorking(true);
    addAssistantMessage("Creating the callback request now...");

    try {
      const response = await fetch("/api/salesforce/request-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextDraft)
      });
      const data = await response.json();

      if (!response.ok) {
        addAssistantMessage(data.message ?? data.error ?? "Unable to request a callback.");
        resetFlow();
        return;
      }

      addAssistantMessage(`Callback request created successfully: ${data.data.id}`);
      resetFlow();
    } catch {
      addAssistantMessage("Unable to reach the callback request endpoint.");
      resetFlow();
    } finally {
      setIsWorking(false);
    }
  }

  function handleCaseAnswer(value: string) {
    if (flowStep === "case-email") {
      const nextDraft = { ...caseDraft, contactEmail: value };
      setCaseDraft(nextDraft);
      setFlowStep("case-subject");
      addAssistantMessage("Thanks. What is the case subject?");
      return;
    }

    if (flowStep === "case-subject") {
      const nextDraft = { ...caseDraft, subject: value };
      setCaseDraft(nextDraft);

      if (nextDraft.description) {
        setFlowStep("case-priority");
        addAssistantMessage("What priority should I use: Low, Medium, or High?");
        return;
      }

      setFlowStep("case-description");
      addAssistantMessage("Got it. Please describe the issue for the case description.");
      return;
    }

    if (flowStep === "case-description") {
      const nextDraft = { ...caseDraft, description: value };
      setCaseDraft(nextDraft);
      setFlowStep("case-priority");
      addAssistantMessage("What priority should I use: Low, Medium, or High?");
      return;
    }

    if (flowStep === "case-priority") {
      if (!isPriority(value)) {
        addAssistantMessage("Please choose Low, Medium, or High for the priority.");
        return;
      }

      const normalizedPriority = priorities.find(
        (priority) => priority.toLowerCase() === value.toLowerCase()
      ) as Priority;
      const nextDraft = { ...caseDraft, priority: normalizedPriority };
      setCaseDraft(nextDraft);
      void submitCase(nextDraft);
    }
  }

  function handleContactAnswer(value: string) {
    if (flowStep === "contact-email") {
      const nextDraft = { ...contactDraft, email: value };
      setContactDraft(nextDraft);
      setFlowStep("contact-first-name");
      addAssistantMessage("What is the new first name? Type skip if you do not want to change it.");
      return;
    }

    if (flowStep === "contact-first-name") {
      const nextDraft = { ...contactDraft, firstName: cleanOptionalAnswer(value) };
      setContactDraft(nextDraft);
      setFlowStep("contact-last-name");
      addAssistantMessage("What is the new last name? Type skip if you do not want to change it.");
      return;
    }

    if (flowStep === "contact-last-name") {
      const nextDraft = { ...contactDraft, lastName: cleanOptionalAnswer(value) };
      setContactDraft(nextDraft);
      setFlowStep("contact-phone");
      addAssistantMessage("What is the new phone number? Type skip if you do not want to change it.");
      return;
    }

    if (flowStep === "contact-phone") {
      const nextDraft = { ...contactDraft, phone: cleanOptionalAnswer(value) };
      setContactDraft(nextDraft);
      void submitContact(nextDraft);
    }
  }

  function handleCallbackAnswer(value: string) {
    if (flowStep === "callback-email") {
      const nextDraft = { ...callbackDraft, contactEmail: value };
      setCallbackDraft(nextDraft);
      setFlowStep("callback-phone");
      addAssistantMessage("What phone number should support call?");
      return;
    }

    if (flowStep === "callback-phone") {
      const nextDraft = { ...callbackDraft, phone: value };
      setCallbackDraft(nextDraft);
      setFlowStep("callback-time");
      addAssistantMessage("What is the preferred callback time?");
      return;
    }

    if (flowStep === "callback-time") {
      const nextDraft = { ...callbackDraft, preferredTime: value };
      setCallbackDraft(nextDraft);
      setFlowStep("callback-reason");
      addAssistantMessage("What is the reason for the callback?");
      return;
    }

    if (flowStep === "callback-reason") {
      const nextDraft = { ...callbackDraft, reason: value };
      setCallbackDraft(nextDraft);
      void submitCallback(nextDraft);
    }
  }

  function handleFlowAnswer(value: string) {
    if (flowType === "case") {
      handleCaseAnswer(value);
      return;
    }

    if (flowType === "contact") {
      handleContactAnswer(value);
      return;
    }

    if (flowType === "callback") {
      handleCallbackAnswer(value);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();

    if (!value || isWorking) {
      return;
    }

    setInput("");
    addUserMessage(value);

    if (flowType) {
      handleFlowAnswer(value);
      return;
    }

    if (isCreateCaseIntent(value)) {
      startCaseFlow();
      return;
    }

    if (isUpdateContactIntent(value)) {
      startContactFlow();
      return;
    }

    if (isCallbackIntent(value)) {
      startCallbackFlow();
      return;
    }

    if (looksLikeIssueDescription(value)) {
      startCaseFlow(value);
      return;
    }

    addAssistantMessage(
      "I can create a case, update a contact, or request a callback. Choose a quick action or type what you need."
    );
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (isWorking) {
        return;
      }

      if (startCaseFlowToken !== lastCaseTokenRef.current) {
        lastCaseTokenRef.current = startCaseFlowToken;
        setFlowType("case");
        setCaseDraft(emptyCaseDraft);
        setFlowStep("case-email");
        setMessages((current) => [
          ...current,
          createMessage("assistant", "I can create that Salesforce case. What is the customer email?")
        ]);
      }

      if (startContactFlowToken !== lastContactTokenRef.current) {
        lastContactTokenRef.current = startContactFlowToken;
        setFlowType("contact");
        setContactDraft(emptyContactDraft);
        setFlowStep("contact-email");
        setMessages((current) => [
          ...current,
          createMessage(
            "assistant",
            "Let's update a Salesforce contact. What email should I use to find the contact?"
          )
        ]);
      }

      if (startCallbackFlowToken !== lastCallbackTokenRef.current) {
        lastCallbackTokenRef.current = startCallbackFlowToken;
        setFlowType("callback");
        setCallbackDraft(emptyCallbackDraft);
        setFlowStep("callback-email");
        setMessages((current) => [
          ...current,
          createMessage("assistant", "I'll create a callback request. What is the customer's email?")
        ]);
      }

      if (startAgentCaseToken !== lastAgentCaseTokenRef.current) {
        lastAgentCaseTokenRef.current = startAgentCaseToken;
        setFlowStep("creating");
        setIsWorking(true);
        setMessages((current) => [
          ...current,
          createMessage("user", agentforceCaseMessage),
          createMessage("assistant", "Sending this request to Agentforce...")
        ]);

        void fetch("/api/agentforce/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: agentforceCaseMessage })
        })
          .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
              setMessages((current) => [
                ...current,
                createMessage(
                  "assistant",
                  data.message ?? data.error ?? "Unable to send the request to Agentforce."
                )
              ]);
              return;
            }

            setMessages((current) => [
              ...current,
              createMessage("assistant", data.responseText ?? "Agentforce completed the request.")
            ]);
          })
          .catch(() => {
            setMessages((current) => [
              ...current,
              createMessage("assistant", "Unable to reach the Agentforce message endpoint.")
            ]);
          })
          .finally(() => {
            resetFlow();
            setIsWorking(false);
          });
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [startCaseFlowToken, startContactFlowToken, startCallbackFlowToken, startAgentCaseToken, isWorking]);

  const showPriorityButtons = flowType === "case" && flowStep === "case-priority";

  return (
    <section className="flex min-h-[640px] flex-col rounded-lg border border-line bg-white shadow-panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Bot size={20} />
          </span>
          <div>
            <h2 className="font-semibold">Salesforce assistant</h2>
            <p className="text-sm text-slate-500">Creates cases and updates Salesforce records</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => startCaseFlow()}
          disabled={isWorking}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isWorking ? <Loader2 size={17} className="animate-spin" /> : <FilePlus2 size={17} />}
          Create Case
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700">
                  <Bot size={17} />
                </span>
              )}
              <p
                className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  isUser
                    ? "bg-brand-600 text-white"
                    : "border border-line bg-slate-50 text-slate-700"
                }`}
              >
                {message.content}
              </p>
              {isUser && (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
                  <UserRound size={17} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showPriorityButtons && (
        <div className="border-t border-line px-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => {
                  addUserMessage(priority);
                  handleFlowAnswer(priority);
                }}
                className="rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="border-t border-line p-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 rounded-lg border border-line bg-slate-50 p-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
            placeholder={
              flowStep === "idle"
                ? "Create case, update contact, request callback"
                : "Reply with the requested detail"
            }
            disabled={isWorking}
          />
          <button
            type="submit"
            disabled={isWorking}
            className="grid h-10 w-10 place-items-center rounded-md bg-brand-600 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
            title="Send message"
          >
            {isWorking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </section>
  );
}



