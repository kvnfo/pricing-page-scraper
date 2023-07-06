import { useState, FormEvent } from "react";
import { Toaster, toast } from "react-hot-toast";
import { convert } from "html-to-text";

const Home = () => {
  const [html, setHtml] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const apiKey = "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"; // Replace with your actual API key

  const handleSubmit = (e: FormEvent) => {
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
      apiKey: apiKey,
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

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.log("An error occurred:", error);
      toast.error("Sorry something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>HTML to Text Conversion</h1>

      <form onSubmit={handleSubmit}>
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} />

        <button type="submit" disabled={loading}>
          {loading ? "Converting..." : "Convert"}
        </button>
      </form>

      {summary && (
        <div>
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
