import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TechBorderCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export const TechBorderCard = ({ 
  title, 
  children, 
  className,
  headerRight 
}: TechBorderCardProps) => {
  return (
    <div className={cn("tech-border-card", className)}>
      {/* Corner decorations */}
      <div className="tech-corner tech-corner-tl" />
      <div className="tech-corner tech-corner-tr" />
      <div className="tech-corner tech-corner-bl" />
      <div className="tech-corner tech-corner-br" />
      
      {/* Header */}
      <div className="card-header-with-toggle">
        <div className="card-title-tech">{title}</div>
        {headerRight}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
