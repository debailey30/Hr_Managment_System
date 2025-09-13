import React, { ReactNode } from 'react';

type HRManagementAppProps = {
  children: ReactNode;
};

const HRManagementApp = ({ children }: HRManagementAppProps) => {
  return (
    <div>
      {/* HR Management System Main Wrapper */}
      {children}
    </div>
  );
};

export default HRManagementApp;
