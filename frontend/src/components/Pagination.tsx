interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ current, total, pageSize = 10, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1 && total <= pageSize) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    // Center window around current page
    let start = Math.max(1, current - 2);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    return start + i;
  }).filter(p => p <= totalPages);

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-blue-50 bg-[#f0f4ff]/50 rounded-b-xl">
      <p className="text-xs text-blue-400/60">
        Page <span className="font-bold text-[#0d1f3c]">{current}</span> of{' '}
        <span className="font-bold text-[#0d1f3c]">{totalPages || 1}</span>
        <span className="text-blue-300 mx-1">·</span>
        <span className="font-bold text-[#0d1f3c]">{total}</span> total
      </p>
      <div className="flex gap-1.5">
        <button
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
          className="px-3 py-1.5 text-xs font-semibold border border-blue-100 rounded-lg text-blue-500 disabled:opacity-30 hover:bg-blue-50 transition-all"
        >
          Previous
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
              current === p
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'border border-blue-100 text-blue-400 hover:bg-blue-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={current === totalPages || totalPages === 0}
          onClick={() => onPageChange(current + 1)}
          className="px-3 py-1.5 text-xs font-semibold border border-blue-100 rounded-lg text-blue-500 disabled:opacity-30 hover:bg-blue-50 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
