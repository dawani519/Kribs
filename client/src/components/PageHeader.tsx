import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  backButton?: boolean;
  onBack?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * PageHeader component - consistent header for all pages
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  backButton = false,
  onBack,
  className,
  icon,
}) => {
  return (
    <div className={cn(
      "flex flex-col mb-6 space-y-2",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Back button if requested */}
          {backButton && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 p-0 h-9 w-9"
              onClick={onBack}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          )}
          
          {/* Icon if provided */}
          {icon && <div className="mr-2">{icon}</div>}
          
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        {/* Action button if provided */}
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
      
      {/* Description if provided */}
      {description && (
        <p className="text-neutral-500 text-sm">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;