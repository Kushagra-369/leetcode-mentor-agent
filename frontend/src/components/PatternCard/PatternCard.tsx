interface PatternCardProps {
  pattern: string;
  difficulty: string;
  explanation: string;
  complexity: string;
}

export default function PatternCard({
  pattern,
  difficulty,
  explanation,
  complexity,
}: PatternCardProps) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <h2 className="text-xl font-semibold mb-3">
        Pattern Analysis
      </h2>

      <div className="flex gap-3 mb-4">
        <span className="bg-green-600 px-3 py-1 rounded-full">
          {pattern}
        </span>

        <span className="bg-purple-600 px-3 py-1 rounded-full">
          {difficulty}
        </span>
      </div>

      <p className="mb-4 text-slate-300">
        {explanation}
      </p>

      <p>
        <strong>Complexity:</strong> {complexity}
      </p>
    </div>
  );
}