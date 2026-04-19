import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  rightContent?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, rightContent }: PageHeaderProps) {
  return (
    <div className="px-4 pt-12 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backTo && (
            <Link
              to={backTo}
              className="text-white hover:bg-white/10 p-2 rounded-xl transition-colors -ml-2"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-white/80 mt-1 text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </div>
  );
}
