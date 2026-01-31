import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useScanState, useScanDispatch } from '../context/ScanContext';
import { ImpactLevel, WCAGLevel, IssueStatus } from '@/types/issue';

const severityOptions: { value: ImpactLevel; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: 'severity-critical' },
  { value: 'serious', label: 'Serious', color: 'severity-serious' },
  { value: 'moderate', label: 'Moderate', color: 'severity-moderate' },
  { value: 'minor', label: 'Minor', color: 'severity-minor' }
];

const wcagOptions: { value: WCAGLevel; label: string }[] = [
  { value: 'A', label: 'WCAG A' },
  { value: 'AA', label: 'WCAG AA' },
  { value: 'AAA', label: 'WCAG AAA' }
];

const statusOptions: { value: IssueStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'ignored', label: 'Ignored' },
  { value: 'needs-design', label: 'Needs Design' },
  { value: 'false-positive', label: 'False Positive' }
];

export default function FilterBar() {
  const { filters, currentScan } = useScanState();
  const dispatch = useScanDispatch();
  const [searchValue, setSearchValue] = useState(filters.search);

  if (!currentScan) return null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { search: value }
    });
  };

  const toggleSeverityFilter = (severity: ImpactLevel) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];

    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { severity: newSeverity }
    });
  };

  const toggleWcagFilter = (wcag: WCAGLevel) => {
    const newWcag = filters.wcag.includes(wcag)
      ? filters.wcag.filter(w => w !== wcag)
      : [...filters.wcag, wcag];

    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { wcag: newWcag }
    });
  };

  const toggleStatusFilter = (status: IssueStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];

    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { status: newStatus }
    });
  };

  const clearAllFilters = () => {
    setSearchValue('');
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const hasActiveFilters =
    filters.severity.length > 0 ||
    filters.wcag.length > 0 ||
    filters.status.length > 0 ||
    filters.search.length > 0;

  const activeFilterCount =
    filters.severity.length +
    filters.wcag.length +
    filters.status.length +
    (filters.search ? 1 : 0);

  return (
    <div className="border-b border-border bg-card px-4 py-3 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search issues by title or rule ID..."
          value={searchValue}
          onChange={handleSearchChange}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue('');
              dispatch({ type: 'UPDATE_FILTERS', payload: { search: '' } });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Buttons Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Severity Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3 w-3" />
              Severity
              {filters.severity.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {filters.severity.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-3">
            <div className="space-y-2">
              <div className="font-medium text-sm mb-2">Filter by severity</div>
              {severityOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-1 rounded"
                >
                  <Checkbox
                    checked={filters.severity.includes(option.value)}
                    onCheckedChange={() => toggleSeverityFilter(option.value)}
                  />
                  <span className="text-sm flex-1">{option.label}</span>
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* WCAG Level Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3 w-3" />
              WCAG
              {filters.wcag.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {filters.wcag.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-3">
            <div className="space-y-2">
              <div className="font-medium text-sm mb-2">Filter by WCAG level</div>
              {wcagOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-1 rounded"
                >
                  <Checkbox
                    checked={filters.wcag.includes(option.value)}
                    onCheckedChange={() => toggleWcagFilter(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3 w-3" />
              Status
              {filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {filters.status.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52 p-3">
            <div className="space-y-2">
              <div className="font-medium text-sm mb-2">Filter by status</div>
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-1 rounded"
                >
                  <Checkbox
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={() => toggleStatusFilter(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ''}
          </Button>
        )}
      </div>
    </div>
  );
}
