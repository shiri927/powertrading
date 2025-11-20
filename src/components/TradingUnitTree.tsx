import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface TradingUnitNode {
  id: string;
  name: string;
  type: 'group' | 'station' | 'unit';
  children?: TradingUnitNode[];
  contractCount?: number;
}

interface TradingUnitTreeProps {
  nodes: TradingUnitNode[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const TreeNode = ({
  node,
  level = 0,
  selectedIds,
  onToggle,
}: {
  node: TradingUnitNode;
  level?: number;
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isChecked = selectedIds.includes(node.id);
  
  // 检查子节点是否全部选中
  const allChildrenChecked = hasChildren
    ? node.children!.every((child) => {
        const childChecked = selectedIds.includes(child.id);
        if (child.children && child.children.length > 0) {
          return child.children.every(c => selectedIds.includes(c.id));
        }
        return childChecked;
      })
    : false;

  // 检查是否有部分子节点选中
  const someChildrenChecked = hasChildren
    ? node.children!.some((child) => {
        const childChecked = selectedIds.includes(child.id);
        if (child.children && child.children.length > 0) {
          return child.children.some(c => selectedIds.includes(c.id));
        }
        return childChecked;
      })
    : false;

  const isIndeterminate = !allChildrenChecked && someChildrenChecked;

  const handleCheckChange = (checked: boolean) => {
    onToggle(node.id, checked);
  };

  return (
    <div className={cn("select-none", level > 0 && "ml-4")}>
      {hasChildren ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#F8FBFA] rounded-md cursor-pointer group">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 flex-1">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Checkbox
                  checked={allChildrenChecked}
                  onCheckedChange={handleCheckChange}
                  className={cn(isIndeterminate && "data-[state=checked]:bg-[#00B04D]/50")}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-sm font-medium text-foreground flex-1 text-left">
                  {node.name}
                  {node.contractCount !== undefined && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({node.contractCount})
                    </span>
                  )}
                </span>
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            {node.children?.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                selectedIds={selectedIds}
                onToggle={onToggle}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#F8FBFA] rounded-md">
          <div className="w-4" />
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheckChange}
          />
          <span className="text-sm text-foreground flex-1">
            {node.name}
            {node.contractCount !== undefined && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({node.contractCount})
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export const TradingUnitTree = ({
  nodes,
  selectedIds,
  onSelectionChange,
}: TradingUnitTreeProps) => {
  const handleToggle = (id: string, checked: boolean) => {
    let newSelectedIds = [...selectedIds];

    const toggleNodeAndChildren = (nodeId: string, shouldSelect: boolean, nodes: TradingUnitNode[]) => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          if (shouldSelect) {
            if (!newSelectedIds.includes(node.id)) {
              newSelectedIds.push(node.id);
            }
            if (node.children) {
              node.children.forEach(child => toggleNodeAndChildren(child.id, true, [child]));
            }
          } else {
            newSelectedIds = newSelectedIds.filter(id => id !== node.id);
            if (node.children) {
              node.children.forEach(child => toggleNodeAndChildren(child.id, false, [child]));
            }
          }
          break;
        }
        if (node.children) {
          toggleNodeAndChildren(nodeId, shouldSelect, node.children);
        }
      }
    };

    toggleNodeAndChildren(id, checked, nodes);
    onSelectionChange(newSelectedIds);
  };

  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedIds={selectedIds}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};
