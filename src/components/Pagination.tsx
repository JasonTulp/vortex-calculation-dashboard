'use client';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ total, page, limit, pages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7;
    
    if (pages <= maxPagesToShow) {
      // Show all pages if there are less than maxPagesToShow
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Add ellipsis if current page is more than 4
      if (page > 4) {
        pageNumbers.push('...');
      }
      
      // Add pages around current page (2 on each side)
      const startPage = Math.max(2, page - 2);
      const endPage = Math.min(pages - 1, page + 2);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if current page is less than pages - 3
      if (page < pages - 3) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      if (pages > 1) {
        pageNumbers.push(pages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between mt-2">
      <div className="text-sm text-gray-300">
        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} results
      </div>
      {pages > 1 && (
        <div className="flex space-x-2">
          <button
            onClick={() => page > 1 && onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-1 rounded bg-mid-light text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {getPageNumbers().map((pageNumber, index) => (
            <button
              key={index}
              onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
              className={`px-2 rounded ${
                pageNumber === page
                  ? 'bg-primary text-white'
                  : pageNumber === '...'
                  ? 'text-gray-300 cursor-default'
                  : 'text-gray-300 hover:bg-light'
              }`}
              disabled={pageNumber === '...'}
            >
              {pageNumber}
            </button>
          ))}
          
          <button
            onClick={() => page < pages && onPageChange(page + 1)}
            disabled={page === pages}
            className="px-4 rounded bg-mid-light text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}; 