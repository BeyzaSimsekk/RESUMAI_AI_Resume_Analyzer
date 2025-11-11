import React, { useContext, useState, type ReactNode } from 'react'
import { createContext } from 'react';
import { cn } from '~/lib/utils';

// 🎯 Accordion'un context yapısı — kimler açık, toggle fonksiyonu vs.
interface AccordionContextType {
    activeItems: string[];
    toggleItem: (id: string) => void;
    isItemActive: (id: string) => boolean;
}

// 🎯 Context
const AccordionContext = createContext<AccordionContextType | undefined>(
    undefined
);

// 🎯 Context'e erişmek için özel hook (Accordion dışı kullanılırsa hata verir)
const useAccordion = () => {
    const context = useContext(AccordionContext);
    if(!context) {
        throw new Error("Accordion components must be used within an Accordion");
    }
    return context;
}


// 🎯 Ana Accordion bileşeni
interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string;
    allowMultiple?: boolean;
    className?: string;
}
export const Accordion: React.FC<AccordionProps> = ({ children, defaultOpen, allowMultiple = false, className = ""}) => {
    // ✅ Açık olan item id'lerini tutar
    const [activeItems,setActiveItems] = useState<string[]>( defaultOpen ? [defaultOpen] : [] );

    // ✅ Tıklanınca item'i aç/kapat
    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if(allowMultiple) {
                // birden fazla açılabiliyorsa: toggle yap
                return prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id];
            } else {
                // sadece biri açık olabilir
                return prev.includes(id) ? [] : [id];
            }
        });
    };

    const isItemActive = (id: string) => activeItems.includes(id);

    // 🎯 Tüm alt bileşenlere context sağlanıyor
    return (
        <AccordionContext.Provider
            value={{ activeItems, toggleItem, isItemActive }}
        >
            <div className={`space-y-2 ${className}`}>{children}</div>
        </AccordionContext.Provider>
    )
}

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({id, children, className = ""}) => {
    return (
        <div className={`hover:shadow-md hover:rounded-2xl transform transition-all duration-300 ease-in overflow-hidden border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
}

// 🎯 AccordionHeader: tıklanabilir başlık kısmı
interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}
export const AccordionHeader: React.FC<AccordionHeaderProps> = ({itemId, children, className="", icon, iconPosition = "right"}) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    const defaultIcon = (
        <svg
            className={cn("w-5 h-5 transition-transform duration-200", {
                "rotate-180": isActive,
            })}
            fill="none"
            stroke="#98A2B3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );

    const handleClick = () => {
        toggleItem(itemId);
    };

    return (
        <button
            onClick={handleClick}
            className={`
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer
        ${className}
      `}
        >
            <div className="flex items-center space-x-3">
                {iconPosition === "left" && (icon || defaultIcon)}
                <div className="flex-1">{children}</div>
            </div>
            {iconPosition === "right" && (icon || defaultIcon)}
        </button>
    );
}


// 🎯 AccordionContent: içeriği aç/kapat
interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}
export const AccordionContent: React.FC<AccordionContentProps> = ({itemId, children, className = ""}) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <div
            className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}
        ${className}
      `}
        >
            <div className="px-4 py-3">{children}</div>
        </div>
    )
}