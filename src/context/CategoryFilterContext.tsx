import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CategoryFilterContextType {
    selectedCategoryId: number | null;
    selectedSubCategoryId: number | null;
    setSelectedCategory: (categoryId: number | null, subCategoryId: number | null) => void;
    clearFilter: () => void;
}

const CategoryFilterContext = createContext<CategoryFilterContextType | undefined>(undefined);

export const CategoryFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);

    const setSelectedCategory = (categoryId: number | null, subCategoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        setSelectedSubCategoryId(subCategoryId);
    };

    const clearFilter = () => {
        setSelectedCategoryId(null);
        setSelectedSubCategoryId(null);
    };

    return (
        <CategoryFilterContext.Provider
            value={{
                selectedCategoryId,
                selectedSubCategoryId,
                setSelectedCategory,
                clearFilter,
            }}
        >
            {children}
        </CategoryFilterContext.Provider>
    );
};

export const useCategoryFilter = () => {
    const context = useContext(CategoryFilterContext);
    if (context === undefined) {
        throw new Error('useCategoryFilter must be used within a CategoryFilterProvider');
    }
    return context;
};
