import React from 'react';

export const LinkifyText = ({ text }: { text: string }) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const phoneRegex = /((?:\+|00)?(?:[0-9][\s\-]*){9,14}[0-9])/g;
    
    return (
        <>
            {text.split(urlRegex).map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" dir="ltr">
                            {part}
                        </a>
                    );
                }
                
                return (
                    <span key={index}>
                        {part.split(phoneRegex).map((subPart, subIndex) => {
                            if (subPart.match(phoneRegex) && subPart.replace(/\D/g, '').length >= 9) {
                                const cleanPhone = subPart.replace(/[^\d+]/g, '');
                                return (
                                    <a key={subIndex} href={`tel:${cleanPhone}`} className="text-blue-500 hover:underline" dir="ltr">
                                        {subPart}
                                    </a>
                                );
                            }
                            return subPart;
                        })}
                    </span>
                );
            })}
        </>
    );
};
