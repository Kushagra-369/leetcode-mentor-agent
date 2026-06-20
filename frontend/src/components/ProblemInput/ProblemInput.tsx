interface ProblemInputProps {
  problem: string;
  setProblem: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onAnalyze: () => void;
}

export default function ProblemInput({
  problem,
  setProblem,
  loading,
  onAnalyze,
}: ProblemInputProps) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <textarea
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="Paste your LeetCode problem here..."
        className="w-full h-48 bg-slate-800 rounded-lg p-4 outline-none resize-none"
      />

      <button
        onClick={onAnalyze}
        disabled={loading}
        className="mt-4 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "Analyzing..." : "Analyze Problem"}
      </button>
    </div>
  );
}