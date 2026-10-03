export type Answer = "yes" | "partly" | "no";

export const questions = [
  {
    id: "icp", stage: "01 / Focus", weight: 15,
    question: "Is there one current ICP, built from recent customer conversations and deal outcomes, that both sales and marketing use?",
    yes: "Both teams use the same account and buyer criteria, grounded in recent customer conversations, wins, and losses. An old workshop alone does not count.",
    gap: "Shared buyer criteria", action: "Compare recent wins, losses, and customer interviews. Write one account and buyer definition that both teams can use.", proof: "blueprint",
  },
  {
    id: "trust", stage: "02 / Trust", weight: 15,
    question: "Do target buyers understand your expertise and what makes you different before the first sales conversation?",
    yes: "Buyers can learn this through your content, search presence, or credible proof. Referrals alone do not count.",
    gap: "Trust before the first call", action: "Identify what a target buyer sees before a meeting. Publish useful expertise or proof that answers their likely problem.", proof: "ekipa",
  },
  {
    id: "signals", stage: "03 / Signals", weight: 10,
    question: "Do you track signals that suggest an account may have a problem you solve and be entering a buying window?",
    yes: "You use a set of signals tied to a plausible buyer problem. A generic job opening or funding round on its own does not count.",
    gap: "Problem-linked signals", action: "List the events and behaviors that could indicate your buyer's problem, then check which ones predict real conversations.", proof: "bound",
  },
  {
    id: "qualification", stage: "04 / Qualify", weight: 10,
    question: "Before following up on engagement, do you check account fit, buyer role, and why the signal matters?",
    yes: "Inbound and outbound leads are qualified at both account and contact level before a seller spends time on them.",
    gap: "Qualification before seller time", action: "Set clear account and buyer checks before engagement is routed to sales, including a reason the signal matters.", proof: "blueprint",
  },
  {
    id: "messaging", stage: "05 / Engage", weight: 15,
    question: "Does your messaging connect the buyer's job, likely problem, and a useful offer in a way that is specific to them?",
    yes: "Your team produces relevant messages at scale using segment, persona, and context. A name or job opening added to a generic pitch does not count.",
    gap: "Relevant messaging at scale", action: "Build one message for a priority segment that connects the buyer's job, likely problem, and a useful next step.", proof: "condenzero",
  },
  {
    id: "handoff", stage: "06 / Route", weight: 15,
    question: "When a qualified buyer responds, does the right seller get the full context and follow up while interest is fresh?",
    yes: "Every reply has a clear owner, account and conversation context travel with it, and response time is measured. Explicit inbound requests receive especially fast follow-up.",
    gap: "Fast, contextual handoff", action: "Route qualified replies to one owner with the conversation history, account context, and a measured response target.", proof: "blueprint",
  },
  {
    id: "close", stage: "07 / Close", weight: 10,
    question: "After a sales conversation, are the buyer-agreed next step and CRM record updated without the seller doing manual admin?",
    yes: "Follow-up tasks, contacts, lifecycle stages, and deal stages reflect buyer commitments automatically. A disciplined manual process counts as Partly.",
    gap: "Sales follow-through", action: "Capture the buyer-agreed next step, owner, and date, then automate the matching CRM updates and reminders.", proof: "bound",
  },
  {
    id: "learning", stage: "08 / Learn", weight: 10,
    question: "Can you see which channels, messages, and campaigns produce closed revenue and use that evidence to improve the next play?",
    yes: "You can trace activity through opportunities to won deals and use that evidence to change what you do next. Activity-only dashboards do not count.",
    gap: "Revenue-based learning", action: "Connect campaign and message sources to opportunities and closed revenue. Use the results to change one next decision.", proof: "lipdub",
  },
] as const;

export function scoreAudit(answers: readonly (Answer | null)[]) {
  const total = questions.reduce((sum, question, index) => {
    const multiplier = answers[index] === "yes" ? 1 : answers[index] === "partly" ? 0.5 : 0;
    return sum + question.weight * multiplier;
  }, 0);
  const score = Math.round(total);
  const gaps = questions
    .map((question, index) => ({ ...question, answer: answers[index], loss: question.weight * (answers[index] === "yes" ? 0 : answers[index] === "partly" ? 0.5 : 1) }))
    .filter((item) => item.loss > 0)
    .sort((a, b) => b.loss - a.loss)
    .slice(0, 2);
  return { score, band: score < 50 ? "critical" : score < 80 ? "developing" : "connected", gaps };
}
