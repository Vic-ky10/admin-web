import { Utensils, Hotel, Paperclip, Fuel, Package, Tag } from "lucide-react";
import { CategorySummary as CategorySummaryType } from "../../expense.types";

const categoryIcons: Record<string, React.ReactNode> = {
  "Food": <Utensils className="h-5 w-5 text-orange-600" />,
  "Accommodation": <Hotel className="h-5 w-5 text-indigo-600" />,
  "Office Supplies": <Paperclip className="h-5 w-5 text-cyan-600" />,
  "Petrol Charges": <Fuel className="h-5 w-5 text-amber-600" />,
  "Products": <Package className="h-5 w-5 text-emerald-600" />,
  "Other": <Tag className="h-5 w-5 text-slate-600" />,
};

const categoryBgClasses: Record<string, string> = {
  "Food": "bg-orange-50 ring-orange-100",
  "Accommodation": "bg-indigo-50 ring-indigo-100",
  "Office Supplies": "bg-cyan-50 ring-cyan-100",
  "Petrol Charges": "bg-amber-50 ring-amber-100",
  "Products": "bg-emerald-50 ring-emerald-100",
  "Other": "bg-slate-50 ring-slate-100",
};

const categoryBarColors: Record<string, string> = {
  "Food": "bg-orange-500",
  "Accommodation": "bg-indigo-500",
  "Office Supplies": "bg-cyan-500",
  "Petrol Charges": "bg-amber-500",
  "Products": "bg-emerald-500",
  "Other": "bg-slate-500",
};

interface CategorySummaryProps {
  categorySummary: CategorySummaryType[];
  totalExpenses: number;
}

export function CategorySummary({ categorySummary, totalExpenses }: CategorySummaryProps) {
  // Filter out categories with 0 expenses and sort by amount descending
  const activeCategories = categorySummary
    .filter((cat) => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Expense Categories</h2>
        <p className="text-xs text-slate-500 mt-1">Breakdown of personal spending by category</p>
      </div>

      {activeCategories.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500">
          No expenses recorded by category.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {activeCategories.map((cat, i) => {
            const icon = categoryIcons[cat.category] || <Tag className="h-5 w-5 text-slate-600" />;
            const bgClass = categoryBgClasses[cat.category] || "bg-slate-50 ring-slate-100";
            const barColor = categoryBarColors[cat.category] || "bg-slate-500";
            const percent = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;

            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${bgClass}`}>
                      {icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{cat.category}</p>
                      <p className="text-xs text-slate-400">
                        {cat.count} {cat.count === 1 ? "claim" : "claims"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ₹{cat.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-400">{percent.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
