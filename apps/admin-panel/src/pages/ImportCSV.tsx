import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRequest } from '../api';
import { CSVImportPreviewItem, CSVImportResult } from '../shared-types';
import { Upload, CheckCircle2, AlertOctagon, HelpCircle, FileText, Check, AlertCircle } from 'lucide-react';

export default function ImportCSV() {
  const queryClient = useQueryClient();
  const [csvText, setCsvText] = useState('');
  const [previewItems, setPreviewItems] = useState<CSVImportPreviewItem[]>([]);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);

  const importMutation = useMutation({
    mutationFn: () => adminRequest<CSVImportResult>('/admin/couriers/import', {
      method: 'POST',
      body: JSON.stringify({ csvText }),
    }),
    onSuccess: (data) => {
      setImportResult(data);
      queryClient.invalidateQueries(['couriers']);
      queryClient.invalidateQueries(['stats']);
      queryClient.invalidateQueries(['logs']);
      alert(`Успешно импортировано: ${data.successCount} курьеров. Ошибок: ${data.failedCount}`);
    },
    onError: (err: any) => {
      alert(`Ошибка при импорте: ${err.message}`);
    },
  });

  const handleParsePreview = () => {
    setImportResult(null);
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      alert('CSV текст пуст или содержит только заголовки');
      return;
    }

    const items: CSVImportPreviewItem[] = [];
    const header = lines[0].toLowerCase();

    if (!header.includes('telegram_id') || !header.includes('orders_count')) {
      alert('Неверный формат заголовков. Требуется: telegram_id,orders_count,date');
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map(c => c.trim());
      const tgId = cols[0] || '';
      const countVal = Number(cols[1]);
      const dateVal = cols[2] || '';

      const errors: string[] = [];
      if (!tgId) {
        errors.push('Отсутствует telegram_id');
      }
      if (isNaN(countVal) || countVal < 0) {
        errors.push(`Недопустимое кол-во заказов: ${cols[1] || ''}`);
      }

      items.push({
        telegramId: tgId,
        ordersCount: countVal,
        date: dateVal,
        isValid: errors.length === 0,
        errors,
      });
    }

    setPreviewItems(items);
  };

  const handleImportSubmit = () => {
    if (!csvText) return;
    importMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Импорт заказов из CSV</h1>
        <p className="text-sm text-space-gray mt-1">
          Загрузка и обновление заказов курьеров. Требуемый формат колонок: 
          <code className="text-space-blue font-mono bg-white/5 px-1.5 py-0.5 rounded ml-1 text-xs">telegram_id,orders_count,date</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Editor Input card */}
        <div className="glass-card rounded-xl p-6 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-space-gray uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4 text-space-blue" />
            <span>Вставьте CSV текст</span>
          </h3>
          
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`telegram_id,orders_count,date\n12345678,25,2026-06-01\n87654321,12,2026-06-01`}
            rows={10}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-xs text-white focus:outline-none focus:border-space-blue transition-colors"
          />

          <div className="flex space-x-3">
            <button
              onClick={handleParsePreview}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-lg border border-white/10 transition-colors"
            >
              Предпросмотр и проверка
            </button>
            
            <button
              onClick={handleImportSubmit}
              disabled={previewItems.length === 0 || importMutation.isLoading}
              className="flex-1 bg-space-blue hover:bg-space-blue/90 disabled:bg-space-blue/50 text-white font-bold text-xs py-2.5 rounded-lg transition-colors"
            >
              {importMutation.isLoading ? 'Импорт...' : 'Начать импорт'}
            </button>
          </div>
        </div>

        {/* Import Summary/Results Card */}
        <div className="glass-card rounded-xl p-6 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-space-gray uppercase tracking-wider">Результаты операции</h3>
          
          {importResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-space-green/10 border border-space-green/20 rounded-lg text-center">
                  <Check className="w-6 h-6 text-space-green mx-auto mb-1" />
                  <div className="text-2xl font-bold text-space-green">{importResult.successCount}</div>
                  <div className="text-[10px] text-space-gray uppercase tracking-wider font-semibold mt-1">Записей импортировано</div>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-red-400">{importResult.failedCount}</div>
                  <div className="text-[10px] text-space-gray uppercase tracking-wider font-semibold mt-1">Ошибок пропущено</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Журнал ошибок импорта:</h4>
                  <div className="max-h-40 overflow-y-auto bg-black/10 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-red-200/80 space-y-1">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx}>{err}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-space-gray">
              Вставьте CSV текст и нажмите «Предпросмотр» для разбора файла.
            </div>
          )}
        </div>
      </div>

      {/* Parser Verification Table */}
      {previewItems.length > 0 && (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 bg-white/2 border-b border-white/5">
            <h3 className="text-xs font-bold text-space-gray uppercase tracking-wider">Локальная верификация строк ({previewItems.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-space-gray font-bold">
                  <th className="py-3 px-6">Строка</th>
                  <th className="py-3 px-6">Telegram ID</th>
                  <th className="py-3 px-6">Количество заказов</th>
                  <th className="py-3 px-6">Дата</th>
                  <th className="py-3 px-6">Статус</th>
                  <th className="py-3 px-6">Детали ошибки</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/1">
                    <td className="py-3 px-6 text-space-gray font-mono">{idx + 2}</td>
                    <td className="py-3 px-6 font-mono text-white">{item.telegramId || '—'}</td>
                    <td className="py-3 px-6 font-bold text-space-blue">{isNaN(item.ordersCount) ? '—' : item.ordersCount}</td>
                    <td className="py-3 px-6 text-space-gray font-mono">{item.date || '—'}</td>
                    <td className="py-3 px-6">
                      {item.isValid ? (
                        <span className="px-2 py-0.5 bg-space-green/10 border border-space-green/20 text-space-green rounded-full font-bold">OK</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-bold">FAIL</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-red-400 text-[10px]">
                      {item.errors.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
