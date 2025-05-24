
import React from "react";
import { 
  FileQuestion, LayoutDashboard, BarChart, 
  Building, Lock, Smartphone, FileText, Video, ChartBar
} from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  const getIcon = (): React.ReactNode => {
    const iconProps = { className: "h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4 flex-shrink-0" };
    
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
      case "FileText":
        return <FileText {...iconProps} />;
      case "Video":
        return <Video {...iconProps} />;
      case "ChartBar":
        return <ChartBar {...iconProps} />;
      default:
        return <FileQuestion {...iconProps} />;
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex justify-center sm:justify-start">
        {getIcon()}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-3 text-center sm:text-left">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left flex-1">{description}</p>
    </div>
  );
};

export default FeatureCard;
