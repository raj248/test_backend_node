import type { Prisma } from "@prisma/client";

export const coursesData: Prisma.CourseCreateInput[] = [
  { name: "CA Inter", courseType: "CAInter" },
  { name: "CA Final", courseType: "CAFinal" },
];

export const topicsData = (courseMap: Record<string, string>): Prisma.TopicCreateInput[] => [
  // CA Inter topics
  {
    name: "Accounting Standards",
    description: "Learn about the latest accounting standards for CA Inter.",
    course: { connect: { id: courseMap["CA Inter"] } },
  },
  {
    name: "Taxation",
    description: "Direct and indirect tax fundamentals for CA Inter.",
    course: { connect: { id: courseMap["CA Inter"] } },
  },
  {
    name: "Cost Accounting",
    description: "Concepts and applications in cost accounting for CA Inter.",
    course: { connect: { id: courseMap["CA Inter"] } },
  },

  // CA Final topics
  {
    name: "Advanced Auditing",
    description: "Deep dive into advanced auditing and professional ethics.",
    course: { connect: { id: courseMap["CA Final"] } },
  },
  {
    name: "Strategic Financial Management",
    description: "Capital budgeting, risk analysis, and advanced finance.",
    course: { connect: { id: courseMap["CA Final"] } },
  },
  {
    name: "Corporate and Economic Laws",
    description: "Laws governing companies and economic frameworks.",
    course: { connect: { id: courseMap["CA Final"] } },
  },
];

export const testPaperData = (topicId: string, topicName: string): Prisma.TestPaperCreateInput[] =>
  Array.from({ length: 5 }).map((_, i) => ({
    name: `${topicName} - Test Paper ${i + 1}`,
    description: `Practice test paper ${i + 1} for ${topicName}.`,
    timeLimitMinutes: 60 + Math.floor(Math.random() * 30), // 60-89 min
    totalMarks: 100 + Math.floor(Math.random() * 51), // 100-150 marks
    topic: { connect: { id: topicId } },
  }));

export const mcqSamples = [
  {
    question: "Which accounting standard deals with revenue recognition?",
    options: {
      a: "AS 9",
      b: "AS 10",
      c: "AS 6",
      d: "AS 13",
    },
    correctAnswer: "a",
  },
  {
    question: "Which of the following is a direct tax?",
    options: {
      a: "GST",
      b: "Income Tax",
      c: "Customs Duty",
      d: "Excise Duty",
    },
    correctAnswer: "b",
  },
  {
    question: "What is the break-even point?",
    options: {
      a: "Where profit is maximum",
      b: "Where total cost equals total revenue",
      c: "Where marginal cost equals marginal revenue",
      d: "Where sales are zero",
    },
    correctAnswer: "b",
  },
  {
    question: "Who is responsible for the preparation of audit reports?",
    options: {
      a: "Accountant",
      b: "Auditor",
      c: "Manager",
      d: "Board of Directors",
    },
    correctAnswer: "b",
  },
  {
    question: "What is capital budgeting?",
    options: {
      a: "Budget for daily expenses",
      b: "Long-term investment decision making",
      c: "Budget for salaries",
      d: "Budget for repairs",
    },
    correctAnswer: "b",
  },
  {
    question: "Which act governs company law in India?",
    options: {
      a: "Indian Contract Act",
      b: "Companies Act, 2013",
      c: "Income Tax Act",
      d: "GST Act",
    },
    correctAnswer: "b",
  },
  {
    question: "What is depreciation in accounting?",
    options: {
      a: "Increase in asset value",
      b: "Decrease in asset value",
      c: "Increase in liabilities",
      d: "Decrease in expenses",
    },
    correctAnswer: "b",
  },
  {
    question: "Which is a method of costing?",
    options: {
      a: "Job costing",
      b: "Ratio analysis",
      c: "Budgeting",
      d: "Trend analysis",
    },
    correctAnswer: "a",
  },
  {
    question: "What is the objective of financial management?",
    options: {
      a: "Profit maximization",
      b: "Wealth maximization",
      c: "Sales maximization",
      d: "Cost minimization",
    },
    correctAnswer: "b",
  },
  {
    question: "Who is the regulatory authority for auditing in India?",
    options: {
      a: "ICAI",
      b: "SEBI",
      c: "RBI",
      d: "IRDAI",
    },
    correctAnswer: "a",
  },
];
