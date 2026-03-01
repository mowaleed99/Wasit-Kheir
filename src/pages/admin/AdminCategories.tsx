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
import { FolderPlus, Edit3, Trash2, ChevronDown, ChevronRight, PlusCircle, Tag } from "lucide-react";

export const AdminCategories: React.FC = () => {
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
        const name = window.prompt("Enter new category name:");
        if (!name) return;
        createCat({ data: { name } }, { onSuccess: invalidateTree });
    };

    const handleEditCategory = (id: number, currentName: string) => {
        const name = window.prompt("Edit category name:", currentName);
        if (!name || name === currentName) return;
        editCat({ id, data: { name } }, { onSuccess: invalidateTree });
    };

    const handleDeleteCategory = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
            deleteCat({ id }, { onSuccess: invalidateTree });
        }
    };

    // SubCategory Actions
    const handleCreateSubCategory = (categoryId: number) => {
        const name = window.prompt("Enter new subcategory name:");
        if (!name) return;
        createSub({ data: { categoryId, name } }, { onSuccess: invalidateTree });
    };

    const handleEditSubCategory = (id: number, categoryId: number, currentName: string) => {
        const name = window.prompt("Edit subcategory name:", currentName);
        if (!name || name === currentName) return;
        editSub({ id, data: { categoryId, name } }, { onSuccess: invalidateTree });
    };

    const handleDeleteSubCategory = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete subcategory "${name}"?`)) {
            deleteSub({ id }, { onSuccess: invalidateTree });
        }
    };

    const isMutating = isCreatingCat || isEditingCat || isCreatingSub || isEditingSub;

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Manage Categories</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Organize the reporting taxonomy into categories and subcategories.</p>
                </div>
                <button
                    onClick={handleCreateCategory}
                    disabled={isMutating}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                >
                    <FolderPlus className="w-4 h-4" />
                    New Category
                </button>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading category tree...</p>
                    </div>
                ) : categoriesList.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-medium text-foreground">No categories found</h3>
                        <p className="text-muted-foreground mt-1 text-sm">Create your first category to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {categoriesList.map((cat: any) => (
                            <div key={cat.id} className="group">
                                {/* Category Row */}
                                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                        onClick={() => toggleExpand(cat.id)}
                                    >
                                        <button className="p-1 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            {expandedCats[cat.id] ? (
                                                <ChevronDown className="w-5 h-5" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5" />
                                            )}
                                        </button>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{cat.name}</h3>
                                            <p className="text-xs text-muted-foreground">{cat.subCategories?.length || 0} subcategories</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCreateSubCategory(cat.id)}
                                            disabled={isMutating}
                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                            title="Add Subcategory"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditCategory(cat.id, cat.name)}
                                            disabled={isMutating}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                            title="Edit Category Name"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            disabled={cat.subCategories?.length > 0 || isMutating}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                            title={cat.subCategories?.length > 0 ? "Cannot delete: has subcategories" : "Delete Category"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* SubCategories Drawer */}
                                {expandedCats[cat.id] && (
                                    <div className="bg-muted/30 border-t border-border">
                                        {(!cat.subCategories || cat.subCategories.length === 0) ? (
                                            <div className="px-12 py-4 text-sm text-muted-foreground italic">
                                                No subcategories yet.
                                            </div>
                                        ) : (
                                            <div className="pl-12 pr-4 divide-y divide-border">
                                                {cat.subCategories.map((sub: any) => (
                                                    <div key={sub.id} className="flex items-center justify-between py-3 group/sub">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                                                            <span className="text-sm font-medium text-foreground">{sub.name}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover/sub:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditSubCategory(sub.id, cat.id, sub.name)}
                                                                disabled={isMutating}
                                                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                                title="Edit Subcategory"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
                                                                disabled={isMutating}
                                                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                                title="Delete Subcategory"
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
