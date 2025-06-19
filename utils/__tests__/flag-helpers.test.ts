import { truncateText, formatDate, exportFlagsToCSV } from '../flag-helpers';

describe('truncateText', () => {
  it('truncates text longer than maxLength', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });
  it('returns text as is if shorter than maxLength', () => {
    expect(truncateText('hi', 5)).toBe('hi');
  });
});

describe('formatDate', () => {
  it('formats date string as MMM DD, YYYY', () => {
    expect(formatDate('2025-06-12')).toMatch(/\w{3} \d{1,2}, 2025/);
  });
});

describe('exportFlagsToCSV', () => {
  it('calls toast.success after export', () => {
    const toast = { success: jest.fn() };
    const flags = [
      { name: 'flag1', description: 'desc', environment: 'prod', enabled: true, rolloutPercentage: 100, createdAt: '2025-06-12' }
    ];
    // Mock DOM methods
    const createObjectURL = jest.fn(() => 'blob:url');
    const appendChild = jest.fn();
    const removeChild = jest.fn();
    const click = jest.fn();
    global.Blob = function() { return {}; } as any;
    Object.defineProperty(window.URL, 'createObjectURL', { value: createObjectURL });
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: jest.fn() });
    document.createElement = () => ({
      set href(v: string) {},
      set download(v: string) {},
      click,
      style: {},
      remove: jest.fn()
    } as any);
    document.body.appendChild = appendChild;
    document.body.removeChild = removeChild;
    exportFlagsToCSV(flags as any, toast);
    expect(toast.success).toHaveBeenCalled();
  });
});
