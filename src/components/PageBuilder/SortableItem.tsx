import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import type { PageSection } from '../../types';
import { Button } from "@/components/ui/button";

interface SortableItemProps {
  id: string;
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  section,
  isSelected,
  onSelect,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getSectionIcon = (type: PageSection['type']) => {
    switch (type) {
      case 'hero': return '🎯';
      case 'features': return '⭐';
      case 'testimonials': return '💬';
      case 'faq': return '❓';
      case 'cta': return '🚀';
      case 'pricing': return '💲';
      case 'gallery': return '🖼️';
      case 'video': return '🎬';
      case 'countdown': return '⏳';
      case 'contact': return '📞';
      case 'newsletter': return '📧';
      case 'social': return '👥';
      case 'custom': return '🛠️';
      default: return '📄';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded-lg cursor-pointer transition-all flex flex-col gap-1 bg-gray-50 dark:bg-gray-800 border-border hover:bg-secondary-50 hover:border-l-2 hover:border-secondary-500 ${isSelected ? 'border-l-2 border-secondary-500 bg-secondary-50' : ''} ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
      tabIndex={0}
      aria-label={`Section: ${section.type}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 w-full">
          <div
            {...attributes}
            {...listeners}
            className="h-6 w-6 flex items-center justify-center cursor-move group"
            tabIndex={-1}
            aria-label="Drag section"
          >
            {/* 4x4 dot grid SVG for drag handle */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {[0,1,2,3].map(row =>
                [0,1,2,3].map(col =>
                  <circle key={`${row}-${col}`} cx={6+col*4} cy={6+row*4} r="1" fill="currentColor" className="text-gray-400 group-hover:text-primary-500" />
                )
              )}
            </svg>
          </div>
          <span className="text-lg" style={{ color: 'var(--tw-warning-500, #f59e0b)', opacity: 0.6 }} aria-hidden>{getSectionIcon(section.type)}</span>
          <div className="flex flex-col min-w-0 text-left">
            <p className={`text-sm font-medium capitalize truncate ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{section.type}</p>
            <p className={`text-xs truncate ${isSelected ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{section.content.title || 'Untitled'}</p>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className={`ml-2 ${isSelected ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'} transition-colors`}
          aria-label="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};