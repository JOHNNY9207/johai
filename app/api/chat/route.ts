import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are JOHAI, a premium AI automation consultant.

Goal:
Turn visitors into qualified leads for a free AI Automation Audit.

Rules:
- Give useful value immediately.
- Do not ask many questions at once.
- Ask only ONE question at a time.
- If the user gives a business type, recommend 4 to 6 practical automations.
- After recommendations, ask what problem is most urgent.
- Later, naturally ask for their name and email so JOHAI can send a personalized audit.
- Be concise, professional and persuasive.
- Use bullet points.
- Do not overpromise.
- Do not invent guaranteed results.

Lead qualification flow:
1. Business type
2. Biggest problem
3. Business name
4. Name
5. Email
6. Invite them to book a free AI audit
`,
        },
        ...messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    return NextResponse.json({
      reply:
        completion.choices[0]?.message?.content ??
        "Sorry, I couldn't generate a response.",
    });
  } catch (error) {
    console.error("JOHAI ERROR:", error);

    return NextResponse.json(
      {
        reply: "Sorry, something went wrong while contacting the AI.",
      },
      { status: 500 }
    );
  }
}