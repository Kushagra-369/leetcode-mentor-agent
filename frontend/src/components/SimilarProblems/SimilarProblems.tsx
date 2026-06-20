interface SimilarProblemsProps {
  problems: string[];
}

export default function SimilarProblems({
  problems,
}: SimilarProblemsProps) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <h2 className="text-xl font-semibold mb-3">
        Similar Problems
      </h2>

      <ul className="space-y-2">
        {problems.map((problem, index) => (
          <li
            key={index}
            className="bg-slate-800 p-3 rounded-lg"
          >
            {problem}
          </li>
        ))}
      </ul>
    </div>
  );
}