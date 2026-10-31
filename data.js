/* All built-in content lives here. Edit this file to add your own words, templates and questions. */

const DEFAULT_PROFILE =
  "I am a student from a lower middle class family in India, joining a corporate job soon. " +
  "I am decent with computers and drawing, and my biggest strength is problem solving. " +
  "I have no professional connections yet and I do not know much about many corporate things. " +
  "I tend to be lazy, so keep every answer short and ready to use.";

/* Message templates. v = {me, them, role, co, skill}. Anything in [brackets] is for you to fill in. */
const TEMPLATES = {
  "Ask a senior for guidance": v => `Hi ${v.them || "[Name]"},

I'm ${v.me || "[Your name]"}, ${v.co ? "joining " + v.co : "starting my career"} soon. I've followed your work as ${v.role || "[their role]"} and it's the kind of path I'd like to grow into.

My strengths are ${v.skill || "[your skill]"}, and I'm learning fast. Could I ask you two or three questions about how you started, over a 15-minute call or chat whenever suits you?

No pressure at all. Thank you for reading this.

Regards,
${v.me || "[Your name]"}`,

  "LinkedIn connection note (short)": v => `Hi ${v.them || "[Name]"}, I'm ${v.me || "[Your name]"}, ${v.skill ? "into " + v.skill : "early in my career"}. I admire your work${v.co ? " at " + v.co : ""}. I'd love to connect and learn from you.`,

  "Introduce myself to my team": v => `Hi everyone,

I'm ${v.me || "[Your name]"}, and I've just joined ${v.co || "the team"}. I'm good at ${v.skill || "[your skill]"} and I'm here to learn and contribute.

If you have a small task I can help with, or advice on how things work here, I'd really appreciate it. Looking forward to working with you all.

${v.me || "[Your name]"}`,

  "Ask my manager for help": v => `Hi ${v.them || "[Manager name]"},

I've started on [task name] and I've tried [what you tried]. I'm stuck on [exact problem].

Could you spare 10 minutes, or point me to someone who knows this? I want to get it right.

Thanks,
${v.me || "[Your name]"}`,

  "Ask for feedback": v => `Hi ${v.them || "[Name]"},

I'd like to improve fast. Could you tell me one thing I did well and one thing I should do better on [task or project]? A few lines is enough.

Thank you,
${v.me || "[Your name]"}`,

  "Admit a mistake and fix it": v => `Hi ${v.them || "[Name]"},

I found a mistake in [what]. It happened because [short reason]. I have already [what you fixed] and I'll make sure [how you'll prevent it].

Please tell me if you'd like me to do anything else.

${v.me || "[Your name]"}`,

  "Say no to extra work politely": v => `Hi ${v.them || "[Name]"},

I'd like to help, but I'm fully booked with [current tasks] until [date]. If this is the top priority, tell me which of my tasks should move. Otherwise I can start on [date].

Thanks,
${v.me || "[Your name]"}`,

  "Follow up (no reply yet)": v => `Hi ${v.them || "[Name]"},

Following up on my earlier message about [topic]. I know you're busy, so a one-line reply is completely fine.

Thank you,
${v.me || "[Your name]"}`,

  "Thank someone who helped me": v => `Hi ${v.them || "[Name]"},

Thank you for [what they did]. It helped me [result]. I really appreciate you taking the time.

${v.me || "[Your name]"}`,

  "Ask for a referral or opening": v => `Hi ${v.them || "[Name]"},

I'm ${v.me || "[Your name]"}, strong in ${v.skill || "[your skill]"}. I saw an opening at ${v.co || "[company]"} for [role] and I think I'm a good fit.

Would you be open to referring me, or telling me who to speak to? I can send my resume and examples of my work.

Thank you,
${v.me || "[Your name]"}`,

  "Ask for a day off": v => `Hi ${v.them || "[Manager name]"},

I'd like to take leave on [date] for [short reason]. I'll finish [pending work] before then, and [colleague] can cover anything urgent.

Please let me know if that works.

Thanks,
${v.me || "[Your name]"}`,

  "Ask to work from home": v => `Hi ${v.them || "[Manager name]"},

Could I work from home on [date]? My reason is [short reason]. I'll be online during work hours and my work for the day is [tasks].

Thanks,
${v.me || "[Your name]"}`,

  "Ask for a salary review": v => `Hi ${v.them || "[Manager name]"},

I'd like to discuss my growth and compensation. In the last [time], I've [2 or 3 real results]. Could we find 20 minutes this week to talk about it?

Thank you,
${v.me || "[Your name]"}`,

  "Resign politely": v => `Hi ${v.them || "[Manager name]"},

I'm writing to resign from my role as ${v.role || "[your role]"}, with my last working day on [date, as per notice period]. Thank you for the learning and support.

I'll complete my handover so the work continues smoothly.

Regards,
${v.me || "[Your name]"}`
};

