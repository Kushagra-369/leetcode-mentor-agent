// PatternCard.tsx
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
    <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
      <h2 className="text-2xl font-semibold mb-4 text-blue-300">🎯 Pattern Analysis</h2>
      
      <div className="flex gap-3 mb-4 flex-wrap">
        <span className="bg-linear-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-blue-500/30">
          {pattern}
        </span>
        <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
          difficulty === "Easy" 
            ? "bg-linear-to-r from-green-500 to-emerald-500 shadow-green-500/30" 
            : difficulty === "Medium" 
            ? "bg-linear-to-r from-yellow-500 to-orange-500 shadow-yellow-500/30"
            : "bg-linear-to-r from-red-500 to-rose-500 shadow-red-500/30"
        }`}>
          {difficulty}
        </span>
      </div>

      <p className="mb-4 text-gray-300 leading-relaxed">{explanation}</p>
      
      <p className="text-gray-300">
        <strong className="text-blue-300">Complexity:</strong> {complexity}
      </p>
    </div>
  );
}