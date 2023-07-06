import { useState, FormEvent } from "react";
import { Toaster, toast } from "react-hot-toast";
import { convert } from "html-to-text";

const Home = () => {
  const [html, setHtml] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const apiToken = "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"; // Replace with your actual API token

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    generateSummary();
  };

  const generateSummary = async () => {
    setSummary("");
    if (!html) {
      toast.error("HTML is mandatory");
      return;
    }

    setLoading(true);
    const text = convert(html); // Convert HTML to plain text

    const payload = {
      html: text,
      apiToken: apiToken,
    };

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error("Sorry something went wrong");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let summaryData = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkData = decoder.decode(value, { stream: !done });
          summaryData += chunkData;
        }
      }

      setSummary(summaryData);
    } catch (error) {
      console.log("An error occurred:", error);
      toast.error("Sorry something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-auto max-w-6xl">
      <h1>HTML to Text Conversion</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          className="h-96 w-full bg-transparent text-white"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Converting..." : "Convert"}
        </button>
      </form>

      {summary && (
        <div className="m-auto w-full max-w-4xl">
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
    </div>
  );
};

export default Home;
