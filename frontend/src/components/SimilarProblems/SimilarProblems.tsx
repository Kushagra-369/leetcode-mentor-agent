// SimilarProblems.tsx
interface SimilarProblemsProps {
  problems: string[];
}

export default function SimilarProblems({ problems }: SimilarProblemsProps) {
  return (
    <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
      <h2 className="text-xl font-semibold mb-4 text-blue-300">📚 Similar Problems</h2>
      <ul className="space-y-2">
        {problems.map((problem, index) => (
          <li
            key={index}
            className="bg-black/30 p-3 rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-all text-gray-300"
          >
            {problem}
          </li>
        ))}
      </ul>
    </div>
  );
}