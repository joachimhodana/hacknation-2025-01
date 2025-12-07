import { Button } from "@/components/ui/button.tsx"

interface CharactersListPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const CharactersListPagination = ({ currentPage, totalPages, onPageChange }: CharactersListPaginationProps) => {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Poprzednia
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={currentPage === page ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
          >
            {page}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Następna
      </Button>
    </div>
  )
}

export default CharactersListPagination