/* Office words: [word, plain meaning, a sentence you can say] */
const GLOSSARY = [
  ["CTC", "Cost to Company: the total yearly money the company spends on you, including benefits. It is NOT what lands in your account.", "What will my monthly in-hand be?"],
  ["In-hand salary", "The money that reaches your bank each month after tax, PF and other deductions.", "Could you share the in-hand breakup?"],
  ["PF (Provident Fund)", "Retirement savings. A part of your salary plus the company's share goes in every month. You can't spend it freely, but it is yours.", ""],
  ["Gratuity", "A bonus the company pays if you stay 5 or more years.", ""],
  ["Notice period", "How long you must keep working after you resign, often 30 to 90 days.", ""],
  ["Probation", "The first months when the company decides whether to confirm you. Work steadily, ask questions, be on time.", ""],
  ["KPI", "Key Performance Indicator: a number that measures your work, such as tasks closed or tickets solved.", "Which KPIs will my work be measured on?"],
  ["Stakeholder", "Anyone affected by or interested in your work: your manager, a client, another team.", "I'll keep the stakeholders updated."],
  ["Deliverable", "The actual thing you hand over: a report, a feature, a design.", "What is the deliverable and the deadline?"],
  ["ETA", "Estimated Time of Arrival: when you expect to finish.", "My ETA for this is Thursday evening."],
  ["Sprint", "A fixed work cycle, usually 1 to 2 weeks, in software teams. Tasks are planned at the start and reviewed at the end.", ""],
  ["Stand-up", "A short daily meeting, often 10 minutes. Say what you did, what you'll do, and what is blocking you.", "Yesterday I did X, today I'll do Y, no blockers."],
  ["Agile", "Working in small steps with frequent feedback, instead of one big plan.", ""],
  ["Scrum", "The most common Agile method: sprints, stand-ups and a task list called the backlog.", ""],
  ["Backlog", "The waiting list of tasks the team plans to do.", ""],
  ["Ticket", "A written task or bug in a tool such as Jira.", "I've picked up ticket 142."],
  ["Bandwidth", "How much free time you have for new work. Not internet speed.", "I have bandwidth to take this on."],
  ["Escalate", "Raise a problem to a higher person because you can't solve it at your level. Normal and professional.", "I'd like to escalate this since it is blocked."],
  ["Sync / Touchpoint", "A short meeting or call to align.", "Can we do a quick sync at 4?"],
  ["Circle back", "Return to the topic later.", ""],
  ["Action item", "A task someone agreed to do after a meeting. Write yours down.", "My action item is to send the report by Friday."],
  ["MoM", "Minutes of Meeting: a written summary of what was decided and who does what.", "I'll share the MoM today."],
  ["EOD / COB", "End of Day / Close of Business: by the end of the working day.", ""],
  ["PL / CL / SL", "Privilege, casual and sick leave: different types of leave days.", ""],
  ["WFH", "Work from home.", ""],
  ["HR", "Human Resources: joining formalities, salary slips, leave and complaints.", ""],
  ["Appraisal", "A yearly or half-yearly review that decides your rating, raise and promotion.", ""],
  ["Onboarding", "Your first days: documents, laptop, accounts, introductions.", ""],
  ["SLA", "Service Level Agreement: a promise about how fast work is done, such as replying to a customer in 4 hours.", ""],
  ["Client / Vendor", "A client pays for the work. A vendor supplies something to you.", ""],
  ["P&L", "Profit and Loss: money earned minus money spent. It shows if a team or company makes a profit.", ""],
  ["ROI", "Return on Investment: how much you gain compared to what you spent.", ""],
  ["Pipeline", "Work or deals in progress that are not finished yet.", ""],
  ["POC", "Proof of Concept (a small test to show an idea works) or Point of Contact (the person to talk to).", "Who is the POC for this?"],
  ["Legacy / Deprecated", "Old systems or features that still exist but are being phased out.", ""],
  ["Hotfix", "An urgent quick fix to a live problem.", ""],
  ["Deploy / Go live", "Releasing work so real users can use it.", ""],
  ["RCA", "Root Cause Analysis: finding the real reason a problem happened so it does not return.", ""],
  ["Cross-functional", "Involving people from different teams, like design, tech and sales.", ""],
  ["Ownership", "Taking full responsibility for a task until it is done. The most praised quality in freshers.", "I'll take ownership of this."],
  ["Low-hanging fruit", "Easy tasks that give quick results.", ""],
  ["Blocker", "Something that stops your work until someone fixes it. Raise it early.", "I'm blocked on X. Who can help?"],
  ["Offsite / Town hall", "Offsite: a team meeting outside the office. Town hall: a company-wide update from leaders.", ""]
];

