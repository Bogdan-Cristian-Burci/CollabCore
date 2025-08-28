import React from "react";

interface BulletListItemProps {
  step: number | string;
  title: string;
  className?: string;
}

export const BulletListItem: React.FC<BulletListItemProps> = ({ step, title, className }) => (
  <div className={`flex items-center gap-3 ${className ?? ""}`}>
    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">{step}</div>
    <h2 className="text-lg font-semibold">{title}</h2>
  </div>
);

