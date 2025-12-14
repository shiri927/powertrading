import { useState } from 'react';
import { FileText, Plus, Trash2, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PivotConfig } from '@/lib/reports/pivot-engine';

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  config: PivotConfig;
  createdAt: string;
  isPreset?: boolean;
  userId?: string | null;
}

interface ReportTemplateListProps {
  templates: ReportTemplate[];
  activeTemplateId: string | null;
  onSelect: (template: ReportTemplate) => void;
  onDelete: (templateId: string) => void;
  onRename: (templateId: string, newName: string) => void;
  onCreateNew: () => void;
}

const ReportTemplateList = ({
  templates,
  activeTemplateId,
  onSelect,
  onDelete,
  onRename,
  onCreateNew,
}: ReportTemplateListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (template: ReportTemplate) => {
    if (template.isPreset) return;
    setEditingId(template.id);
    setEditingName(template.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const presetTemplates = templates.filter(t => t.isPreset);
  const customTemplates = templates.filter(t => !t.isPreset);

  return (
    <div className="space-y-4">
      {/* 新建报表按钮 */}
      <Button
        variant="outline"
        className="w-full justify-start gap-2 border-dashed hover:border-[#00B04D] hover:bg-[#F8FBFA]"
        onClick={onCreateNew}
      >
        <Plus className="h-4 w-4" />
        新建报表
      </Button>

      {/* 预设模板 */}
      {presetTemplates.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">预设模板</h4>
          <div className="space-y-1">
            {presetTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => onSelect(template)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                  activeTemplateId === template.id
                    ? "bg-[#F1F8F4] border border-[#00B04D]"
                    : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <FileText className="h-4 w-4 text-[#00B04D]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{template.name}</p>
                  {template.description && (
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 自定义模板 */}
      {customTemplates.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">自定义报表</h4>
          <div className="space-y-1">
            {customTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => !editingId && onSelect(template)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group",
                  activeTemplateId === template.id
                    ? "bg-[#F1F8F4] border border-[#00B04D]"
                    : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <FileText className="h-4 w-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  {editingId === template.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-6 text-sm px-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium truncate">{template.name}</p>
                  )}
                </div>
                {!editingId && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-blue-100 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(template);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-100 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(template.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {templates.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">
          暂无报表模板
        </div>
      )}
    </div>
  );
};

export default ReportTemplateList;
