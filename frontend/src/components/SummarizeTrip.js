import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Context } from "../contexts";

export const SummarizeTrip = ({ onDone }) => {
  const { expenseHistory } = useContext(Context);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    const apiKey = "AIzaSyCw_egCQMGVhYrDCwCshC6sUIg8T7R3Fcw";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Here is an expense history from a trip:\n\n${JSON.stringify(
                expenseHistory
              )}\n\nAnalyze the data and summarize where most of the money was spent. 
              Identify key spending categories such as food, travel, accommodation, and activities. 
              Provide a structured summary in a readable format with clear category headings within 20 lines.`,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      const aiSummary =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No summary available.";

      setSummary(formatSummary(aiSummary));
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary("Failed to generate summary.");
    }
  };

  const formatSummary = (summaryText) => {
    return summaryText
      .replace(/\*\*(.*?)\*\*/g, "<h3>$1</h3>") // Convert **bold** to <h3>
      .replace(/\n\s*\*\s/g, "<li>") // Convert "* " to <li>
      .replace(/\n/g, "<br>") // Convert newlines to <br>
      .replace(/<\/li><br>/g, "</li>"); // Fix unnecessary <br> inside lists
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Trip Expense Summary</h2>
      <div style={styles.summaryBox}>
        {summary ? (
          <div dangerouslySetInnerHTML={{ __html: summary }} />
        ) : (
          <p>Loading summary...</p>
        )}
      </div>
      <button style={styles.doneButton} onClick={onDone}>
        Done
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "650px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    fontSize: "22px",
    marginBottom: "15px",
  },
  summaryBox: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    textAlign: "left",
    lineHeight: "1.6",
  },
  doneButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "block",
    width: "100%",
  },
};

export default SummarizeTrip;