/* Interview questions. v = {name, field, str, co}. */
const interviewQs = v => [
  ["Tell me about yourself", `My name is ${v.name}. I studied ${v.field}, and I enjoy building things and solving problems. My strengths are ${v.str}. I learn fast, I stay calm when I'm stuck, and I try different approaches until something works. I'm looking forward to contributing at ${v.co} and growing there.`],
  ["What are your strengths?", `My main strength is problem solving. When something doesn't work, I break it into small parts and test each one. I'm also strong in ${v.str}. For example, [one real example from a project or college].`],
  ["What is your weakness?", "I used to hesitate to ask for help and spent too long stuck. Now I give myself a time limit, and if I'm still stuck, I ask. It saves time for everyone."],
  ["Why do you want to join us?", `${v.co} works on things I want to learn from. I want to start my career with real projects and good people, and I believe my ${v.str} can help the team.`],
  ["Where do you see yourself in 5 years?", "I want to become a reliable expert in my field, take on bigger responsibilities, and help newer people the way I was helped."],
  ["Expected salary?", "I'd like to learn the full range for this role first. Based on my skills and the market, I'm open to a fair package, and I'm focused on learning and growth right now. What range did you have in mind?"],
  ["Any questions for us?", "What does success look like in the first 3 months? What should I learn first? What does a typical week look like for this team?"],
  ["Tell me about a problem you solved", "Situation: [what was wrong]. Task: [what you had to do]. Action: [what you tried, step by step]. Result: [what happened]. Use a real example from college or a project."],
  ["Are you ready to relocate or work shifts?", "I'm flexible. Could you tell me what the expectations are so I can plan properly?"],
  ["What if you don't know the answer?", "I'd say so honestly, tell what I do know, and explain how I would find the answer. Then I'd come back with it."]
];

const FIRST_DAY = [
  "Reach 10 minutes early and keep your phone on silent",
  "Carry ID, certificates and passport photos in a folder",
  "Greet people, say your name clearly",
  "Note the names and roles of people who help you",
  "Ask your manager: what should I learn first?",
  "Write down every instruction in a notebook",
  "Ask who to contact for IT issues and Wi-Fi",
  "Have lunch with the team at least once",
  "Don't pretend to know. Say: I'll find out and tell you by evening",
  "At day end, write down 3 things you learned"
];

/* What kind of answer to ask an outside AI for. */
const ASK_MODES = {
  "Write it for me": "Write the exact message or text, ready to copy and send. Give one main version and one shorter version.",
  "Explain it simply": "Explain it from zero: one-line meaning, a real-life example, how it appears in a job, 3 things to remember, and one sentence I can say in a meeting.",
  "Solve it for me": "Give the answer or recommendation first in one or two sentences, then short reasoning, then the exact first step written out.",
  "Prepare me": "Prepare me completely: exact words and answers to use, common mistakes to avoid, and a two-minute checklist to read before it starts."
};

const AI_APPS = [
  { name: "ChatGPT", url: q => "https://chatgpt.com/?q=" + q },
  { name: "Claude", url: q => "https://claude.ai/new?q=" + q },
  { name: "Perplexity", url: q => "https://www.perplexity.ai/search?q=" + q },
  { name: "Copilot", url: q => "https://copilot.microsoft.com/?q=" + q },
  { name: "Gemini", url: () => "https://gemini.google.com/app", noPrefill: true }
];
