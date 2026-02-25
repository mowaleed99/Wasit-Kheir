
import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, AlertCircle, Smartphone, Car, Dog, Briefcase, Gem, Watch, Stethoscope, Book, Hammer } from "lucide-react";
import { useCategoryFilter } from "@/context/CategoryFilterContext";
import { useCategoriesTree } from "@/api";


interface Category {
  id: number;
  name: string;
  children?: Category[];
  subCategories?: Category[];
  icon?: any;
}

// Icon mapping for categories - matches backend category names
const CATEGORY_ICONS: Record<string, any> = {
  "Smart": Smartphone,
  "Smart Devices": Smartphone,
  "Emergency": AlertCircle,
  "Vehicles": Car,
  "Pets": Dog,
  "Personal Accessories": Watch,
  "Bags": Briefcase,
  "Valuable items": Gem,
  "Valuable Items": Gem,
  "golds": Gem,
  "Gold": Gem,
  "Medical Devices": Stethoscope,
  "Books and Documents": Book,
  "Books & Documents": Book,
  "Tools": Hammer,
};

// Hardcoded data as fallback - IDs match the backend database
const STATIC_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Smart Devices",
    icon: Smartphone,
    children: [
      { id: 1, name: "Mobiles" },
      { id: 2, name: "Ear buds & Headphones" },
      { id: 3, name: "Smart Watches" },
      { id: 4, name: "Power Banks" },
      { id: 5, name: "Laptops" },
      { id: 6, name: "Chargers" },
      { id: 7, name: "Tablets" },
      { id: 8, name: "Cameras" },
      { id: 9, name: "Fitness trackers" },
    ]
  },
  {
    id: 2,
    name: "Emergency",
    icon: AlertCircle,
    children: [
      { id: 10, name: "People" },
      { id: 11, name: "Identity Documents" },
      { id: 12, name: "Wallet" },
      { id: 13, name: "Important papers" },
      { id: 14, name: "keys" },
      { id: 15, name: "Money" },
      { id: 16, name: "Debit/Credit Cards" },
      { id: 17, name: "ID Badge" },
    ]
  },
  {
    id: 3,
    name: "Vehicles",
    icon: Car,
    children: [
      { id: 18, name: "Cars" },
      { id: 19, name: "Motorcycles" },
      { id: 20, name: "Bicycle" },
    ]
  },
  {
    id: 4,
    name: "Pets",
    icon: Dog,
    children: [
      { id: 21, name: "Cats" },
      { id: 22, name: "Dogs" },
      { id: 23, name: "Birds" },
    ]
  },
  {
    id: 5,
    name: "Personal Accessories",
    icon: Watch,
    children: [
      { id: 24, name: "National ID card" },
      { id: 25, name: "Driving license" },
      { id: 26, name: "Debt Cards" },
      { id: 27, name: "Eye Glasses" },
      { id: 28, name: "Keys" },
      { id: 29, name: "Umbrellas" },
      { id: 30, name: "University Card" },
      { id: 31, name: "Watches" },
      { id: 32, name: "Train contract id" },
    ]
  },
  {
    id: 6,
    name: "Bags",
    icon: Briefcase,
    children: [
      { id: 34, name: "Handbags" },
      { id: 35, name: "Luggage & Travel Bags" },
      { id: 36, name: "Kids Bags" },
      { id: 37, name: "Specialty Bags" },
      { id: 38, name: "Tote Bags" },
      { id: 39, name: "Pencil Cases & Pouches" },
      { id: 40, name: "Laptop Bags & Cases" },
      { id: 41, name: "Sports Bags/Gym Bags" },
    ]
  },
  {
    id: 7,
    name: "Valuable Items",
    icon: Gem,
    children: [
      { id: 42, name: "Jewelry" },
      { id: 43, name: "Luxury accessories" },
    ]
  },
  {
    id: 8,
    name: "Gold",
    icon: Gem,
    children: [
      { id: 44, name: "Bracelet" },
      { id: 45, name: "Necklace" },
      { id: 46, name: "Ear rings" },
      { id: 47, name: "Gold Watch" },
      { id: 48, name: "Rings" },
    ]
  },
  {
    id: 9,
    name: "Medical Devices",
    icon: Stethoscope,
    children: [
      { id: 49, name: "insulin pens" },
      { id: 50, name: "inhalers" },
      { id: 51, name: "blood pressure monitors" },
      { id: 52, name: "glucose meters" },
      { id: 53, name: "CPAP machine" },
      { id: 54, name: "Hearing aids" },
      { id: 55, name: "Insulin Pump" },
    ]
  },
  {
    id: 10,
    name: "Books & Documents",
    icon: Book,
    children: [
      { id: 56, name: "Educational materials" },
      { id: 57, name: "Business documents" },
    ]
  },
  {
    id: 11,
    name: "Tools",
    icon: Hammer,
    children: [
      { id: 58, name: "Hand tools" },
      { id: 59, name: "Power tools" },
      { id: 60, name: "Measuring equipment" },
      { id: 61, name: "Protective gear" },
      { id: 62, name: "Toolboxes and bags" },
      { id: 63, name: "Academic/Student Tools" },
      { id: 64, name: "Medical & Healthcare Tools" },
      { id: 65, name: "Laboratory Equipment" },
      { id: 66, name: "Surveying Equipment" },
    ]
  },
];

