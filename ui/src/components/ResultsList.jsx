export default function ResultsList({ results }) {
  if (results.length === 0) return null;
return (
   <ul className="mt-4 space-y-3">
      {results.map((entry, i) => (
        <li key={entry.url} className="border border-gray-100 rounded p-3 hover:bg-gray-50">
          <a
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 text-sm font-medium hover:underline block truncate"
          >
            {entry.title || entry.url}
          </a>
          <p className="text-gray-400 text-xs mt-1 truncate">{entry.url}</p>
          <p className="text-gray-400 text-xs">
            Match score: {(entry.score * 100).toFixed(1)}%
          </p>
        </li>
      ))}
    </ul>
  );
}