import React from 'react';

export default function Button({
    children,
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
    size = 'md', // 'sm' | 'md' | 'lg'
    className = '',
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 active:scale-[0.98]',
        outline: 'border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
