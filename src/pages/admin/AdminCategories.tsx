import React, { useState } from "react";
import {
    useGetApiCategoriesTree,
    usePostApiCategories,
    usePutApiCategoriesId,
    useDeleteApiCategoriesId,
} from "@/api/generated/categories/categories";
import {
    usePostApiSubCategories,
    usePutApiSubCategoriesId,
    useDeleteApiSubCategoriesId,
} from "@/api/generated/sub-categories/sub-categories";
import { queryClient } from "@/api";
import { FolderPlus, Edit3, Trash2, ChevronDown, ChevronRight, PlusCircle, Tag, FolderTree, Network } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AdminCategories: React.FC = () => {
    const { t } = useTranslation();
    const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});

    // Fetch the entire tree
    const { data: treeData, isLoading } = useGetApiCategoriesTree();

    // Category Mutators
    const { mutate: createCat, isPending: isCreatingCat } = usePostApiCategories();
    const { mutate: editCat, isPending: isEditingCat } = usePutApiCategoriesId();
    const { mutate: deleteCat } = useDeleteApiCategoriesId();

    // SubCategory Mutators
    const { mutate: createSub, isPending: isCreatingSub } = usePostApiSubCategories();
    const { mutate: editSub, isPending: isEditingSub } = usePutApiSubCategoriesId();
    const { mutate: deleteSub } = useDeleteApiSubCategoriesId();

    const rawTree: any = (treeData as any)?.data || treeData;
    const categoriesList = Array.isArray(rawTree) ? rawTree : rawTree?.data || [];

    const toggleExpand = (id: number) => {
        setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const invalidateTree = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/Categories/tree"] });
    };

    // Category Actions
    const handleCreateCategory = () => {
        const name = window.prompt(t('admin.categories.prompts.newCategory', 'Enter new category name:'));
        if (!name) return;
        createCat({ data: { name } }, { onSuccess: invalidateTree });
    };

    const handleEditCategory = (id: number, currentName: string) => {
        const name = window.prompt(t('admin.categories.prompts.editCategory', 'Edit category name:'), currentName);
        if (!name || name === currentName) return;
        editCat({ id, data: { name } }, { onSuccess: invalidateTree });
    };

    const handleDeleteCategory = (id: number, name: string) => {
        if (window.confirm(t('admin.categories.prompts.confirmDeleteCategory', `Are you sure you want to delete the category "${name}"?`))) {
            deleteCat({ id }, { onSuccess: invalidateTree });
        }
    };

    // SubCategory Actions
    const handleCreateSubCategory = (categoryId: number) => {
        const name = window.prompt(t('admin.categories.prompts.newSubcategory', 'Enter new subcategory name:'));
        if (!name) return;
        createSub({ data: { categoryId, name } }, { onSuccess: invalidateTree });
    };

    const handleEditSubCategory = (id: number, categoryId: number, currentName: string) => {
        const name = window.prompt(t('admin.categories.prompts.editSubcategory', 'Edit subcategory name:'), currentName);
        if (!name || name === currentName) return;
        editSub({ id, data: { categoryId, name } }, { onSuccess: invalidateTree });
    };

    const handleDeleteSubCategory = (id: number, name: string) => {
        if (window.confirm(t('admin.categories.prompts.confirmDeleteSubcategory', `Are you sure you want to delete the subcategory "${name}"?`))) {
            deleteSub({ id }, { onSuccess: invalidateTree });
        }
    };

    const isMutating = isCreatingCat || isEditingCat || isCreatingSub || isEditingSub;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {t('admin.categories.title', 'Categories Engine')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t('admin.categories.subtitle', 'Build and manage the hierarchical taxonomy of items in the system.')}
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <button
                        onClick={handleCreateCategory}
                        disabled={isMutating}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                        {isCreatingCat ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FolderPlus className="w-4 h-4" />
                        )}
                        {t('admin.categories.newCategory', 'New Category')}
                    </button>
                </div>
            </div>

            {/* Tree Container */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
                    <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('admin.categories.taxonomyTree', 'Taxonomy Tree')}</h2>
                </div>

                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.categories.loading', 'Loading taxonomy tree...')}</p>
                    </div>
                ) : categoriesList.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                            <FolderTree className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('admin.categories.noCategories', 'No Categories Yet')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">{t('admin.categories.createFirst', 'Start building the taxonomy by adding your first root category using the button above.')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {categoriesList.map((cat: any) => (
                            <div key={cat.id} className="group">
                                {/* Category Row */}
                                <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div
                                        className="flex items-center gap-4 cursor-pointer flex-1"
                                        onClick={() => toggleExpand(cat.id)}
                                    >
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            {expandedCats[cat.id] ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 rtl:scale-x-[-1]" />
                                            )}
                                        </button>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <FolderTree className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                {t(`categories.${cat.name}`, { defaultValue: cat.name })}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    {cat.subCategories?.length || 0} {t('admin.categories.subcategoriesCountText', 'Subcategories')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Actions */}
                                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCreateSubCategory(cat.id)}
                                            disabled={isMutating}
                                            className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                            title={t('admin.categories.addSubcategory', 'Add Subcategory')}
                                        >
                                            <PlusCircle className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">{t('admin.categories.add', 'Add Sub')}</span>
                                        </button>
                                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
                                        <button
                                            onClick={() => handleEditCategory(cat.id, cat.name)}
                                            disabled={isMutating}
                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors disabled:opacity-50"
                                            title={t('admin.categories.editCategory', 'Edit Category')}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            disabled={cat.subCategories?.length > 0 || isMutating}
                                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            title={cat.subCategories?.length > 0 ? t('admin.categories.cannotDelete', 'Cannot delete while subcategories exist') : t('admin.categories.deleteCategory', 'Delete Category')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* SubCategories Drawer */}
                                {expandedCats[cat.id] && (
                                    <div className="bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
                                        {(!cat.subCategories || cat.subCategories.length === 0) ? (
                                            <div className="pl-16 pr-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <Tag className="w-3.5 h-3.5 opacity-50" />
                                                {t('admin.categories.noSubcategories', 'This category has no subcategories yet.')}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-200/50 dark:divide-gray-800/50">
                                                {cat.subCategories.map((sub: any) => (
                                                    <div key={sub.id} className="flex items-center justify-between py-3 pl-16 pr-4 sm:pr-6 rtl:pr-16 rtl:pl-4 group/sub hover:bg-white dark:hover:bg-gray-900 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-4 h-px bg-gray-300 dark:bg-gray-700 rtl:rotate-180"></div>
                                                            <Tag className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 rtl:rotate-90" />
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {t(`subcategories.${sub.name}`, { defaultValue: sub.name })}
                                                            </span>
                                                        </div>

                                                        {/* Subcategory Actions */}
                                                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover/sub:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditSubCategory(sub.id, cat.id, sub.name)}
                                                                disabled={isMutating}
                                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                                                                title={t('admin.categories.editSubcategory', 'Edit Subcategory')}
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
                                                                disabled={isMutating}
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                                                title={t('admin.categories.deleteSubcategory', 'Delete Subcategory')}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
