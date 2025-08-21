import * as React from 'react';

interface CollapsibleProps {
  children: React.ReactNode;
}

const Collapsible = ({ children }: CollapsibleProps) => {
  return <div>{children}</div>;
};

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const CollapsibleTrigger = ({ children, onClick }: CollapsibleTriggerProps) => {
  return <div onClick={onClick}>{children}</div>;
};

interface CollapsibleContentProps {
  children: React.ReactNode;
}

const CollapsibleContent = ({ children }: CollapsibleContentProps) => {
  return <div className="animate-in slide-in-from-top-1">{children}</div>;
};

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
