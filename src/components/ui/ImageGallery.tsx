import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { resolveImageUrl } from "@/utils/imageUrl";

interface ImageItem {
    imageUrl?: string;
    [key: string]: any;
}

interface ImageGalleryProps {
    images: (ImageItem | string)[];
    altText?: string;
    className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, altText = "Image", className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!images || images.length === 0) {
        return null;
    }

    const getImageUrl = (img: ImageItem | string) => {
        if (typeof img === "string") return resolveImageUrl(img);
        return resolveImageUrl(img?.imageUrl);
    };

    const validImages = images.filter(img => getImageUrl(img));

    if (validImages.length === 0) {
        return null;
    }

    const handlePrevious = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    };

    const handleNext = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    };

    const toggleFullscreen = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setIsFullscreen(!isFullscreen);
    };

    // Handle keyboard navigation for fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isFullscreen) return;
            if (e.key === "Escape") setIsFullscreen(false);
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreen]);

    const currentImageUrl = getImageUrl(validImages[currentIndex]);

    return (
        <>
            {/* Inline Gallery */}
            <div className={`relative group overflow-hidden rounded-2xl bg-black/5 ${className}`}>
                <div 
                    className="w-full h-full cursor-pointer relative"
                    onClick={toggleFullscreen}
                >
                    <img
                        src={currentImageUrl}
                        alt={`${altText} ${currentIndex + 1}`}
                        className="w-full h-full object-contain bg-black/5 dark:bg-black/40"
                    />
                    
                    {/* Hover Overlay for fullscreen */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 dark:bg-black/60 p-2 rounded-full shadow-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all">
                            <Maximize2 className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                {validImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-black/50 text-gray-800 dark:text-white shadow-md hover:bg-white dark:hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-black/50 text-gray-800 dark:text-white shadow-md hover:bg-white dark:hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        >
                            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-md">
                            {currentIndex + 1} / {validImages.length}
                        </div>
                        
                        {/* Indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {validImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentIndex 
                                            ? "bg-white scale-110" 
                                            : "bg-white/50 hover:bg-white/80"
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Fullscreen Lightbox Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
                    {/* Close Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Image Counter (Fullscreen) */}
                    {validImages.length > 1 && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium z-50">
                            {currentIndex + 1} / {validImages.length}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12" onClick={toggleFullscreen}>
                        <img
                            src={currentImageUrl}
                            alt={`${altText} ${currentIndex + 1} (Fullscreen)`}
                            className="max-w-full max-h-full object-contain rounded-md"
                            onClick={(e) => e.stopPropagation()} // Prevent click from closing
                        />
                    </div>

                    {/* Navigation Arrows (Fullscreen) */}
                    {validImages.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                            >
                                <ChevronLeft className="w-8 h-8 rtl:rotate-180" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                            >
                                <ChevronRight className="w-8 h-8 rtl:rotate-180" />
                            </button>
                            
                            {/* Thumbnails (Fullscreen) */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2">
                                {validImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(idx);
                                        }}
                                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all border-2 ${
                                            idx === currentIndex 
                                                ? "border-blue-500 opacity-100" 
                                                : "border-transparent opacity-50 hover:opacity-100"
                                        }`}
                                    >
                                        <img 
                                            src={getImageUrl(img)} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};