export const CategoryTree: React.FC = () => {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const { selectedCategoryId, selectedSubCategoryId, setSelectedCategory } = useCategoryFilter();

  // Fetch categories from API
  const { data: apiCategoriesData, isLoading } = useCategoriesTree();

  // Use API data if available, otherwise fall back to static data
  const categories = useMemo(() => {
    const apiData = apiCategoriesData as any;
    if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
      console.log("Using API categories:", apiData.data.data);
      // Map API categories to include icons
      return apiData.data.data.map((cat: any) => ({
        ...cat,
        icon: CATEGORY_ICONS[cat.name] || Smartphone,
        children: cat.subCategories || []
      }));
    }
    console.log("Using static categories (API data not available)");
    return STATIC_CATEGORIES;
  }, [apiCategoriesData]);

  const toggleExpand = (cat: Category, hasChildren: boolean) => {
    if (!hasChildren) {
      // This is a subcategory (leaf node)
      // Find the parent category
      const parentCategory = categories.find((c: Category) => c.children?.some((child: Category) => child.id === cat.id));
      if (parentCategory) {
        console.log("Selected subcategory:", cat.name, "ID:", cat.id, "Parent:", parentCategory.name, "Parent ID:", parentCategory.id);
        setSelectedCategory(parentCategory.id, cat.id);
      }
      return;
    }

    // This is a parent category
    const newExpanded = new Set(expanded);
    if (newExpanded.has(cat.id)) {
      newExpanded.delete(cat.id);
    } else {
      newExpanded.add(cat.id);
    }
    setExpanded(newExpanded);
    // When clicking a parent category, filter by that category (no subcategory)
    console.log("Selected category:", cat.name, "ID:", cat.id);
    setSelectedCategory(cat.id, null);
  };

  const renderTree = (cat: Category, level = 0) => {
    const isExpanded = expanded.has(cat.id);
    // Check if this category is selected
    // For parent categories: selected if selectedCategoryId matches and no subcategory is selected
    // For subcategories: selected if selectedSubCategoryId matches
    const isSelected = level === 0
      ? selectedCategoryId === cat.id && selectedSubCategoryId === null
      : selectedSubCategoryId === cat.id;
    const hasChildren = cat.children && cat.children.length > 0;
    const Icon = cat.icon;

    return (
      <div key={cat.id} className="select-none mb-1">
        <button
          onClick={() => toggleExpand(cat, !!hasChildren)}
          className={`
            flex items-center w-full text-left py-2 px-3 rounded-lg
            transition-all duration-200
            ${level === 0 ? 'hover:bg-gray-100' : 'hover:bg-gray-50'}
            ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
          `}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            )
          ) : (
            <span className="w-4 mr-2 flex-shrink-0" />
          )}

          {/* Category Icon (only for top level) */}
          {level === 0 && Icon && (
            <Icon className={`w-4 h-4 mr-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
          )}

          <span className={`text-sm ${level === 0 ? 'font-medium' : ''}`}>
            {cat.name}
          </span>
        </button>

        {/* Subcategories */}
        {hasChildren && isExpanded && (
          <div className="mt-1 ml-6 space-y-1 border-l border-gray-100">
            {cat.children!.map((child) => renderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1 p-2">
      {isLoading ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Loading categories...</p>
        </div>
      ) : (
        categories.map((cat: Category) => renderTree(cat))
      )}
    </div>
  );
};
