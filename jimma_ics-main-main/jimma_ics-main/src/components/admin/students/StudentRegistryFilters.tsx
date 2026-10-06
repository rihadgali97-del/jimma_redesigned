import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface StudentRegistryFiltersProps {
  searchTerm: string;
  selectedMadrasa: string;
  selectedLevel: string;
  selectedGraduationYear: string;
  selectedJuz: string;
  selectedGender: string;
  madrasas: string[];
  levels: string[];
  graduationYears: string[];
  isAdvancedSearchOpen: boolean;
  onToggleAdvancedSearch: () => void;
  onSearchChange: (value: string) => void;
  onMadrasaChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onGraduationYearChange: (value: string) => void;
  onJuzChange: (value: string) => void;
  onGenderChange: (value: string) => void;
}

export const StudentRegistryFilters: React.FC<StudentRegistryFiltersProps> = ({
  searchTerm,
  selectedMadrasa,
  selectedLevel,
  selectedGraduationYear,
  selectedJuz,
  selectedGender,
  madrasas,
  levels,
  graduationYears,
  isAdvancedSearchOpen,
  onToggleAdvancedSearch,
  onSearchChange,
  onMadrasaChange,
  onLevelChange,
  onGraduationYearChange,
  onJuzChange,
  onGenderChange,
}) => {
  const selectClassName =
    'px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200';

  return (
    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, guardian, madrasa..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedMadrasa}
            onChange={(event) => onMadrasaChange(event.target.value)}
            className={selectClassName}
          >
            {madrasas.map((madrasa) => (
              <option key={madrasa} value={madrasa}>
                {madrasa === 'All' ? 'All Madrasas' : madrasa}
              </option>
            ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(event) => onLevelChange(event.target.value)}
            className={selectClassName}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level === 'All' ? 'All Levels' : level}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleAdvancedSearch}
            aria-expanded={isAdvancedSearchOpen}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {isAdvancedSearchOpen ? 'Hide advanced search' : 'Advanced search'}
          </button>
        </div>
      </div>

      {isAdvancedSearchOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <label className="space-y-1">
            <span className="block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Graduation year
            </span>
            <select
              value={selectedGraduationYear}
              onChange={(event) => onGraduationYearChange(event.target.value)}
              className={`w-full ${selectClassName}`}
            >
              <option value="All">All graduation years</option>
              {graduationYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Current Juz
            </span>
            <select
              value={selectedJuz}
              onChange={(event) => onJuzChange(event.target.value)}
              className={`w-full ${selectClassName}`}
            >
              <option value="All">All Juz</option>
              {Array.from({ length: 30 }, (_, index) => String(index + 1)).map((juz) => (
                <option key={juz} value={juz}>
                  Juz {juz}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Gender
            </span>
            <select
              value={selectedGender}
              onChange={(event) => onGenderChange(event.target.value)}
              className={`w-full ${selectClassName}`}
            >
              <option value="All">All genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
};
