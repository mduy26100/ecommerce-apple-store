import { useMemo } from "react";
import { AppstoreOutlined } from "@ant-design/icons";
import type {
  ProductSpecificationItem,
  ProductSpecificationGroupItem,
} from "../../types/catalog.types";

export interface ProductSpecificationsProps {
  specificationGroups?: ProductSpecificationGroupItem[];
  specifications?: ProductSpecificationItem[];
  description?: string | null;
  productName: string;
}

interface DisplayGroup {
  name: string;
  specs: ProductSpecificationItem[];
}

export const ProductSpecifications = ({
  specificationGroups,
  specifications,
  description,
  productName,
}: ProductSpecificationsProps) => {
  const displayGroups = useMemo<DisplayGroup[]>(() => {
    if (specificationGroups && specificationGroups.length > 0) {
      return [...specificationGroups]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((g) => ({
          name: g.name,
          specs: [...(g.specifications || [])].sort(
            (a, b) => a.displayOrder - b.displayOrder
          ),
        }))
        .filter((g) => g.specs.length > 0);
    }

    if (!specifications || specifications.length === 0) return [];
    const map: Record<string, ProductSpecificationItem[]> = {};
    specifications.forEach((spec) => {
      const gName = spec.groupName?.trim() || "Thông số chung";
      if (!map[gName]) {
        map[gName] = [];
      }
      map[gName].push(spec);
    });

    return Object.keys(map).map((name) => ({
      name,
      specs: map[name].sort((a, b) => a.displayOrder - b.displayOrder),
    }));
  }, [specificationGroups, specifications]);

  return (
    <div className="space-y-8 pt-4">
      {description && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            Tổng quan sản phẩm
          </h2>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white rounded-xl border border-slate-100 p-5 sm:p-6">
            {description}
          </div>
        </div>
      )}

      {displayGroups.length > 0 && (
        <div
          data-testid="product-specifications-container"
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Thông số kỹ thuật
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Chi tiết cấu hình {productName}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <AppstoreOutlined />
              <span>Tiêu chuẩn Apple</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {displayGroups.map((group) => (
              <div
                key={group.name}
                data-testid={`spec-group-${group.name}`}
                className="space-y-2"
              >
                <h3 className="text-xs font-black text-blue-700 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                  {group.name}
                </h3>
                <div className="divide-y divide-slate-100">
                  {group.specs.map((spec) => (
                    <div
                      key={spec.id}
                      className="py-2.5 flex items-baseline justify-between gap-4 text-xs"
                    >
                      <span className="text-slate-500 font-medium shrink-0">
                        {spec.name}
                      </span>
                      <span className="text-slate-900 font-bold text-right">
                        {spec.value} {spec.unit ? `(${spec.unit})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
