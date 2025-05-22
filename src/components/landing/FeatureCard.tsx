
import React from "react";
import { 
  FileQuestion, LayoutDashboard, BarChart, 
  Building, Lock, Smartphone, LucideIcon 
} from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  const getIcon = (): React.ReactNode => {
    const iconProps = { className: "h-10 w-10 text-primary mb-4" };
    
    switch (icon) {
      case "FileQuestion":
        return <FileQuestion {...iconProps} />;
      case "LayoutDashboard":
        return <LayoutDashboard {...iconProps} />;
      case "BarChart":
        return <BarChart {...iconProps} />;
      case "Building":
        return <Building {...iconProps} />;
      case "Lock":
        return <Lock {...iconProps} />;
      case "Smartphone":
        return <Smartphone {...iconProps} />;
      default:
        return <FileQuestion {...iconProps} />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {getIcon()}
      <h3 className="text-xl font-semibold text-primary mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
