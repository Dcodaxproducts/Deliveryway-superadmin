import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={`space-y-[24px] mb-[22px] lg:mb-[52px] px-[14px] py-[20px] lg:p-[24px] overflow-x-hidden w-full ${className || ''}`}>
      {children}
    </div>
  );
};

export default Container;
