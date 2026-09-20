import { apiRequest } from "./client";

export type Overview = {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalSavings: number;
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
};

export function getOverview(token: string) {
  return apiRequest<Overview>("/overview", token);
}
