import React from 'react';

interface VsIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const VsIcon: React.FC<VsIconProps> = ({ className = '', size = 'md' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-[#0B1D33] text-[#FBB33B] border-2 border-[#FBB33B] font-raleway font-black italic tracking-tighter shadow-sm select-none shrink-0 ${SIZE_CLASSES[size]} ${className}`}
      title="Vachan Shivir"
      style={{
        boxShadow: '0 2px 6px rgba(11, 29, 51, 0.4)',
      }}
    >
      <span>VS</span>
    </div>
  );
};

export default VsIcon;
