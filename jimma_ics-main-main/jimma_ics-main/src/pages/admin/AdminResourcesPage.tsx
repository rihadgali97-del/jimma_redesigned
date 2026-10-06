import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CouncilResource, ResourceCategory, ResourceTargetInstitution, ResourceLanguage, ResourceFormat } from '../../types';
import {
  BookOpen,
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  Bookmark,
  Sparkles,
  Building2,
  GraduationCap,
  Languages,
  CheckCircle2,
  Calendar,
  User,
  Share2,
  Printer,
  Copy,
  FolderOpen,
  ArrowUpDown,
  SlidersHorizontal,
  FileSpreadsheet,
  FileCheck,
  Award,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  UploadCloud,
  FileCode,
  File,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const AdminResourcesPage: React.FC = () => {
  const { resources, addResource, updateResource, deleteResource, incrementResourceDownload, addToast } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'downloads-desc' | 'title-asc'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CouncilResource | null>(null);
  const [previewingResource, setPreviewingResource] = useState<CouncilResource | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

  // Reader font size for Khutbah delivery preview
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [readerTab, setReaderTab] = useState<'arabic' | 'oromo' | 'english' | 'summary' | 'contents'>('arabic');

  // Form State for Create / Edit
  const [formData, setFormData] = useState<{
    title: string;
    arabicTitle: string;
    oromoTitle: string;
    category: ResourceCategory;
    subCategory: string;
    targetInstitution: ResourceTargetInstitution;
    targetAudience: string;
    language: ResourceLanguage;
    format: ResourceFormat;
    fileSize: string;
    author: string;
    department: string;
    seasonOrOccasion: string;
    description: string;
    summaryPointsText: string;
    tagsText: string;
    isFeatured: boolean;
    isPinnedForJummah: boolean;
    arabicText: string;
    translationOromo: string;
    translationEnglish: string;
    tableOfContentsText: string;
  }>({
    title: '',
    arabicTitle: '',
    oromoTitle: '',
    category: 'Khutbah Template',
    subCategory: 'Friday Sermon',
    targetInstitution: 'Both',
    targetAudience: 'Imams, Khateebs & Teachers',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '1.5 MB',
    author: 'Supreme Shari’ah & Ifta Directorate of Jimma',
    department: 'Shariah & Fatwa Board',
    seasonOrOccasion: 'General Guidance',
    description: '',
    summaryPointsText: '',
    tagsText: '',
    isFeatured: false,
    isPinnedForJummah: false,
    arabicText: '',
    translationOromo: '',
    translationEnglish: '',
    tableOfContentsText: '',
  });

  // Calculate high-level metrics
  const metrics = useMemo(() => {
    const total = resources.length;
    const khutbahs = resources.filter((r) => r.category === 'Khutbah Template').length;
    const educational = resources.filter((r) => r.category === 'Educational Material' || r.category === 'Tajweed & Tahfeez').length;
    const handbooks = resources.filter((r) => r.category === 'PDF Handbook' || r.category === 'Administrative Protocol').length;
    const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);
    const jummahPinned = resources.filter((r) => r.isPinnedForJummah).length;

    return { total, khutbahs, educational, handbooks, totalDownloads, jummahPinned };
  }, [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources
      .filter((res) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = res.title.toLowerCase().includes(q);
          const matchesArabic = res.arabicTitle?.toLowerCase().includes(q) || false;
          const matchesOromo = res.oromoTitle?.toLowerCase().includes(q) || false;
          const matchesAuthor = res.author.toLowerCase().includes(q);
          const matchesDept = res.department.toLowerCase().includes(q);
          const matchesDesc = res.description.toLowerCase().includes(q);
          const matchesTags = res.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesArabic && !matchesOromo && !matchesAuthor && !matchesDept && !matchesDesc && !matchesTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && res.category !== selectedCategory) {
          return false;
        }

        // Target Institution filter
        if (selectedInstitution !== 'All') {
          if (selectedInstitution === 'Mosques' && res.targetInstitution !== 'Mosques Only' && res.targetInstitution !== 'Both') return false;
          if (selectedInstitution === 'Madrasas' && res.targetInstitution !== 'Madrasas Only' && res.targetInstitution !== 'Both') return false;
          if (selectedInstitution === 'Community' && res.targetInstitution !== 'Community Wide' && res.targetInstitution !== 'Both') return false;
        }

        // Language filter
        if (selectedLanguage !== 'All' && res.language !== selectedLanguage) {
          return false;
        }

        // Format filter
        if (selectedFormat !== 'All' && res.format !== selectedFormat) {
          return false;
        }

        // Pinned Jummah filter
        if (showPinnedOnly && !res.isPinnedForJummah) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        }
        if (sortBy === 'downloads-desc') {
          return (b.downloadsCount || 0) - (a.downloadsCount || 0);
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [resources, searchQuery, selectedCategory, selectedInstitution, selectedLanguage, selectedFormat, showPinnedOnly, sortBy]);

  // Open Upload / Create Modal
  const handleOpenCreateModal = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      arabicTitle: '',
      oromoTitle: '',
      category: 'Khutbah Template',
      subCategory: 'Friday Sermon',
      targetInstitution: 'Both',
      targetAudience: 'Imams, Khateebs, Teachers & Mosque Committees',
      language: 'Multilingual',
      format: 'PDF',
      fileSize: '1.4 MB',
      author: 'Supreme Shari’ah & Ifta Directorate of Jimma',
      department: 'Shariah & Fatwa Board',
      seasonOrOccasion: 'Upcoming Jummah',
      description: '',
      summaryPointsText: '',
      tagsText: 'Khutbah, Jummah, Guidance',
      isFeatured: false,
      isPinnedForJummah: false,
      arabicText: '',
      translationOromo: '',
      translationEnglish: '',
      tableOfContentsText: '',
    });
    setIsUploadModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (res: CouncilResource) => {
    setEditingResource(res);
    setFormData({
      title: res.title,
      arabicTitle: res.arabicTitle || '',
      oromoTitle: res.oromoTitle || '',
      category: res.category,
      subCategory: res.subCategory || '',
      targetInstitution: res.targetInstitution,
      targetAudience: res.targetAudience,
      language: res.language,
      format: res.format,
      fileSize: res.fileSize,
      author: res.author,
      department: res.department,
      seasonOrOccasion: res.seasonOrOccasion || '',
      description: res.description,
      summaryPointsText: res.summaryPoints.join('\n'),
      tagsText: res.tags.join(', '),
      isFeatured: !!res.isFeatured,
      isPinnedForJummah: !!res.isPinnedForJummah,
      arabicText: res.previewContent?.arabicText || '',
      translationOromo: res.previewContent?.translationOromo || '',
      translationEnglish: res.previewContent?.translationEnglish || '',
      tableOfContentsText: (res.previewContent?.tableOfContents || []).join('\n'),
    });
    setIsUploadModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Validation Error', 'Resource title is required.', 'error');
      return;
    }

    const summaryPoints = formData.summaryPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = formData.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const tableOfContents = formData.tableOfContentsText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    const previewContent = {
      arabicText: formData.arabicText.trim() || undefined,
      translationOromo: formData.translationOromo.trim() || undefined,
      translationEnglish: formData.translationEnglish.trim() || undefined,
      tableOfContents: tableOfContents.length > 0 ? tableOfContents : undefined,
      keyThemes: tags.slice(0, 4),
      sampleExcerpt: formData.description.slice(0, 160) + '...',
    };

    if (editingResource) {
      updateResource(editingResource.id, {
        title: formData.title,
        arabicTitle: formData.arabicTitle || undefined,
        oromoTitle: formData.oromoTitle || undefined,
        category: formData.category,
        subCategory: formData.subCategory || undefined,
        targetInstitution: formData.targetInstitution,
        targetAudience: formData.targetAudience,
        language: formData.language,
        format: formData.format,
        fileSize: formData.fileSize,
        author: formData.author,
        department: formData.department,
        seasonOrOccasion: formData.seasonOrOccasion || undefined,
        description: formData.description,
        summaryPoints: summaryPoints.length > 0 ? summaryPoints : ['Standardized curriculum guidance verified by council.'],
        tags: tags.length > 0 ? tags : ['Islamic Council', 'Education'],
        isFeatured: formData.isFeatured,
        isPinnedForJummah: formData.isPinnedForJummah,
        previewContent: (previewContent.arabicText || previewContent.translationOromo || previewContent.translationEnglish) ? previewContent : undefined,
      });
    } else {
      addResource({
        title: formData.title,
        arabicTitle: formData.arabicTitle || undefined,
        oromoTitle: formData.oromoTitle || undefined,
        category: formData.category,
        subCategory: formData.subCategory || undefined,
        targetInstitution: formData.targetInstitution,
        targetAudience: formData.targetAudience,
        language: formData.language,
        format: formData.format,
        fileSize: formData.fileSize || '2.1 MB',
        downloadUrl: '#',
        uploadedBy: 'Current Council Officer',
        author: formData.author,
        department: formData.department,
        hijriDate: '18 Safar 1448 AH',
        isFeatured: formData.isFeatured,
        isPinnedForJummah: formData.isPinnedForJummah,
        seasonOrOccasion: formData.seasonOrOccasion || undefined,
        description: formData.description,
        summaryPoints: summaryPoints.length > 0 ? summaryPoints : ['Standardized Islamic resource document.'],
        tags: tags.length > 0 ? tags : ['Resource', 'Council'],
        previewContent: (previewContent.arabicText || previewContent.translationOromo || previewContent.translationEnglish) ? previewContent : undefined,
      });
    }

    setIsUploadModalOpen(false);
  };

  // Download Simulator
  const handleDownload = (res: CouncilResource) => {
    incrementResourceDownload(res.id);
    addToast(
      'Document Download Started',
      `"${res.title}" (${res.format} • ${res.fileSize}) is downloading for offline mosque/madrasa use.`,
      'success'
    );
  };

  // Toggle Jummah Pinned
  const handleTogglePin = (res: CouncilResource) => {
    const newStatus = !res.isPinnedForJummah;
    updateResource(res.id, { isPinnedForJummah: newStatus });
    addToast(
      newStatus ? 'Pinned for Upcoming Jummah' : 'Unpinned from Jummah Highlights',
      `"${res.title}" updated in mosque bulletin broadcast.`,
      'info'
    );
  };

  // Delete handler
  const confirmDelete = () => {
    if (deletingResourceId) {
      deleteResource(deletingResourceId);
      setDeletingResourceId(null);
    }
  };

  // Copy Excerpt
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to Clipboard', `${label} copied for your sermon notes or bulletin.`, 'success');
  };

  // Export Catalog
  const handleExportCatalog = () => {
    const headers = ['ID', 'Title', 'Category', 'Target Institution', 'Language', 'Format', 'File Size', 'Downloads', 'Author', 'Department', 'Date'];
    const rows = filteredResources.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.targetInstitution,
      r.language,
      r.format,
      r.fileSize,
      r.downloadsCount,
      `"${r.author}"`,
      `"${r.department}"`,
      r.uploadDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jimma_Council_Educational_Resources_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Catalog Exported', 'CSV summary generated for administrative records.', 'success');
  };

  // Format Helper Badges
  const getCategoryBadgeClass = (category: ResourceCategory) => {
    switch (category) {
      case 'Khutbah Template':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'Educational Material':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'PDF Handbook':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'Tajweed & Tahfeez':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
      case 'Fiqh & Fatwa Guide':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'Administrative Protocol':
        return 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20';
      default:
        return 'bg-stone-500/10 text-stone-600 border-stone-500/20';
    }
  };

  const getInstitutionBadge = (institution: ResourceTargetInstitution) => {
    switch (institution) {
      case 'Mosques Only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Building2 className="w-3 h-3" /> Mosques
          </span>
        );
      case 'Madrasas Only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <GraduationCap className="w-3 h-3" /> Madrasas
          </span>
        );
      case 'Both':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Layers className="w-3 h-3" /> Mosques & Madrasas
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            Community Wide
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-stone-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
                Educational Materials, Handbooks & Khutbahs
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                Official repository for uploading, curating, and distributing syllabus frameworks, sermon templates, and governance manuals across Jimma Zone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCatalog}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Catalog (CSV)</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Total Materials</span>
            <FolderOpen className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-xl font-bold text-stone-900 dark:text-white">{metrics.total}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Repository active</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Khutbah Templates</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.khutbahs}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">{metrics.jummahPinned} pinned for Friday</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Madrasa & Tajweed</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{metrics.educational}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Curricula & Charts</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Handbooks & Guides</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{metrics.handbooks}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Governance & Waqf</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Total Downloads</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalDownloads.toLocaleString()}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Across 18 Woredas</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Languages</span>
            <Languages className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">4 Active</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Ar • Oro • Eng • Amh</span>
        </div>
      </div>

      {/* Featured / Friday Jummah Pinned Spotlight */}
      {resources.some((r) => r.isPinnedForJummah) && !showPinnedOnly && (
        <div className="bg-gradient-to-r from-emerald-900/90 via-emerald-800/90 to-teal-900/90 text-white p-5 sm:p-6 rounded-2xl border border-emerald-700/50 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <Bookmark className="w-5 h-5 fill-emerald-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Featured Friday Broadcast
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Official Jummah Khutbah Template for Jimma Zone Mosques
                </h2>
              </div>
            </div>

            <button
              onClick={() => setShowPinnedOnly(true)}
              className="text-xs font-semibold text-emerald-200 hover:text-white bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              View All Friday Releases →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources
              .filter((r) => r.isPinnedForJummah)
              .slice(0, 2)
              .map((pinned) => (
                <div
                  key={pinned.id}
                  className="bg-emerald-950/50 backdrop-blur-xs p-4 rounded-xl border border-emerald-600/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-emerald-300 bg-emerald-800/50 px-2 py-0.5 rounded">
                        {pinned.seasonOrOccasion || 'Upcoming Jummah'}
                      </span>
                      <span className="text-xs text-emerald-200/80">{pinned.fileSize} • {pinned.format}</span>
                    </div>

                    <h3 className="font-bold text-base text-white line-clamp-1">{pinned.title}</h3>
                    {pinned.arabicTitle && (
                      <p className="text-sm font-arabic text-emerald-200 mt-1 line-clamp-1 text-right" dir="rtl">
                        {pinned.arabicTitle}
                      </p>
                    )}
                    <p className="text-xs text-emerald-100/80 mt-2 line-clamp-2">{pinned.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-800/40 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-300/80">
                      Author: {pinned.author.split('(')[0]}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPreviewingResource(pinned);
                          setReaderTab('arabic');
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-200 hover:text-white bg-emerald-800/60 hover:bg-emerald-700/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read
                      </button>
                      <button
                        onClick={() => handleDownload(pinned)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Search & Comprehensive Filter Controls */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        {/* Search Bar & View Mode Toggles */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, Arabic text, Afaan Oromoo, author, department, keywords..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>

            {/* Sort selection */}
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs py-2 pl-3 pr-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="downloads-desc">Most Downloaded</option>
                <option value="title-asc">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-stone-400 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {[
            { id: 'All', label: 'All Resources' },
            { id: 'Khutbah Template', label: 'Khutbah Templates' },
            { id: 'Educational Material', label: 'Madrasa Curricula' },
            { id: 'PDF Handbook', label: 'PDF Handbooks' },
            { id: 'Tajweed & Tahfeez', label: 'Tajweed & Tahfeez' },
            { id: 'Fiqh & Fatwa Guide', label: 'Fiqh & Fatwa' },
            { id: 'Administrative Protocol', label: 'Governance Protocols' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Sub-filters (Institution, Language, Format, Jummah Pinned) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">
              Target Institution
            </label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 focus:outline-hidden"
            >
              <option value="All">All Institutions</option>
              <option value="Mosques">Mosques & Imams</option>
              <option value="Madrasas">Madrasas & Mu’allims</option>
              <option value="Community">Community Wide</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 focus:outline-hidden"
            >
              <option value="All">All Languages</option>
              <option value="Multilingual">Multilingual (Ar + Oro + Eng)</option>
              <option value="Afaan Oromoo">Afaan Oromoo</option>
              <option value="Arabic">Arabic Only</option>
              <option value="English">English</option>
              <option value="Amharic">Amharic</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">File Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 focus:outline-hidden"
            >
              <option value="All">All File Types</option>
              <option value="PDF">PDF Documents</option>
              <option value="DOCX">Word (DOCX)</option>
              <option value="Printable Sheet">Printable Poster / Chart</option>
              <option value="PPTX">PowerPoint (PPTX)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`w-full py-1.5 px-2.5 rounded-lg font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                showPinnedOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showPinnedOnly ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
              <span>{showPinnedOnly ? 'Pinned for Friday' : 'All Releases'}</span>
            </button>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedCategory !== 'All' || selectedInstitution !== 'All' || selectedLanguage !== 'All' || selectedFormat !== 'All' || showPinnedOnly || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-stone-500 dark:text-stone-400">
            <span>Active Filters:</span>
            {searchQuery && (
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500">×</button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-red-500">×</button>
              </span>
            )}
            {selectedInstitution !== 'All' && (
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                Target: {selectedInstitution}
                <button onClick={() => setSelectedInstitution('All')} className="hover:text-red-500">×</button>
              </span>
            )}
            {selectedLanguage !== 'All' && (
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                Lang: {selectedLanguage}
                <button onClick={() => setSelectedLanguage('All')} className="hover:text-red-500">×</button>
              </span>
            )}
            {showPinnedOnly && (
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                Pinned for Jummah
                <button onClick={() => setShowPinnedOnly(false)} className="hover:text-red-500">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedInstitution('All');
                setSelectedLanguage('All');
                setSelectedFormat('All');
                setShowPinnedOnly(false);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-auto cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">No educational materials found</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
            We couldn't find any resources matching your search and filter criteria. Try resetting the filters or upload a new handbook.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedInstitution('All');
                setSelectedLanguage('All');
                setSelectedFormat('All');
                setShowPinnedOnly(false);
              }}
              className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Upload Material
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top / Badges */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(
                        res.category
                      )}`}
                    >
                      {res.category}
                    </span>
                    {getInstitutionBadge(res.targetInstitution)}
                  </div>

                  <div className="flex items-center gap-1">
                    {res.category === 'Khutbah Template' && (
                      <button
                        onClick={() => handleTogglePin(res)}
                        title={res.isPinnedForJummah ? 'Pinned for Friday' : 'Pin for Friday'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          res.isPinnedForJummah
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${res.isPinnedForJummah ? 'fill-amber-500' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title and Language */}
                <h3 className="font-bold text-base text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {res.title}
                </h3>

                {res.arabicTitle && (
                  <p className="text-sm font-arabic text-emerald-800 dark:text-emerald-300 mt-1 line-clamp-1 text-right" dir="rtl">
                    {res.arabicTitle}
                  </p>
                )}

                {res.oromoTitle && (
                  <p className="text-xs italic text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                    {res.oromoTitle}
                  </p>
                )}

                {/* Description */}
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-3 line-clamp-3 leading-relaxed">
                  {res.description}
                </p>

                {/* Highlights / Key takeaways */}
                {res.summaryPoints && res.summaryPoints.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
                    {res.summaryPoints.slice(0, 2).map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{pt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {(res.tags || []).slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {(res.tags || []).length > 3 && (
                    <span className="text-[10px] text-stone-400">+{(res.tags || []).length - 3}</span>
                  )}
                </div>
              </div>

              {/* Card Footer / Metadata & Actions */}
              <div className="px-5 py-3.5 bg-stone-50/80 dark:bg-stone-800/50 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  <div className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <File className="w-3.5 h-3.5 text-stone-400" />
                    <span>{res.format} • {res.fileSize}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                    <span>{res.downloadsCount} downloads</span>
                    <span>•</span>
                    <span>{res.uploadDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setPreviewingResource(res);
                      setReaderTab('arabic');
                    }}
                    title="Read & Preview Content"
                    className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(res)}
                    title="Edit Material"
                    className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingResourceId(res.id)}
                    title="Delete Material"
                    className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownload(res)}
                    title="Download File"
                    className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ml-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Get</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredResources.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Language & Format</th>
                  <th className="py-3 px-4">Author / Department</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-2">
                        {res.isPinnedForJummah && (
                          <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-stone-900 dark:text-white line-clamp-1">{res.title}</div>
                          {res.arabicTitle && (
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-arabic line-clamp-1" dir="rtl">
                              {res.arabicTitle}
                            </div>
                          )}
                          <div className="text-[11px] text-stone-400">{res.uploadDate} • {res.hijriDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getCategoryBadgeClass(res.category)}`}>
                        {res.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getInstitutionBadge(res.targetInstitution)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800 dark:text-stone-200">{res.language}</div>
                      <div className="text-[10px] text-stone-400">{res.format} ({res.fileSize})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800 dark:text-stone-200 line-clamp-1">{res.author.split('(')[0]}</div>
                      <div className="text-[10px] text-stone-400 line-clamp-1">{res.department}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800 dark:text-stone-200">
                      {res.downloadsCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setPreviewingResource(res);
                            setReaderTab('arabic');
                          }}
                          title="Read & Preview"
                          className="p-1.5 text-stone-600 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(res)}
                          title="Edit"
                          className="p-1.5 text-stone-600 hover:text-blue-600 dark:text-stone-400 dark:hover:text-blue-400 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingResourceId(res.id)}
                          title="Delete"
                          className="p-1.5 text-stone-600 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(res)}
                          title="Download"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reader & Content Preview Modal (For Imams & Khateebs) */}
      {previewingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between gap-3 bg-stone-50/70 dark:bg-stone-800/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${getCategoryBadgeClass(previewingResource.category)}`}>
                    {previewingResource.category}
                  </span>
                  {getInstitutionBadge(previewingResource.targetInstitution)}
                  {previewingResource.isPinnedForJummah && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Bookmark className="w-3 h-3 fill-amber-500" /> Pinned for Friday
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                  {previewingResource.title}
                </h2>
                {previewingResource.arabicTitle && (
                  <p className="text-base font-arabic text-emerald-700 dark:text-emerald-400 mt-1" dir="rtl">
                    {previewingResource.arabicTitle}
                  </p>
                )}
              </div>

              <button
                onClick={() => setPreviewingResource(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Toolbar in Reader (Tab Switcher & Font Controls) */}
            <div className="px-5 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setReaderTab('arabic')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    readerTab === 'arabic'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  Arabic Script (النص العربي)
                </button>
                <button
                  onClick={() => setReaderTab('oromo')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    readerTab === 'oromo'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  Afaan Oromoo
                </button>
                <button
                  onClick={() => setReaderTab('english')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    readerTab === 'english'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  Khateeb Guidance & English
                </button>
                <button
                  onClick={() => setReaderTab('summary')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    readerTab === 'summary'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  Key Themes & Points
                </button>
                {previewingResource.previewContent?.tableOfContents && (
                  <button
                    onClick={() => setReaderTab('contents')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      readerTab === 'contents'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    Table of Contents
                  </button>
                )}
              </div>

              {/* Reader font size for Minbar/Podium readability */}
              <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                <span className="text-[11px]">Text Size:</span>
                <button
                  onClick={() => setReaderFontSize('normal')}
                  className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                    readerFontSize === 'normal' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40' : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setReaderFontSize('large')}
                  className={`px-2 py-0.5 rounded border text-xs font-semibold cursor-pointer ${
                    readerFontSize === 'large' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40' : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  A+
                </button>
                <button
                  onClick={() => setReaderFontSize('xlarge')}
                  className={`px-2 py-0.5 rounded border text-sm font-bold cursor-pointer ${
                    readerFontSize === 'xlarge' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40' : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  A++
                </button>
              </div>
            </div>

            {/* Reader Content Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50 dark:bg-stone-900/60 space-y-4">
              {readerTab === 'arabic' && (
                <div
                  className={`p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-right leading-loose font-arabic text-stone-900 dark:text-stone-100 ${
                    readerFontSize === 'normal' ? 'text-lg' : readerFontSize === 'large' ? 'text-2xl' : 'text-3xl'
                  }`}
                  dir="rtl"
                >
                  {previewingResource.previewContent?.arabicText ? (
                    <div className="whitespace-pre-line">
                      {previewingResource.previewContent.arabicText}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-stone-400 font-sans text-sm" dir="ltr">
                      No standalone Arabic vocalized transcript was entered for this resource. Please download the full PDF to view.
                    </div>
                  )}
                </div>
              )}

              {readerTab === 'oromo' && (
                <div
                  className={`p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 leading-relaxed text-stone-900 dark:text-stone-100 ${
                    readerFontSize === 'normal' ? 'text-sm' : readerFontSize === 'large' ? 'text-base' : 'text-lg'
                  }`}
                >
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-3">
                    Hiikkaa fi Qajeelfama Xiba Afaan Oromoo (Oromo Translation)
                  </h4>
                  {previewingResource.previewContent?.translationOromo ? (
                    <div className="whitespace-pre-line leading-loose">
                      {previewingResource.previewContent.translationOromo}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-stone-400 text-sm">
                      No Afaan Oromoo parallel translation entered for this document.
                    </div>
                  )}
                </div>
              )}

              {readerTab === 'english' && (
                <div
                  className={`p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 leading-relaxed text-stone-900 dark:text-stone-100 ${
                    readerFontSize === 'normal' ? 'text-sm' : readerFontSize === 'large' ? 'text-base' : 'text-lg'
                  }`}
                >
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-3">
                    English Summary & Delivery Instructions
                  </h4>
                  {previewingResource.previewContent?.translationEnglish ? (
                    <div className="whitespace-pre-line leading-relaxed">
                      {previewingResource.previewContent.translationEnglish}
                    </div>
                  ) : (
                    <p className="text-stone-600 dark:text-stone-300">{previewingResource.description}</p>
                  )}
                </div>
              )}

              {readerTab === 'summary' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-2">
                      Core Institutional Takeaways
                    </h4>
                    <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                      {(previewingResource.summaryPoints || []).map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-2">
                      Target Audience & Institutional Mandate
                    </h4>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mb-2">
                      <strong>Audience:</strong> {previewingResource.targetAudience}
                    </p>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mb-2">
                      <strong>Issuing Body:</strong> {previewingResource.author} ({previewingResource.department})
                    </p>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      <strong>Hijri Date:</strong> {previewingResource.hijriDate} ({previewingResource.uploadDate})
                    </p>
                  </div>
                </div>
              )}

              {readerTab === 'contents' && previewingResource.previewContent?.tableOfContents && (
                <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-3">
                    Curriculum & Handbook Sections
                  </h4>
                  <ul className="divide-y divide-stone-100 dark:divide-stone-700 text-sm text-stone-700 dark:text-stone-300">
                    {(previewingResource.previewContent.tableOfContents || []).map((chap, idx) => (
                      <li key={idx} className="py-2 flex items-center justify-between">
                        <span>{chap}</span>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {previewingResource.previewContent?.arabicText && (
                  <button
                    onClick={() => handleCopyText(previewingResource.previewContent?.arabicText || '', 'Arabic Sermon Text')}
                    className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-200 dark:border-stone-600 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Text
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-200 dark:border-stone-600 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Sheet
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewingResource(null)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-200/80 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 rounded-xl transition-colors cursor-pointer"
                >
                  Close Reader
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewingResource);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Document ({previewingResource.fileSize})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Edit Resource Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    {editingResource ? 'Edit Educational Resource' : 'Upload Educational Resource / Khutbah'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Publish curriculum materials, PDF guides, or Friday sermon templates for Jimma Zone institutions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Titles in 3 Languages */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Document / Sermon Title (English / Standard) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Standard Friday Khutbah: Social Solidarity & Mutual Assistance"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                      Arabic Title (العنوان بالعربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.arabicTitle}
                      onChange={(e) => setFormData({ ...formData, arabicTitle: e.target.value })}
                      placeholder="خطبة الجمعة الموحدة..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-arabic focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                      Afaan Oromoo Title (Mata Duree Xibaa)
                    </label>
                    <input
                      type="text"
                      value={formData.oromoTitle}
                      onChange={(e) => setFormData({ ...formData, oromoTitle: e.target.value })}
                      placeholder="Xiba Jim’ataa: Tokkummaa..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Categorization Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Resource Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ResourceCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="Khutbah Template">Khutbah Template</option>
                    <option value="Educational Material">Educational Material</option>
                    <option value="PDF Handbook">PDF Handbook</option>
                    <option value="Tajweed & Tahfeez">Tajweed & Tahfeez</option>
                    <option value="Fiqh & Fatwa Guide">Fiqh & Fatwa Guide</option>
                    <option value="Administrative Protocol">Administrative Protocol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Target Institution *
                  </label>
                  <select
                    value={formData.targetInstitution}
                    onChange={(e) => setFormData({ ...formData, targetInstitution: e.target.value as ResourceTargetInstitution })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="Both">Both Mosques & Madrasas</option>
                    <option value="Mosques Only">Mosques Only</option>
                    <option value="Madrasas Only">Madrasas Only</option>
                    <option value="Community Wide">Community Wide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Language *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as ResourceLanguage })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="Multilingual">Multilingual (Ar + Oro + Eng)</option>
                    <option value="Afaan Oromoo">Afaan Oromoo</option>
                    <option value="Arabic">Arabic</option>
                    <option value="English">English</option>
                    <option value="Amharic">Amharic</option>
                  </select>
                </div>
              </div>

              {/* Author, Department & File Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Author / Scholars
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Supreme Shari'ah & Ifta Directorate"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Department / Directorate
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Shariah & Fatwa Board"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Format & Size
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value as ResourceFormat })}
                      className="w-1/2 px-2.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                      <option value="Printable Sheet">Printable</option>
                      <option value="PPTX">PPTX</option>
                    </select>
                    <input
                      type="text"
                      value={formData.fileSize}
                      onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                      placeholder="1.8 MB"
                      className="w-1/2 px-2.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                  Summary & Context Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the core theme, pedagogical goals, or rulings covered in this material..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Summary Points & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Key Bullet Points (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.summaryPointsText}
                    onChange={(e) => setFormData({ ...formData, summaryPointsText: e.target.value })}
                    placeholder="First Khutbah theme: Quranic proof...&#10;Second Khutbah: Practical community steps...&#10;Includes 15-minute pacing guide."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Search Tags (Comma separated)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.tagsText}
                    onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                    placeholder="Khutbah, Jummah, Takaful, Madrasa Syllabus, Tajweed"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden text-[11px]"
                  />
                </div>
              </div>

              {/* Optional Reader Content (Arabic vocalized script & Oromo translation) */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Interactive Reader Content (Khutbah / Study Text)
                  </span>
                  <span className="text-[10px] text-stone-400">Enables in-app Minbar reading mode</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-1">
                    Arabic Vocalized Text (نص الخطبة مشكولاً للخطيب)
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={formData.arabicText}
                    onChange={(e) => setFormData({ ...formData, arabicText: e.target.value })}
                    placeholder="الخطبة الأولى: الحمد لله رب العالمين..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-arabic text-sm focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-1">
                    Afaan Oromoo Speech / Translation
                  </label>
                  <textarea
                    rows={2}
                    value={formData.translationOromo}
                    onChange={(e) => setFormData({ ...formData, translationOromo: e.target.value })}
                    placeholder="Faaruun hundi kan Rabbii..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Flags / Options */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinnedForJummah}
                    onChange={(e) => setFormData({ ...formData, isPinnedForJummah: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Pin to Upcoming Friday Jummah Broadcast
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Mark as Featured Resource
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingResource ? 'Update Material' : 'Publish Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingResourceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-stone-900 dark:text-white mb-2">
              Remove Educational Resource?
            </h3>
            <p className="text-xs text-center text-stone-500 dark:text-stone-400 mb-6">
              Are you sure you want to remove this document from the council repository? Madrasas and mosques will no longer be able to download it from the public catalog.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingResourceId(null)}
                className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Remove Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
