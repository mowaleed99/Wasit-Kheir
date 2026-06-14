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
        <div className="w-full pb-12">
            {/* Header Section */}
            <div className="mb-8 bg-gradient-to-r from-stone-900 via-stone-800 to-neutral-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">{t('admin.categories.title', 'Categories Engine')}</h1>
                    <p className="text-stone-300 max-w-lg">{t('admin.categories.subtitle', 'Build and manage the hierarchical taxonomy of items in the system.')}</p>
                </div>

                <div className="relative z-10 flex-shrink-0">
                    <button
                        onClick={handleCreateCategory}
                        disabled={isMutating}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-amber-500/25 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isCreatingCat ? (
                            <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                        ) : (
                            <FolderPlus className="w-5 h-5" />
                        )}
                        {t('admin.categories.newCategory', 'New Category')}
                    </button>
                </div>
            </div>

            {/* Tree Container */}
            <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                    <Network className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-bold text-foreground">Taxonomy Tree</h2>
                </div>

                {isLoading ? (
                    <div className="text-center py-24">
                        <div className="w-12 h-12 border-4 border-stone-800 dark:border-stone-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">{t('admin.categories.loading', 'Loading taxonomy tree...')}</p>
                    </div>
                ) : categoriesList.length === 0 ? (
                    <div className="text-center py-24 px-4">
                        <div className="w-20 h-20 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-4 mx-auto ring-8 ring-muted/20">
                            <FolderTree className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{t('admin.categories.noCategories', 'No Categories Yet')}</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">{t('admin.categories.createFirst', 'Start building the taxonomy by adding your first root category using the button above.')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {categoriesList.map((cat: any) => (
                            <div key={cat.id} className="group">
                                {/* Category Row */}
                                <div className="flex items-center justify-between p-5 hover:bg-muted/40 transition-colors">
                                    <div
                                        className="flex items-center gap-4 cursor-pointer flex-1"
                                        onClick={() => toggleExpand(cat.id)}
                                    >
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-background border border-border text-foreground hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-800 transition-colors shadow-sm">
                                            {expandedCats[cat.id] ? (
                                                <ChevronDown className="w-5 h-5" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 rtl:scale-x-[-1]" />
                                            )}
                                        </button>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                                <FolderTree className="w-5 h-5 text-amber-500" />
                                                {t(`categories.${cat.name}`, { defaultValue: cat.name })}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                                    {cat.subCategories?.length || 0} Subcategories
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Actions */}
                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCreateSubCategory(cat.id)}
                                            disabled={isMutating}
                                            className="px-3 py-1.5 text-sm font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                            title={t('admin.categories.addSubcategory', 'Add Subcategory')}
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            <span className="hidden sm:inline">Add Sub</span>
                                        </button>
                                        <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
                                        <button
                                            onClick={() => handleEditCategory(cat.id, cat.name)}
                                            disabled={isMutating}
                                            className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors disabled:opacity-50"
                                            title={t('admin.categories.editCategory', 'Edit Category')}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            disabled={cat.subCategories?.length > 0 || isMutating}
                                            className="p-2 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            title={cat.subCategories?.length > 0 ? t('admin.categories.cannotDelete', 'Cannot delete while subcategories exist') : t('admin.categories.deleteCategory', 'Delete Category')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* SubCategories Drawer */}
                                {expandedCats[cat.id] && (
                                    <div className="bg-stone-50/50 dark:bg-stone-900/20 border-t border-border">
                                        {(!cat.subCategories || cat.subCategories.length === 0) ? (
                                            <div className="pl-16 pr-6 py-6 text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Tag className="w-4 h-4 opacity-50" />
                                                {t('admin.categories.noSubcategories', 'This category has no subcategories yet.')}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border/50">
                                                {cat.subCategories.map((sub: any) => (
                                                    <div key={sub.id} className="flex items-center justify-between py-3 pl-16 pr-6 rtl:pr-16 rtl:pl-6 group/sub hover:bg-background transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-px bg-border/80 rtl:rotate-180"></div>
                                                            <Tag className="w-4 h-4 text-stone-400 dark:text-stone-500 rtl:rotate-90" />
                                                            <span className="text-sm font-bold text-foreground">
                                                                {t(`subcategories.${sub.name}`, { defaultValue: sub.name })}
                                                            </span>
                                                        </div>

                                                        {/* Subcategory Actions */}
                                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/sub:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditSubCategory(sub.id, cat.id, sub.name)}
                                                                disabled={isMutating}
                                                                className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                                                title={t('admin.categories.editSubcategory', 'Edit Subcategory')}
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
                                                                disabled={isMutating}
                                                                className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                                                                title={t('admin.categories.deleteSubcategory', 'Delete Subcategory')}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
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
