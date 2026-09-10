import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  Upload,
  ChevronRight,
  ChevronDown,
  FileText,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Edit2,
  Search,
  ArrowLeft,
  ArrowUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  RefreshCw,
  HardDrive,
  Layers,
  Grid,
  List,
} from 'lucide-react';
import api from '../../services/api';
import {
  type ProjectFolderItem,
  type ProjectFileItem,
  generateLocalHierarchy,
} from '../../data/projectFolderTemplate';

interface ProjectFileManagerProps {
  projectId: string;
  projectCode?: string;
  projectName?: string;
  clientName?: string;
  onBack?: () => void;
}

export const ProjectFileManager: React.FC<ProjectFileManagerProps> = ({
  projectId,
  projectCode = 'PROJECT',
  projectName = 'Project Workspace',
  clientName = '',
  onBack,
}) => {
  // --- STATE ---
  const [folders, setFolders] = useState<ProjectFolderItem[]>([]);
  const [files, setFiles] = useState<ProjectFileItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modals
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState<{ type: 'folder' | 'file'; id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'folder' | 'file'; id: string; name: string; isSystem?: boolean } | null>(null);
  const [previewFile, setPreviewFile] = useState<ProjectFileItem | null>(null);
  const [isInitHierarchyConfirmOpen, setIsInitHierarchyConfirmOpen] = useState(false);
  const [isInitializingHierarchy, setIsInitializingHierarchy] = useState(false);

  // Drag & drop
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Load project folders & files
  useEffect(() => {
    loadFoldersAndFiles();
  }, [projectId]);

  const loadFoldersAndFiles = async () => {
    setIsLoading(true);
    let loadedFolders: ProjectFolderItem[] = [];
    let loadedFiles: ProjectFileItem[] = [];

    try {
      const res = await api.get(`/projects/${projectId}/folders`);
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        loadedFolders = res.data.data;
      }
    } catch (err) {
      console.warn('[ProjectFileManager] Backend folder API unavailable, checking local storage:', err);
    }

    // Local Storage Fallback if DB empty or offline
    if (loadedFolders.length === 0) {
      const storageKey = `ssa_project_folders_${projectId}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          loadedFolders = JSON.parse(cached);
        } catch {}
      }

      // If still empty, auto-generate standard hierarchy
      if (loadedFolders.length === 0) {
        loadedFolders = generateLocalHierarchy(projectId, projectName);
        localStorage.setItem(storageKey, JSON.stringify(loadedFolders));
      }
    }

    setFolders(loadedFolders);

    // Auto-select root or first top-level folder
    const root = loadedFolders.find(f => !f.parentFolderId || f.folderType === 'ROOT');
    if (root) {
      setSelectedFolderId(root.id);
      setExpandedFolderIds(new Set([root.id]));
    } else if (loadedFolders.length > 0) {
      setSelectedFolderId(loadedFolders[0].id);
      setExpandedFolderIds(new Set([loadedFolders[0].id]));
    }

    // Load files
    try {
      const fileRes = await api.get(`/projects/${projectId}/files`);
      if (fileRes.data?.success && Array.isArray(fileRes.data.data)) {
        loadedFiles = fileRes.data.data;
      }
    } catch (err) {
      console.warn('[ProjectFileManager] Backend files API unavailable, checking local storage:', err);
    }

    if (loadedFiles.length === 0) {
      const fileStorageKey = `ssa_project_files_${projectId}`;
      const cachedFiles = localStorage.getItem(fileStorageKey);
      if (cachedFiles) {
        try {
          loadedFiles = JSON.parse(cachedFiles);
        } catch {}
      }
    }

    setFiles(loadedFiles);
    setIsLoading(false);
  };

  const saveFoldersLocally = (newFolders: ProjectFolderItem[]) => {
    setFolders(newFolders);
    localStorage.setItem(`ssa_project_folders_${projectId}`, JSON.stringify(newFolders));
  };

  const saveFilesLocally = (newFiles: ProjectFileItem[]) => {
    setFiles(newFiles);
    localStorage.setItem(`ssa_project_files_${projectId}`, JSON.stringify(newFiles));
  };

  // --- HIERARCHY TREE COMPUTATION ---
  const folderMap = useMemo(() => {
    const map = new Map<string, ProjectFolderItem>();
    folders.forEach(f => map.set(f.id, f));
    return map;
  }, [folders]);

  const rootFolders = useMemo(() => {
    return folders.filter(f => !f.parentFolderId || f.folderType === 'ROOT');
  }, [folders]);

  const currentFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folderMap.get(selectedFolderId) || null;
  }, [selectedFolderId, folderMap]);

  // Current folder's subfolders
  const currentSubfolders = useMemo(() => {
    if (!selectedFolderId) return [];
    return folders
      .filter(f => f.parentFolderId === selectedFolderId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
  }, [selectedFolderId, folders]);

  // Current folder's files
  const currentFiles = useMemo(() => {
    if (!selectedFolderId) return [];
    return files.filter(f => f.folderId === selectedFolderId);
  }, [selectedFolderId, files]);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs: ProjectFolderItem[] = [];
    let curr = currentFolder;
    while (curr) {
      crumbs.unshift(curr);
      curr = curr.parentFolderId ? folderMap.get(curr.parentFolderId) || null : null;
    }
    return crumbs;
  }, [currentFolder, folderMap]);

  // Search Results
  const isSearching = searchQuery.trim().length > 0;
  const filteredFolders = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase();
    return folders.filter(f => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery, isSearching]);

  const filteredFiles = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase();
    return files.filter(f => f.fileName.toLowerCase().includes(q));
  }, [files, searchQuery, isSearching]);

  // Toggle tree node expansion
  const toggleExpand = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFolderIds(new Set(folders.map(f => f.id)));
  };

  const collapseAll = () => {
    const root = folders.find(f => !f.parentFolderId);
    setExpandedFolderIds(root ? new Set([root.id]) : new Set());
  };

  // --- ACTIONS ---
  // Create Folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedFolderId) return;

    const trimmed = newFolderName.trim();
    try {
      const res = await api.post(`/projects/${projectId}/folders`, {
        name: trimmed,
        parentFolderId: selectedFolderId,
        folderType: 'CUSTOM',
      });
      if (res.data?.success && res.data.data) {
        const created = res.data.data;
        const updated = [...folders, created];
        saveFoldersLocally(updated);
        setToast({ type: 'success', message: `Folder "${trimmed}" created successfully.` });
        setExpandedFolderIds(prev => new Set([...prev, selectedFolderId]));
      } else {
        throw new Error(res.data?.message || 'Failed to create folder');
      }
    } catch {
      // Local fallback
      const newFolder: ProjectFolderItem = {
        id: `FLDR-${Date.now()}`,
        projectId,
        parentFolderId: selectedFolderId,
        name: trimmed,
        folderType: 'CUSTOM',
        sortOrder: 99,
        isSystemFolder: false,
        createdBy: 'User',
      };
      const updated = [...folders, newFolder];
      saveFoldersLocally(updated);
      setToast({ type: 'success', message: `Folder "${trimmed}" created successfully.` });
      setExpandedFolderIds(prev => new Set([...prev, selectedFolderId]));
    }

    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  // Rename Action
  const handleRenameSubmit = async () => {
    if (!renameTarget || !renameValue.trim()) return;

    const trimmed = renameValue.trim();
    if (renameTarget.type === 'folder') {
      try {
        await api.put(`/projects/${projectId}/folders/${renameTarget.id}`, { name: trimmed });
      } catch (err) {
        console.warn('Backend rename folder fallback:', err);
      }
      const updated = folders.map(f => f.id === renameTarget.id ? { ...f, name: trimmed } : f);
      saveFoldersLocally(updated);
      setToast({ type: 'success', message: `Folder renamed to "${trimmed}".` });
    } else {
      try {
        await api.put(`/projects/${projectId}/files/${renameTarget.id}`, { fileName: trimmed });
      } catch (err) {
        console.warn('Backend rename file fallback:', err);
      }
      const updated = files.map(f => f.id === renameTarget.id ? { ...f, fileName: trimmed } : f);
      saveFilesLocally(updated);
      setToast({ type: 'success', message: `File renamed to "${trimmed}".` });
    }

    setRenameTarget(null);
    setRenameValue('');
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'folder') {
      try {
        await api.delete(`/projects/${projectId}/folders/${deleteConfirm.id}`);
      } catch (err) {
        console.warn('Backend delete folder fallback:', err);
      }

      // Collect all child IDs recursively
      const toDeleteIds = new Set<string>([deleteConfirm.id]);
      let changed = true;
      while (changed) {
        changed = false;
        folders.forEach(f => {
          if (f.parentFolderId && toDeleteIds.has(f.parentFolderId) && !toDeleteIds.has(f.id)) {
            toDeleteIds.add(f.id);
            changed = true;
          }
        });
      }

      const updatedFolders = folders.filter(f => !toDeleteIds.has(f.id));
      const updatedFiles = files.filter(f => !toDeleteIds.has(f.folderId));
      saveFoldersLocally(updatedFolders);
      saveFilesLocally(updatedFiles);

      if (selectedFolderId && toDeleteIds.has(selectedFolderId)) {
        const root = updatedFolders.find(f => !f.parentFolderId) || updatedFolders[0];
        setSelectedFolderId(root ? root.id : null);
      }

      setToast({ type: 'success', message: `Folder "${deleteConfirm.name}" deleted.` });
    } else {
      try {
        await api.delete(`/projects/${projectId}/files/${deleteConfirm.id}`);
      } catch (err) {
        console.warn('Backend delete file fallback:', err);
      }
      const updatedFiles = files.filter(f => f.id !== deleteConfirm.id);
      saveFilesLocally(updatedFiles);
      setToast({ type: 'success', message: `File "${deleteConfirm.name}" deleted.` });
    }

    setDeleteConfirm(null);
  };

  // Re-generate / Initialize Standard Hierarchy
  const handleInitStandardHierarchy = async () => {
    setIsInitializingHierarchy(true);
    try {
      const res = await api.post(`/projects/${projectId}/folders/init`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setFolders(res.data.data);
        saveFoldersLocally(res.data.data);
      } else {
        throw new Error('API fallback');
      }
    } catch {
      // Client-side generation fallback
      const generated = generateLocalHierarchy(projectId, projectName);
      saveFoldersLocally(generated);
    }
    setIsInitializingHierarchy(false);
    setIsInitHierarchyConfirmOpen(false);
    setToast({ type: 'success', message: 'Standard 17-Folder Hierarchy generated successfully!' });
  };

  // File Upload Handler
  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !selectedFolderId) return;

    setIsUploading(true);
    setUploadProgress(10);
    const uploadedRecords: ProjectFileItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let fileUrl = '';

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `ssa_projects/${projectCode}/${currentFolder?.name || 'general'}`);

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data?.success && uploadRes.data.url) {
          fileUrl = uploadRes.data.url;
        } else {
          fileUrl = URL.createObjectURL(file);
        }
      } catch (err) {
        console.warn('Direct upload error, generating object preview URL:', err);
        fileUrl = URL.createObjectURL(file);
      }

      // Record in project files API
      try {
        const recordRes = await api.post(`/projects/${projectId}/files`, {
          folderId: selectedFolderId,
          fileName: file.name,
          filePath: fileUrl,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
        });

        if (recordRes.data?.success && recordRes.data.data) {
          uploadedRecords.push(recordRes.data.data);
        } else {
          uploadedRecords.push({
            id: `FILE-${Date.now()}-${i}`,
            projectId,
            folderId: selectedFolderId,
            fileName: file.name,
            filePath: fileUrl,
            fileType: file.type,
            fileSize: file.size,
            uploadedBy: 'User',
            createdAt: new Date().toISOString(),
          });
        }
      } catch {
        uploadedRecords.push({
          id: `FILE-${Date.now()}-${i}`,
          projectId,
          folderId: selectedFolderId,
          fileName: file.name,
          filePath: fileUrl,
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: 'User',
          createdAt: new Date().toISOString(),
        });
      }

      setUploadProgress(Math.round(((i + 1) / fileList.length) * 100));
    }

    const updated = [...files, ...uploadedRecords];
    saveFilesLocally(updated);
    setIsUploading(false);
    setUploadProgress(0);
    setToast({
      type: 'success',
      message: `${uploadedRecords.length} file(s) uploaded to "${currentFolder?.name || 'folder'}".`,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper for file type icon
  const getFileIcon = (fileName: string, fileType?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext) || fileType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-rose-500" />;
    }
    if (ext === 'pdf' || fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (['dwg', 'dxf', 'cad', 'rvt', 'ifc'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-blue-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  // Helper to get workflow folder badges
  const getFolderBadgeStyle = (folder: ProjectFolderItem) => {
    const name = folder.name.toLowerCase();
    if (name.includes('work in progress') || name.includes('wip')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
    if (name.includes('shared')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    if (name.includes('archive')) {
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
    if (folder.folderType === 'TOP_LEVEL' || /^\d+\./.test(folder.name)) {
      return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 font-bold';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  // Recursive Tree Node Component
  const TreeNode: React.FC<{ folder: ProjectFolderItem; depth?: number }> = ({ folder, depth = 0 }) => {
    const childFolders = folders
      .filter(f => f.parentFolderId === folder.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));

    const isExpanded = expandedFolderIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = childFolders.length > 0;
    const childFileCount = files.filter(f => f.folderId === folder.id).length;

    const isWorkflowFolder = ['work in progress', 'shared', 'archive'].some(k =>
      folder.name.toLowerCase().includes(k)
    );

    return (
      <div className="select-none">
        <div
          onClick={() => {
            setSelectedFolderId(folder.id);
            if (!isExpanded && hasChildren) {
              setExpandedFolderIds(prev => new Set([...prev, folder.id]));
            }
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 group ${
            isSelected
              ? 'bg-brand-primary text-white font-semibold shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          style={{ paddingLeft: `${Math.max(10, depth * 16 + 10)}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(folder.id, e)}
                className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${
                  isSelected ? 'text-white' : 'text-slate-400'
                }`}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5" />
            )}

            {isSelected ? (
              <FolderOpen className="w-4 h-4 shrink-0 text-white" />
            ) : isWorkflowFolder ? (
              <Layers className={`w-4 h-4 shrink-0 ${folder.name.includes('Progress') ? 'text-amber-500' : folder.name.includes('Shared') ? 'text-emerald-500' : 'text-slate-400'}`} />
            ) : (
              <Folder className={`w-4 h-4 shrink-0 ${folder.folderType === 'TOP_LEVEL' ? 'text-brand-primary' : 'text-slate-400'}`} />
            )}

            <span className="truncate">{folder.name}</span>
          </div>

          {childFileCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ml-1 shrink-0 ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {childFileCount}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="relative">
            <div className="absolute left-[18px] top-0 bottom-2 w-px bg-slate-200 dark:bg-slate-800" style={{ left: `${depth * 16 + 16}px` }} />
            {childFolders.map(child => (
              <TreeNode key={child.id} folder={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Banner & Title Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                {projectCode}
              </span>
              <h1 className="text-xl font-extrabold text-brand-charcoal dark:text-white tracking-tight">
                {projectName}
              </h1>
            </div>
            <p className="text-xs text-brand-gray dark:text-slate-400 mt-1">
              Client: <span className="text-brand-charcoal dark:text-slate-200 font-semibold">{clientName || 'Assigned Client'}</span> &bull; {folders.length} Folders &bull; {files.length} Files
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsInitHierarchyConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-300/60 dark:border-slate-700"
            title="Re-generate standard template folders"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Standard Template
          </button>

          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-300/60 dark:border-slate-700"
          >
            <FolderPlus className="w-3.5 h-3.5 text-brand-primary" /> New Subfolder
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold shadow-md shadow-brand-primary/10 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Upload Files
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* Main Split Layout: Left Folder Tree & Right Folder Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Folder Tree (4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3 sticky top-4 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-brand-primary" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-charcoal dark:text-slate-200">
                Project Directory Tree
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="text-[10px] text-brand-primary hover:underline px-1 py-0.5 font-semibold cursor-pointer"
              >
                Expand
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={collapseAll}
                className="text-[10px] text-slate-500 hover:underline px-1 py-0.5 font-semibold cursor-pointer"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search folders & files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tree Scroll Area */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-0.5 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading folders...
              </div>
            ) : rootFolders.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No folders found. Click "Standard Template" to generate.
              </div>
            ) : (
              rootFolders.map(root => (
                <TreeNode key={root.id} folder={root} depth={0} />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Folder Content / File Explorer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Breadcrumb Navigation & View Controls */}
          <div className="glass-card rounded-2xl px-4 py-3 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600 dark:text-slate-300">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                  <button
                    onClick={() => setSelectedFolderId(crumb.id)}
                    className={`hover:text-brand-primary transition-colors cursor-pointer truncate max-w-[180px] ${
                      idx === breadcrumbs.length - 1
                        ? 'font-extrabold text-brand-charcoal dark:text-white'
                        : 'text-slate-500 font-medium'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}

              {breadcrumbs.length > 1 && (
                <button
                  onClick={() => {
                    const parent = breadcrumbs[breadcrumbs.length - 2];
                    if (parent) setSelectedFolderId(parent.id);
                  }}
                  className="ml-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                  title="Go to parent folder"
                >
                  <ArrowUp className="w-3 h-3" /> Up
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Upload Progress Banner */}
          {isUploading && (
            <div className="glass-card rounded-2xl p-4 border border-brand-primary/30 bg-brand-primary/5 animate-fade-in space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-brand-primary flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading files...
                </span>
                <span className="font-mono text-xs font-bold text-brand-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone Container */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`transition-all rounded-3xl ${
              isDraggingOver
                ? 'border-2 border-dashed border-brand-primary bg-brand-primary/10 p-2'
                : ''
            }`}
          >
            {/* Search Results Display if active */}
            {isSearching ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-charcoal dark:text-white">
                    Search Results for "{searchQuery}"
                  </h3>
                  <span className="text-xs text-slate-500">
                    {filteredFolders.length} folders, {filteredFiles.length} files
                  </span>
                </div>

                {filteredFolders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Folders</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredFolders.map(folder => (
                        <div
                          key={folder.id}
                          onClick={() => {
                            setSelectedFolderId(folder.id);
                            setSearchQuery('');
                          }}
                          className="glass-card p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/40 cursor-pointer transition-all flex items-center gap-2.5 group"
                        >
                          <Folder className="w-5 h-5 text-brand-primary shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-brand-charcoal dark:text-white truncate">
                              {folder.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {folder.folderType}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Files</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredFiles.map(file => (
                        <div
                          key={file.id}
                          onClick={() => setPreviewFile(file)}
                          className="glass-card p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/40 cursor-pointer transition-all flex items-center gap-2.5 group"
                        >
                          {getFileIcon(file.fileName, file.fileType)}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-brand-charcoal dark:text-white truncate">
                              {file.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                  <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-800">
                    <p className="text-sm text-slate-500 font-medium">No folders or files matched "{searchQuery}".</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Subfolders Section */}
                {currentSubfolders.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Subfolders ({currentSubfolders.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {currentSubfolders.map(subfolder => {
                        const count = files.filter(f => f.folderId === subfolder.id).length;
                        return (
                          <div
                            key={subfolder.id}
                            onDoubleClick={() => setSelectedFolderId(subfolder.id)}
                            className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                          >
                            <div
                              onClick={() => setSelectedFolderId(subfolder.id)}
                              className="flex items-start gap-3"
                            >
                              <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-105 transition-transform shrink-0">
                                <Folder className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-extrabold text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors line-clamp-2">
                                  {subfolder.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getFolderBadgeStyle(subfolder)}`}>
                                    {subfolder.folderType}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {count} {count === 1 ? 'file' : 'files'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameTarget({ type: 'folder', id: subfolder.id, name: subfolder.name });
                                  setRenameValue(subfolder.name);
                                }}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                                title="Rename folder"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({
                                    type: 'folder',
                                    id: subfolder.id,
                                    name: subfolder.name,
                                    isSystem: subfolder.isSystemFolder,
                                  });
                                }}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                                title="Delete folder"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Files Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Files ({currentFiles.length})
                    </h3>
                  </div>

                  {currentFiles.length === 0 && currentSubfolders.length === 0 ? (
                    <div className="glass-card rounded-3xl p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-brand-charcoal dark:text-white">This folder is empty</h4>
                        <p className="text-xs text-brand-gray dark:text-slate-400 mt-1 max-w-sm mx-auto">
                          Drag and drop files here, or click "Upload Files" to upload drawings, documents, or reports into this folder.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold shadow-md shadow-brand-primary/10 transition-all cursor-pointer">
                        <Upload className="w-3.5 h-3.5" /> Select Files
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                      </label>
                    </div>
                  ) : currentFiles.length === 0 ? (
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400">
                      No files directly in this folder. Double-click any subfolder above or drop files here.
                    </div>
                  ) : viewMode === 'grid' ? (
                    /* Files Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {currentFiles.map(file => (
                        <div
                          key={file.id}
                          className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/50 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                              {getFileIcon(file.fileName, file.fileType)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4
                                onClick={() => setPreviewFile(file)}
                                className="text-xs font-extrabold text-brand-charcoal dark:text-white hover:text-brand-primary cursor-pointer truncate transition-colors"
                                title={file.fileName}
                              >
                                {file.fileName}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {formatFileSize(file.fileSize)} &bull; {file.uploadedBy || 'User'}
                              </p>
                            </div>
                          </div>

                          {/* File Card Actions */}
                          <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>

                            <div className="flex items-center gap-1">
                              <a
                                href={file.filePath}
                                download={file.fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-primary"
                                title="Download file"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  setRenameTarget({ type: 'file', id: file.id, name: file.fileName });
                                  setRenameValue(file.fileName);
                                }}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                                title="Rename file"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({ type: 'file', id: file.id, name: file.fileName });
                                }}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                                title="Delete file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Files List / Table View */
                    <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800">
                            <tr>
                              <th className="px-4 py-3">File Name</th>
                              <th className="px-4 py-3">Size</th>
                              <th className="px-4 py-3">Uploaded By</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {currentFiles.map(file => (
                              <tr key={file.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-4 py-3">
                                  <div
                                    onClick={() => setPreviewFile(file)}
                                    className="flex items-center gap-2.5 cursor-pointer font-bold text-brand-charcoal dark:text-white hover:text-brand-primary"
                                  >
                                    {getFileIcon(file.fileName, file.fileType)}
                                    <span className="truncate max-w-xs">{file.fileName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                  {formatFileSize(file.fileSize)}
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {file.uploadedBy || 'User'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setPreviewFile(file)}
                                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-brand-primary"
                                      title="Preview"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <a
                                      href={file.filePath}
                                      download={file.fileName}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-primary"
                                      title="Download"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                      onClick={() => {
                                        setRenameTarget({ type: 'file', id: file.id, name: file.fileName });
                                        setRenameValue(file.fileName);
                                      }}
                                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                                      title="Rename"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeleteConfirm({ type: 'file', id: file.id, name: file.fileName });
                                      }}
                                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Create Subfolder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-brand-charcoal dark:text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-brand-primary" /> Create New Subfolder
              </h3>
              <button
                onClick={() => setIsCreateFolderOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Create folder inside: <strong className="text-brand-charcoal dark:text-white">{currentFolder?.name}</strong>
              </p>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Client Approvals, Revision 01, Invoices"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                  }}
                  autoFocus
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-brand-charcoal dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-primary" /> Rename {renameTarget.type === 'folder' ? 'Folder' : 'File'}
              </h3>
              <button
                onClick={() => setRenameTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  New Name
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit();
                  }}
                  autoFocus
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={!renameValue.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 rounded-2xl bg-red-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-brand-charcoal dark:text-white">
                Delete {deleteConfirm.type === 'folder' ? 'Folder' : 'File'}?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-brand-charcoal dark:text-white">"{deleteConfirm.name}"</strong>?
              {deleteConfirm.type === 'folder' && ' All files and subfolders inside it will be permanently deleted.'}
            </p>

            {deleteConfirm.isSystem && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> This is a standard template system folder. Deleting it may affect workflow organization.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Standard Template Re-initialization Modal */}
      {isInitHierarchyConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-brand-primary">
              <div className="p-2.5 rounded-2xl bg-brand-primary/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-brand-charcoal dark:text-white">
                Generate Standard Hierarchy
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will ensure all <strong>17 Standard Top-Level Folders</strong> and nested subfolder categories based on the <strong>KONGUNAD HOSPITAL</strong> structure are present for this project.
              Existing custom folders and files will be preserved.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setIsInitHierarchyConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleInitStandardHierarchy}
                disabled={isInitializingHierarchy}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
              >
                {isInitializingHierarchy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Generate Structure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(previewFile.fileName, previewFile.fileType)}
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-brand-charcoal dark:text-white truncate">
                    {previewFile.fileName}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {formatFileSize(previewFile.fileSize)} &bull; Uploaded by {previewFile.uploadedBy || 'User'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewFile.filePath}
                  download={previewFile.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: File Viewer */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[400px]">
              {previewFile.fileType?.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(previewFile.fileName) ? (
                <img
                  src={previewFile.filePath}
                  alt={previewFile.fileName}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : previewFile.fileType === 'application/pdf' || /\.pdf$/i.test(previewFile.fileName) ? (
                <iframe
                  src={previewFile.filePath}
                  title={previewFile.fileName}
                  className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="text-center space-y-3 p-8 glass-card rounded-2xl">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-brand-charcoal dark:text-white">
                      File Preview not available directly in browser
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Download the file to view it with your system CAD or office application.
                    </p>
                  </div>
                  <a
                    href={previewFile.filePath}
                    download={previewFile.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold"
                  >
                    <Download className="w-4 h-4" /> Download {previewFile.fileName}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-bounce-in ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20'
              : toast.type === 'error'
              ? 'bg-red-500 text-white border-red-400 shadow-red-500/20'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
