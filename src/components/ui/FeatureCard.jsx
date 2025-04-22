import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FeatureCard = ({ title, icon, description, children, isHovered }) => (
  <Card
    className={cn(
      "bg-slate-900/50 border-blue-500/20 backdrop-blur-sm relative z-10 transition-all duration-300 h-full flex flex-col",
      isHovered && "border-blue-400/40"
    )}
  >
    <CardHeader className="border-b border-blue-500/20 flex-shrink-0">
      <CardTitle className="flex items-center space-x-2 text-white">
        {icon}
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6 flex-grow flex flex-col">
      <p className="mb-6 text-gray-400 flex-shrink-0">{description}</p>
      <div className="flex-grow flex flex-col justify-center">{children}</div>
    </CardContent>
  </Card>
);

export default FeatureCard; 