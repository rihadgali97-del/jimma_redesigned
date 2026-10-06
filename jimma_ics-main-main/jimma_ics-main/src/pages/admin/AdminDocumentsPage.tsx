import React, { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Download,
  Mail,
  FileText,
  Loader2,
  Search,
  Send,
  Share2,
  Trash2,
  MessageCircle,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  CouncilArchiveDocument,
  createCouncilDocumentShare,
  deleteCouncilArchiveDocument,
  downloadCouncilArchiveDocument,
  fetchCouncilArchiveDocuments,
  uploadCouncilArchiveDocument,
} from '../../services/councilDocumentsApi';

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = sizeBytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export const AdminDocumentsPage: React.FC = () => {
  const { addToast } = useApp();
  const [documents, setDocuments] = useState<CouncilArchiveDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState<string | null>(null);
  const [sharingDocumentId, setSharingDocumentId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchCouncilArchiveDocuments()
      .then((rows) => {
        if (isMounted) {
          setDocuments(rows);
          setLoadError('');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Please try again.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [reloadVersion]);

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return documents;
    return documents.filter((document) =>
      [document.title, document.category, document.description, document.fileName]
        .some((value) => value?.toLowerCase().includes(search))
    );
  }, [documents, searchTerm]);

  const resetForm = () => {
    setTitle('');
    setCategory('General');
    setDescription('');
    setFile(null);
  };

  const handleUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      addToast('Document Required', 'Choose a file to upload to the archive.', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      const created = await uploadCouncilArchiveDocument({ title, category, description, file });
      setDocuments((current) => [created, ...current]);
      setIsUploadModalOpen(false);
      resetForm();
      addToast('Document Stored', `"${created.title}" is now saved in the council archive.`, 'success');
    } catch (error) {
      addToast('Upload Failed', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (document: CouncilArchiveDocument) => {
    setBusyDocumentId(document.id);
    try {
      await downloadCouncilArchiveDocument(document.id, document.fileName);
    } catch (error) {
      addToast('Download Failed', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleDelete = async (document: CouncilArchiveDocument) => {
    if (!window.confirm(`Permanently delete "${document.title}" from the council archive?`)) return;
    setBusyDocumentId(document.id);
    try {
      await deleteCouncilArchiveDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      addToast('Document Deleted', `"${document.title}" was removed from the archive.`, 'success');
    } catch (error) {
      addToast('Delete Failed', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleShare = async (document: CouncilArchiveDocument) => {
    if (sharingDocumentId === document.id) {
      setSharingDocumentId(null);
      setShareLink(null);
      return;
    }
    setBusyDocumentId(document.id);
    try {
      const link = await createCouncilDocumentShare(document.id);
      setShareLink(link);
      setSharingDocumentId(document.id);
    } catch (error) {
      addToast('Could Not Create Share Link', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setBusyDocumentId(null);
    }
  };

  const shareMessage = (document: CouncilArchiveDocument) =>
    `${document.title}\nDownload link (expires ${shareLink ? new Date(shareLink.expiresAt).toLocaleDateString() : ''}): ${shareLink?.url || ''}`;

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink.url);
      addToast('Share Link Copied', 'The link is ready to paste and expires in 7 days.', 'success');
    } catch {
      addToast('Could Not Copy Link', 'Your browser did not allow clipboard access. Select a sharing app instead.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Council Document Archive
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Securely store, search, and retrieve council files of any format.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Upload className="w-4 h-4" />}
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search title, category, description, or filename..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading council archive...
        </div>
      ) : loadError ? (
        <div role="alert" className="text-center rounded-2xl border border-rose-200 dark:border-rose-900 py-12 px-4">
          <p className="font-semibold text-rose-700 dark:text-rose-300">Could not load council documents</p>
          <p className="mt-1 text-sm text-stone-500">{loadError}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => {
            setIsLoading(true);
            setReloadVersion((version) => version + 1);
          }}>
            Try again
          </Button>
        </div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((document) => (
            <Card key={document.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="slate">{document.category}</Badge>
                  <span className="text-[11px] text-stone-400 font-mono whitespace-nowrap">
                    {formatFileSize(document.sizeBytes)}
                  </span>
                </div>
                <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 break-words">
                  {document.title}
                </h2>
                {document.description && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3">
                    {document.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate" title={document.fileName}>{document.fileName}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-stone-400">
                  {new Date(document.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={busyDocumentId === document.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    onClick={() => void handleDownload(document)}
                    disabled={busyDocumentId !== null}
                    className="text-xs"
                  >
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={busyDocumentId === document.id && sharingDocumentId !== document.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Share2 className="w-3.5 h-3.5" />}
                    onClick={() => void handleShare(document)}
                    disabled={busyDocumentId !== null}
                    aria-label={`Share ${document.title}`}
                    aria-expanded={sharingDocumentId === document.id}
                    className="text-stone-600 hover:text-emerald-700 dark:text-stone-300"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => void handleDelete(document)}
                    disabled={busyDocumentId !== null}
                    aria-label={`Delete ${document.title}`}
                    className="text-rose-600 hover:text-rose-700"
                  />
                </div>
              </div>
              {sharingDocumentId === document.id && shareLink && (
                <div
                  role="group"
                  aria-label={`Share ${document.title} using`}
                  className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 space-y-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">Share document</p>
                    <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                      Anyone with this private link can download it until {new Date(shareLink.expiresAt).toLocaleString()}.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareLink.url)}&text=${encodeURIComponent(document.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                    >
                      <Send className="w-3.5 h-3.5" /> Telegram
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareMessage(document))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(shareMessage(document))}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-stone-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleCopyShareLink()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-800"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy link
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-16 px-4">
          <FileText className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
          <p className="mt-3 font-semibold text-stone-700 dark:text-stone-300">
            {searchTerm ? 'No matching documents' : 'The council archive is empty'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {searchTerm ? 'Try another search term.' : 'Upload a council file to keep it safely available here.'}
          </p>
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          if (!isUploading) {
            setIsUploadModalOpen(false);
            resetForm();
          }
        }}
        title="Upload Council Document"
        subtitle="Files are stored in the authenticated Cloudinary archive and accessible to authorized staff."
      >
        <form onSubmit={(event) => void handleUploadSubmit(event)} className="space-y-4">
          <div>
            <label htmlFor="council-document-title" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Document Title *
            </label>
            <input
              id="council-document-title"
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>
          <div>
            <label htmlFor="council-document-category" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Category *
            </label>
            <input
              id="council-document-category"
              type="text"
              required
              maxLength={100}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Meeting minutes, circular, audit"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>
          <div>
            <label htmlFor="council-document-description" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description
            </label>
            <textarea
              id="council-document-description"
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>
          <div>
            <label htmlFor="council-document-file" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              File *
            </label>
            <input
              id="council-document-file"
              type="file"
              required
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full text-xs sm:text-sm text-stone-600 dark:text-stone-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-800"
            />
            <p className="mt-1 text-[11px] text-stone-500">
              Any file format is accepted up to the server&apos;s configured upload limit.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button
              variant="ghost"
              type="button"
              disabled={isUploading}
              onClick={() => {
                setIsUploadModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Store Document'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
