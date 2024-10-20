const moment = require("moment");

function detectFileType(data) {
  if (data.includes("WITHDRAWAL (DR.)")) return "file1";
  if (data.includes("Value") && data.includes("Ref No.")) return "file2";
  if (data.includes("Entry Date")) return "file3";
  if (data.includes("Chq No")) return "file4";
  if (data.includes("TRANSACTION DATE")) return "file5";
  if (data.includes("Narration")) return "file6";
  throw new Error("Unsupported file format.");
}

function parseFile1(data) {
  const transactions = [];
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let currentTransaction = {};
  let currentNarration = "";

  lines.forEach((line) => {
    const dateMatch = line.match(/\d{2}-[a-zA-Z]{3}-\d{4}/); // Detect date in DD-MMM-YYYY

    if (dateMatch) {
      // Save the previous transaction if it exists
      if (currentTransaction.date) {
        transactions.push({ ...currentTransaction });
      }

      // Initialize a new transaction
      currentTransaction = {
        date: moment(dateMatch[0], "DD-MMM-YYYY").format("DD-MMM-YYYY"),
        narration: "",
        amount: "-",
        type: "-",
      };
      currentNarration = line.replace(dateMatch[0], "").trim(); // Start narration
    } else {
      // Append to narration and collapse excessive spaces between words
      currentNarration += ` ${line}`.replace(/\s{2,}/g, " "); // Collapse multiple spaces to one
    }

    // Detect amounts (withdrawal or deposit) and classify the type
    const withdrawalMatch = line.match(/\b(\d+(?:\.\d+)?)\s*$/); // Withdrawal amount
    const depositMatch = line.match(/\b(\d+(?:\.\d+)?)\s{2,}\d+\s*$/); // Deposit amount

    if (withdrawalMatch && !line.includes("DEPOSIT")) {
      currentTransaction.amount = parseFloat(withdrawalMatch[1]);
      currentTransaction.type = "Debit";
    } else if (depositMatch) {
      currentTransaction.amount = parseFloat(depositMatch[1]);
      currentTransaction.type = "Credit";
    }

    // Clean up any remaining numeric or empty patterns from the narration
    currentTransaction.narration = currentNarration
      .replace(/\s+\d+(?:\.\d+)?\s*\d*$/, "") // Remove trailing numbers
      .replace(/\s{2,}/g, " ") // Collapse excessive spaces
      .trim();
  });

  // Push the last transaction
  if (currentTransaction.date) {
    transactions.push(currentTransaction);
  }

  return transactions;
}

function parseFile2(data) {
  const transactions = [];
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let currentTransaction = {};
  let currentNarration = "";

  lines.forEach((line) => {
    const dateMatch = line.match(/\d{2}-[a-zA-Z]{3}-\d{4}/); // Detect date in DD-MMM-YYYY

    if (dateMatch) {
      // Save the previous transaction if it exists
      if (currentTransaction.date) {
        transactions.push({ ...currentTransaction });
      }

      // Initialize a new transaction
      currentTransaction = {
        date: moment(dateMatch[0], "DD-MMM-YYYY").format("DD-MMM-YYYY"),
        narration: "",
        amount: "-",
        type: "-",
      };
      currentNarration = line.replace(dateMatch[0], "").trim(); // Start narration
    } else {
      // Append to narration and collapse excessive spaces between words
      currentNarration += ` ${line}`.replace(/\s{2,}/g, " "); // Collapse multiple spaces to one
    }

    // Detect amounts (withdrawal or deposit) and classify the type
    const withdrawalMatch = line.match(/\b(\d+(?:\.\d+)?)\s*$/); // Withdrawal amount
    const depositMatch = line.match(/\b(\d+(?:\.\d+)?)\s{2,}\d+\s*$/); // Deposit amount

    if (withdrawalMatch && !line.includes("DEPOSIT")) {
      currentTransaction.amount = parseFloat(withdrawalMatch[1]);
      currentTransaction.type = "Debit";
    } else if (depositMatch) {
      currentTransaction.amount = parseFloat(depositMatch[1]);
      currentTransaction.type = "Credit";
    }

    // Clean up any remaining numeric or empty patterns from the narration
    currentTransaction.narration = currentNarration
      .replace(/\s+\d+(?:\.\d+)?\s*\d*$/, "") // Remove trailing numbers
      .replace(/\s{2,}/g, " ") // Collapse excessive spaces
      .trim();
  });

  // Push the last transaction
  if (currentTransaction.date) {
    transactions.push(currentTransaction);
  }

  return transactions;
}

// Main parse function to detect and parse the correct format
function parseStatement(data) {
  const fileType = detectFileType(data);
  switch (fileType) {
    case "file1":
      return parseFile1(data);
    // Add cases for other formats
    case "file2":
      return parseFile2(data);
    default:
      throw new Error("Unknown format");
  }
}

module.exports = { parseStatement };
