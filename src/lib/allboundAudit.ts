export type Answer = "yes" | "partly" | "no";

export const questions = [
  {
    id: "icp", stage: "01 / Focus", weight: 15,
    question: "Is there one current ICP, built from recent customer conversations and deal outcomes, that both sales and marketing use?",
    yes: "Both teams use the same account and buyer criteria, grounded in recent customer conversations, wins, and losses. An old workshop alone does not count.",
    gap: "Shared buyer criteria",
    challenge: "Of your last 20 sales meetings, how many matched the account and buyer criteria both teams would choose today?",
    impact: "When the teams target different buyers, marketing creates leads sales would not pursue while the best-fit accounts receive less attention.",
    action: "Compare recent wins, losses, and customer interviews. Write one account and buyer definition that both teams can use.",
  },
  {
    id: "trust", stage: "02 / Trust", weight: 15,
    question: "Do target buyers understand your expertise and what makes you different before the first sales conversation?",
    yes: "Buyers can learn this through your content, search presence, or credible proof. Referrals alone do not count.",
    gap: "Trust before the first call",
    challenge: "If a target buyer looked you up before replying, would they find an answer to their problem or only a product pitch?",
    impact: "Without visible expertise or proof, your first conversation has to build trust from zero, often after the buyer has already formed a shortlist.",
    action: "Identify what a target buyer sees before a meeting. Publish useful expertise or proof that answers their likely problem.",
  },
  {
    id: "signals", stage: "03 / Signals", weight: 10,
    question: "Do you track signals that suggest an account may have a problem you solve and be entering a buying window?",
    yes: "You use a set of signals tied to a plausible buyer problem. A generic job opening or funding round on its own does not count.",
    gap: "Problem-linked signals",
    challenge: "For the last 50 accounts you contacted, can you name a signal linked to a problem you solve?",
    impact: "A funding round or job opening alone gives buyers little reason to respond. Repeated generic outreach uses up chances with a finite market.",
    action: "List the events and behaviors that could indicate your buyer's problem, then check which ones predict real conversations.",
  },
  {
    id: "qualification", stage: "04 / Qualify", weight: 10,
    question: "Before following up on engagement, do you check account fit, buyer role, and why the signal matters?",
    yes: "Inbound and outbound leads are qualified at both account and contact level before a seller spends time on them.",
    gap: "Qualification before seller time",
    challenge: "Of the last 20 people who engaged, how many matched both your target account and buyer criteria before a seller followed up?",
    impact: "Seller time goes to poor-fit contacts while qualified interest waits. More engagement then creates work without enough real pipeline.",
    action: "Set clear account and buyer checks before engagement is routed to sales, including a reason the signal matters.",
  },
  {
    id: "messaging", stage: "05 / Engage", weight: 15,
    question: "Does your messaging connect the buyer's job, likely problem, and a useful offer in a way that is specific to them?",
    yes: "Your team produces relevant messages at scale using segment, persona, and context. A name or job opening added to a generic pitch does not count.",
    gap: "Relevant messaging at scale",
    challenge: "Could your last campaign message be sent unchanged to a buyer with a different job and problem?",
    impact: "If the answer is yes, the buyer has to do the work of connecting your offer to their situation. Relevant buyers may ignore a message that feels generic.",
    action: "Build one message for a priority segment that connects the buyer's job, likely problem, and a useful next step.",
  },
  {
    id: "handoff", stage: "06 / Route", weight: 15,
    question: "When a qualified buyer responds, does the right seller get the full context and follow up while interest is fresh?",
    yes: "Every reply has a clear owner, account and conversation context travel with it, and response time is measured. Explicit inbound requests receive especially fast follow-up.",
    gap: "Fast, contextual handoff",
    challenge: "How many qualified replies last month became meetings, and how long did the others wait for an owner?",
    impact: "Interested buyers can cool off while a reply sits unassigned. When context is lost, the seller has to restart the conversation instead of moving it forward.",
    action: "Route qualified replies to one owner with the conversation history, account context, and a measured response target.",
  },
  {
    id: "close", stage: "07 / Close", weight: 10,
    question: "After a sales conversation, are the buyer-agreed next step and CRM record updated without the seller doing manual admin?",
    yes: "Follow-up tasks, contacts, lifecycle stages, and deal stages reflect buyer commitments automatically. A disciplined manual process counts as Partly.",
    gap: "Sales follow-through",
    challenge: "Open your 10 most active deals. Does each show a buyer-agreed next step and date, or just a stage the seller updated?",
    impact: "Deals without a buyer commitment can stall unnoticed. Manual CRM work also takes time away from selling and makes the forecast less reliable.",
    action: "Capture the buyer-agreed next step, owner, and date, then automate the matching CRM updates and reminders.",
  },
  {
    id: "learning", stage: "08 / Learn", weight: 10,
    question: "Can you see which channels, messages, and campaigns produce closed revenue and use that evidence to improve the next play?",
    yes: "You can trace activity through opportunities to won deals and use that evidence to change what you do next. Activity-only dashboards do not count.",
    gap: "Revenue-based learning",
    challenge: "Which channel and message produced closed revenue last quarter, and what did you change because of it?",
    impact: "Without that answer, you may keep funding activity that looks busy while the plays that create customers stay underfunded.",
    action: "Connect campaign and message sources to opportunities and closed revenue. Use the results to change one next decision.",
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
