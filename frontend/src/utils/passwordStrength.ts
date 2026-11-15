// Lightweight, real (non-fake) password strength heuristic.
// This is not a substitute for zxcvbn — it's a transparent, dependency-free
// approximation based on character-class entropy, length, and common
// weak-password patterns. Good enough for user-facing guidance; documented
// as such rather than pretending to be a full cracking-time estimator.

const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "letmein",
  "admin", "welcome", "monkey", "iloveyou", "password1", "111111",
  "123123", "sunshine", "princess", "football", "dragon", "master",
]);

export interface PasswordAnalysis {
  score: number; // 0-100
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  feedback: string[];
}

export function analyzePassword(password: string): PasswordAnalysis {
  const feedback: string[] = [];

  if (!password) {
    return { score: 0, label: "Very Weak", feedback: ["Enter a password to analyze."] };
  }

  const lower = password.toLowerCase();
  let score = 0;

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  score += varietyCount * 15;

  if (varietyCount < 3) {
    feedback.push("Mix uppercase, lowercase, numbers, and symbols.");
  }

  // Length
  score += Math.min(30, Math.max(0, (password.length - 4) * 3));

  if (password.length < 10) {
    feedback.push("Use at least 10-12 characters.");
  }

  // Common password / dictionary check
  if (COMMON_PASSWORDS.has(lower)) {
    score = Math.min(score, 10);
    feedback.push("This is one of the most commonly breached passwords.");
  }

  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push("Avoid repeating the same character multiple times.");
  }

  // Sequential characters (abc, 123, etc.)
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "01234567890"];
  const hasSequence = sequences.some((seq) => {
    for (let i = 0; i < seq.length - 2; i++) {
      if (lower.includes(seq.slice(i, i + 3))) return true;
    }
    return false;
  });

  if (hasSequence) {
    score -= 10;
    feedback.push("Avoid sequential characters like \"abc\" or \"123\".");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: PasswordAnalysis["label"];

  if (score < 25) label = "Very Weak";
  else if (score < 45) label = "Weak";
  else if (score < 65) label = "Fair";
  else if (score < 85) label = "Strong";
  else label = "Very Strong";

  if (feedback.length === 0) {
    feedback.push("Looks solid. Consider a password manager for uniqueness across sites.");
  }

  return { score, label, feedback };
}
