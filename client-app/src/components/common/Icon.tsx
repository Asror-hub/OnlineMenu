import React from 'react';
import * as Icons from 'react-icons/fi';

interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 20, className }) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent size={size} className={className} />;
};

export default Icon;

