export type ImpactLevel = "critical" | "serious" | "moderate" | "minor";
export type ConfidenceLevel = "high" | "medium" | "low";
export type WCAGLevel = "A" | "AA" | "AAA";
export type IssueSource = "axe" | "custom" | "manual";
export type IssueStatus = "open" | "fixed" | "ignored" | "needs-design" | "false-positive";

export interface Recommendation {
  role: "developer" | "qa" | "designer";
  title: string;
  description: string;
  codeExample?: string;
  priority: "high" | "medium" | "low";
}

export interface Issue {
  id: string;
  source: IssueSource;
  ruleId: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  confidence: ConfidenceLevel;
  wcag: {
    level: WCAGLevel;
    criteria: string[];
  };
  node: {
    selector: string;
    snippet: string;
    xpath?: string;
  };
  context: {
    role?: string;
    accessibleName?: string;
    focusable?: boolean;
    contrastRatio?: number;
  };
  recommendations: Recommendation[];
  status: IssueStatus;
  notes?: string;
  tags: string[];
  timestamp: number;
}

export interface ScanResult {
  url: string;
  timestamp: number;
  issues: Issue[];
  summary: {
    total: number;
    bySeverity: Record<ImpactLevel, number>;
    byWCAG: Record<WCAGLevel, number>;
  };
  scanConfig?: {
    axeVersion: string;
    rules?: string[];
  };
}

export interface ScanDiff {
  newIssues: Issue[];
  resolvedIssues: Issue[];
  existingIssues: Issue[];
  summary: {
    new: number;
    resolved: number;
    existing: number;
  };
}
