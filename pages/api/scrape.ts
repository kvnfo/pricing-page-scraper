import { convert } from "html-to-text";
import { ChatMessage, OpenAIStream } from "../../utils/OpenAIStream";

interface RequestData {
  html: string;
  apiToken: string;
}

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const { html, apiToken } = (await req.json()) as RequestData;

  if (!html || !apiToken) {
    console.log("Invalid request. HTML and API token are required.");
    return new Response("Invalid request. HTML and API token are required.", {
      status: 400,
    });
  }

  try {
    const text = convert(html); // Convert HTML to plain text

    console.log("HTML:", html);
    console.log("Plain Text:", text);

    const formatPrompt = `Put this event data into a JSON with keys "Date", "City, "State" "Venue", "Ticket Link" "Longitude" & "Latitude" Use the city to generate Longitude and Latitude.  \n`;
    const userPrompt = `Can you format this unstructured event data into structured format?\n\nInput text:\n${text}\n`;
    const messages: ChatMessage[] = [
      { role: "user", content: formatPrompt },
      { role: "assistant", content: userPrompt },
    ];

    const payload = {
      model: "gpt-3.5-turbo-16k",
      messages,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 2000,
      stream: true,
      n: 1,
    };
    console.log("OpenAI API Request:", payload);

    const stream = await OpenAIStream(payload, apiToken);

    console.log("OpenAI Streaming Response:", stream);

    return new Response(stream, { status: 200 });
  } catch (error: any) {
    console.log("An error occurred:", error);
    return new Response("Error occurred while processing the HTML", {
      status: 500,
    });
  }
}
