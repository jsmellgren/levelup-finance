import { apiRequest } from "./client";

export function askCoach(token: string, question: string) {
  return apiRequest<{ answer: string }>("/coach/ask", token, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}
