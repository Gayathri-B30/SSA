import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Layers,
  FileText,
  Upload,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  Folder,
  Building2,
  User,
  ShieldCheck,
  Settings,
  X,
  FileCode,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Tag
} from 'lucide-react';
import api from '../../../services/api';
import { DISCIPLINE_CATALOG, deriveProjectCodeFromName, type DisciplineCode } from '../../../data/masterDrawingListData';
const DEFAULT_PROJECT = {
  id: 'PRJ-DEFAULT',
  projectCode: 'PROJECT',
  projectName: 'Select Project',
  clientName: '',
  projectType: 'Commercial',
  disciplines: []
};

const getStoredDisciplines = (pId: string): any[] => {
  try {
    const raw = localStorage.getItem(`ssa_disciplines_${pId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredDisciplines = (pId: string, disciplines: any[]) => {
  try {
    localStorage.setItem(`ssa_disciplines_${pId}`, JSON.stringify(disciplines));
  } catch (err) {
    console.error(err);
  }
};

const getStoredDrawings = (pId: string, projectCode?: string): any[] => {
  try {
    const validKeys = Array.from(new Set([
      `ssa_drawings_${pId}`,
      projectCode ? `ssa_drawings_${projectCode}` : null
    ])).filter(Boolean) as string[];

    let projectDrawings: any[] = [];
    for (const key of validKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          projectDrawings = [...projectDrawings, ...parsed];
        }
      }
    }

    const validCodes = new Set(
      [pId, projectCode]
        .filter(Boolean)
        .map(s => String(s).trim().toLowerCase())
    );

    const map = new Map();
    projectDrawings.forEach(item => {
      const k = item.id || item.drawingNumber || item.drawingCode;
      if (!k) return;

      const itemPrj = String(item.projectCode || item.project || item.projectId || '').trim().toLowerCase();
      if (itemPrj && validCodes.size > 0) {
        const matches = Array.from(validCodes).some(code =>
          itemPrj === code || itemPrj.includes(code) || code.includes(itemPrj)
        );
        if (!matches) return;
      }
      map.set(k, item);
    });
    return Array.from(map.values());
  } catch {
    return [];
  }
};

interface ProjectDrawingWorkspaceProps {
  projectId?: string | null;
  onBack?: () => void;
}

export const ProjectDrawingWorkspace: React.FC<ProjectDrawingWorkspaceProps> = ({ projectId, onBack }) => {
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('project');
  const activeProjectId = projectId || urlProjectId || DEFAULT_PROJECT.id;

  const [projects, setProjects] = useState<any[]>([DEFAULT_PROJECT]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId);
  const [projectData, setProjectData] = useState<any | null>(DEFAULT_PROJECT);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (activeProjectId) {
      setSelectedProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  // Filters
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drawers / Modals
  const [selectedDrawing, setSelectedDrawing] = useState<any | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState<boolean>(false);
  const [isAddDisciplineModalOpen, setIsAddDisciplineModalOpen] = useState<boolean>(false);
  const [newDisciplineCode, setNewDisciplineCode] = useState<string>('AR');
  const [addingDiscipline, setAddingDiscipline] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [blobPdfUrl, setBlobPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);

  // Fetch remote PDF as typed Blob to bypass Content-Disposition: attachment header
  useEffect(() => {
    if (!previewDoc) {
      setBlobPdfUrl(null);
      setPdfLoading(false);
      return;
    }

    const rawUrl = previewDoc.fileUrl || previewDoc.url || '';
    if (!rawUrl || rawUrl.endsWith('placeholder')) {
      setBlobPdfUrl(null);
      setPdfLoading(false);
      return;
    }

    const isImage = /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(rawUrl);
    if (isImage) {
      setBlobPdfUrl(null);
      setPdfLoading(false);
      return;
    }

    if (rawUrl.startsWith('blob:')) {
      setBlobPdfUrl(rawUrl);
      setPdfLoading(false);
      return;
    }

    setPdfLoading(true);
    let active = true;

    fetch(rawUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error('Fetch failed');
        const blob = await res.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const objUrl = URL.createObjectURL(pdfBlob);
        if (active) {
          setBlobPdfUrl(objUrl);
          setPdfLoading(false);
        }
      })
      .catch((err) => {
        console.warn('PDF blob fetch fallback to Google Docs Viewer:', err);
        if (active) {
          setBlobPdfUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`);
          setPdfLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [previewDoc]);

  // New Revision Form State
  const [revCode, setRevCode] = useState<string>('R01');
  const [revPreparedBy, setRevPreparedBy] = useState<string>('');
  const [revCheckedBy, setRevCheckedBy] = useState<string>('');
  const [revApprovedBy, setRevApprovedBy] = useState<string>('');
  const [revStatus, setRevStatus] = useState<string>('Under Review');
  const [revRemarks, setRevRemarks] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<any | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [revSubmitting, setRevSubmitting] = useState<boolean>(false);

  // Master Drawing Types Admin State
  const [drawingTypes, setDrawingTypes] = useState<any[]>([]);
  const [editingType, setEditingType] = useState<any | null>(null);

  // Fetch initial Projects list
  useEffect(() => {
    fetchProjectsList();
  }, []);

  // Fetch project details & drawing register when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
      fetchProjectDrawings(selectedProjectId);
    }
  }, [selectedProjectId, selectedDiscipline]);

  useEffect(() => {
    const handleSync = () => {
      if (selectedProjectId) {
        fetchProjectDrawings(selectedProjectId);
      }
    };
    window.addEventListener('ssa_drawing_registered', handleSync);
    return () => {
      window.removeEventListener('ssa_drawing_registered', handleSync);
    };
  }, [selectedProjectId, selectedDiscipline]);

  const fetchProjectsList = async () => {
    const stored = JSON.parse(localStorage.getItem('ssa_projects') || '[]');

    let apiProjects: any[] = [];
    let apiLeads: any[] = [];

    try {
      const resProj = await api.get('/projects');
      if (resProj.data?.success && Array.isArray(resProj.data.data)) {
        apiProjects = resProj.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch projects list:', err);
    }

    try {
      const resLeads = await api.get('/leads');
      if (resLeads.data?.success && Array.isArray(resLeads.data.data)) {
        apiLeads = resLeads.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch leads list:', err);
    }

    const mergedMap = new Map();

    // 1. Database Projects
    apiProjects.forEach((p: any) => {
      if (p && (p.id || p.projectCode)) {
        const key = p.id || p.projectCode;
        const derivedCode = deriveProjectCodeFromName(p.projectName || p.name || p.title || p.company, p.projectCode || p.id);
        const compAcc = (p.company && p.company !== 'No Company')
          ? p.company
          : (p.organisation || p.company || p.projectName || p.name || 'Company Account');
        const contactPerson = p.contactPerson || p.clientName || p.client || 'N/A';

        mergedMap.set(key, {
          ...p,
          id: p.id || p.projectCode,
          projectCode: p.projectCode || derivedCode || p.id,
          projectName: p.projectName || p.name || p.title || p.projectCode || p.id,
          company: compAcc,
          clientName: compAcc,
          contactPerson,
          projectType: p.projectType || 'Commercial',
          disciplines: p.disciplines || []
        });
      }
    });

    // 2. Database Leads from Lead Generation
    apiLeads.forEach((l: any) => {
      const derivedCode = deriveProjectCodeFromName(l.company || l.organisation || l.projectName || l.leadTitle || l.leadName, l.id ? `LD-${l.id}` : undefined);
      const pCode = l.projectCode || l.leadId || derivedCode || (l.id ? `LD-${l.id}` : null);
      const pName = l.projectName || l.leadTitle || l.leadName || (l.company ? `${l.company} Project` : 'Project');
      if (pCode && pName) {
        const key = l.id ? `LEAD-${l.id}` : pCode;
        if (!mergedMap.has(key) && !mergedMap.has(pCode)) {
          const compAcc = (l.company && l.company !== 'No Company')
            ? l.company
            : (l.organisation || l.company || pName);
          const contactPerson = l.contactPerson || l.clientName || 'N/A';

          mergedMap.set(key, {
            id: key,
            dbId: l.id,
            projectCode: pCode,
            projectName: pName,
            company: compAcc,
            clientName: compAcc,
            contactPerson,
            projectType: l.projectType || l.leadCategory || 'Commercial',
            disciplines: []
          });
        }
      }
    });

    // 3. Stored projects in localStorage
    stored.forEach((p: any) => {
      if (p && (p.id || p.projectCode)) {
        const key = p.id || p.projectCode;
        if (!mergedMap.has(key)) {
          const compAcc = (p.company && p.company !== 'No Company')
            ? p.company
            : (p.organisation || p.company || p.projectName || p.clientName || p.client || 'Company Account');
          const contactPerson = p.contactPerson || p.clientName || p.client || 'N/A';

          mergedMap.set(key, {
            ...p,
            id: p.id || p.projectCode,
            projectCode: p.projectCode || p.id,
            projectName: p.projectName || p.name || p.title || p.projectCode || p.id,
            company: compAcc,
            clientName: compAcc,
            contactPerson,
            projectType: p.projectType || 'Commercial',
            disciplines: p.disciplines || []
          });
        }
      }
    });

    const projList = Array.from(mergedMap.values());
    if (projList.length > 0) {
      setProjects(projList);

      const targetId = activeProjectId || projList[0].id;
      const cleanTargetCode = deriveProjectCodeFromName(targetId, targetId);

      const match = projList.find((p: any) => {
        if (p.id === targetId || p.projectCode === targetId) return true;
        if (p.projectCode && p.projectCode.toLowerCase() === targetId.toLowerCase()) return true;
        if (p.dbId && (`LD-${p.dbId}` === targetId || `CL-${p.dbId}` === targetId || `LEAD-${p.dbId}` === targetId)) return true;

        const derivedPCode = deriveProjectCodeFromName(p.company || p.projectName || p.clientName, p.id);
        if (derivedPCode.toLowerCase() === targetId.toLowerCase() || derivedPCode.toLowerCase() === cleanTargetCode.toLowerCase()) return true;

        return false;
      });

      if (match) {
        setSelectedProjectId(match.id);
      } else if (targetId) {
        const customPrj = {
          id: targetId,
          projectCode: targetId,
          projectName: `Project ${targetId}`,
          company: 'Company Account',
          clientName: 'Company Account',
          contactPerson: 'N/A',
          projectType: 'Commercial',
          disciplines: []
        };
        const updatedList = [...projList, customPrj];
        setProjects(updatedList);
        setSelectedProjectId(targetId);
      } else {
        setSelectedProjectId(projList[0].id);
      }
    } else {
      setProjects([DEFAULT_PROJECT]);
    }
  };

  const fetchProjectDetails = async (pId: string) => {
    const stored = getStoredDisciplines(pId);
    const storedProjects = JSON.parse(localStorage.getItem('ssa_projects') || '[]');
    const targetProj = projects.find((p: any) => p.id === pId || p.projectCode === pId) ||
                       storedProjects.find((p: any) => p.id === pId || p.projectCode === pId);

    try {
      const res = await api.get(`/projects/${pId}`);
      if (res.data?.success && res.data.data) {
        const fetchedData = res.data.data;
        const apiDisciplines = fetchedData.disciplines || [];
        const mergedMap = new Map();
        [...apiDisciplines, ...stored].forEach((d: any) => {
          if (d && d.code) mergedMap.set(d.code, d);
        });
        const mergedDisciplines = Array.from(mergedMap.values());
        const compAcc = (fetchedData.company && fetchedData.company !== 'No Company')
          ? fetchedData.company
          : (fetchedData.organisation || targetProj?.company || targetProj?.clientName || fetchedData.projectName || fetchedData.client || '');
        const repPerson = fetchedData.contactPerson || fetchedData.clientName || targetProj?.contactPerson || 'N/A';

        setProjectData({
          ...fetchedData,
          id: fetchedData.id || pId,
          projectCode: fetchedData.projectCode || pId,
          projectName: fetchedData.projectName || fetchedData.name || targetProj?.projectName || `Project ${pId}`,
          company: compAcc,
          clientName: compAcc,
          contactPerson: repPerson,
          projectType: fetchedData.projectType || targetProj?.projectType || 'Commercial',
          disciplines: mergedDisciplines
        });
        saveStoredDisciplines(pId, mergedDisciplines);
        return;
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    }

    const projBase = targetProj || {
      id: pId,
      projectCode: pId,
      projectName: `Project ${pId}`,
      company: 'Company Account',
      clientName: 'Company Account',
      contactPerson: 'N/A',
      projectType: 'Commercial',
      disciplines: []
    };

    const targetDisciplines = projBase.disciplines || [];
    const mergedMap = new Map();
    [...targetDisciplines, ...stored].forEach((d: any) => {
      if (d && d.code) mergedMap.set(d.code, d);
    });

    const compAcc = (projBase.company && projBase.company !== 'No Company')
      ? projBase.company
      : (projBase.organisation || projBase.clientName || projBase.projectName || '');

    setProjectData({
      ...projBase,
      id: projBase.id || pId,
      projectCode: projBase.projectCode || pId,
      projectName: projBase.projectName || projBase.name || projBase.title || `Project ${pId}`,
      company: compAcc,
      clientName: compAcc,
      contactPerson: projBase.contactPerson || 'N/A',
      projectType: projBase.projectType || 'Commercial',
      disciplines: Array.from(mergedMap.values())
    });
  };

  const fetchProjectDrawings = async (pId: string) => {
    setLoading(true);
    // Use pId as primary - projectData may not have loaded yet on first render
    const targetPrjCode = pId || projectData?.projectCode;
    const stored = getStoredDrawings(pId, targetPrjCode);
    try {
      const url = selectedDiscipline !== 'ALL'
        ? `/projects/${pId}/drawings?discipline=${selectedDiscipline}`
        : `/projects/${pId}/drawings`;
      const res = await api.get(url);
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const apiDrawings = res.data.data;
        const mergedMap = new Map();
        [...apiDrawings, ...stored].forEach((item: any) => {
          const k = item.id || item.drawingNumber || item.drawingCode;
          if (k) mergedMap.set(k, item);
        });
        setDrawings(Array.from(mergedMap.values()));
        return;
      }
    } catch (err) {
      console.error('Failed to fetch project drawings:', err);
    } finally {
      setLoading(false);
    }

    const mergedMap = new Map();
    [...stored].forEach((item: any) => {
      const k = item.id || item.drawingNumber || item.drawingCode;
      if (k) mergedMap.set(k, item);
    });
    setDrawings(Array.from(mergedMap.values()));
  };

  const fetchDrawingTypesMaster = async () => {
    try {
      const res = await api.get('/drawing-types');
      if (res.data?.success) {
        setDrawingTypes(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch drawing types master:', err);
    }
  };

  const handleOpenMasterModal = () => {
    fetchDrawingTypesMaster();
    setIsMasterModalOpen(true);
  };

  const handleOpenRevisionModal = (drawing: any) => {
    setSelectedDrawing(drawing);
    const currNumber = parseInt((drawing.currentRevision || 'R00').replace(/[^0-9]/g, '')) || 0;
    setRevCode(`R${String(currNumber + 1).padStart(2, '0')}`);
    setRevPreparedBy('');
    setRevCheckedBy('');
    setRevApprovedBy('');
    setRevStatus('Under Review');
    setRevRemarks('');
    setUploadedFile(null);
    setIsRevisionModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const pCode = projectData?.projectCode || 'GVR-2026-001';
      const disc = selectedDrawing?.disciplineCode || selectedDrawing?.discipline || 'AR';
      const folderPath = `project_drawings/${pCode}/${disc}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folderPath);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.url || res.data?.success) {
        setUploadedFile({
          url: res.data.url,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitRevision = async () => {
    if (!selectedDrawing) return;

    setRevSubmitting(true);
    try {
      const res = await api.post(`/drawings/${selectedDrawing.id}/revisions`, {
        revisionCode: revCode,
        preparedBy: revPreparedBy || 'Engineer',
        checkedBy: revCheckedBy,
        approvedBy: revApprovedBy,
        status: revStatus,
        remarks: revRemarks,
        fileUrl: uploadedFile?.url,
        originalFileName: uploadedFile?.name,
        fileSize: uploadedFile?.size,
        fileType: uploadedFile?.type
      });

      if (res.data?.success) {
        setIsRevisionModalOpen(false);
        fetchProjectDrawings(selectedProjectId);
        if (selectedDrawing) {
          const detailRes = await api.get(`/drawings/${selectedDrawing.id}`);
          if (detailRes.data?.success) {
            setSelectedDrawing(detailRes.data.data);
          }
        }
      }
    } catch (err: any) {
      console.error('Error submitting revision:', err);
      alert(err.message || 'Failed to add revision.');
    } finally {
      setRevSubmitting(false);
    }
  };

  // Filter logic - strict project scoping
  const projectDrawings = drawings.filter(d => {
    const validCodes = new Set(
      [selectedProjectId, projectData?.id, projectData?.projectCode]
        .filter(Boolean)
        .map(s => String(s).trim().toLowerCase())
    );

    if (validCodes.size === 0) return true;

    const itemPrj = String(d.projectCode || d.project || d.projectId || '').trim().toLowerCase();
    if (itemPrj) {
      return Array.from(validCodes).some(code =>
        itemPrj === code || itemPrj.includes(code) || code.includes(itemPrj)
      );
    }

    const dwgNum = String(d.drawingCode || d.drawingNumber || '').trim().toLowerCase();
    if (dwgNum) {
      return Array.from(validCodes).some(code => dwgNum.startsWith(code) || dwgNum.includes(code));
    }

    return false;
  });

  const filteredDrawings = projectDrawings.filter(d => {
    if (selectedDiscipline !== 'ALL') {
      const disc = d.disciplineCode || d.discipline;
      if (disc && disc !== selectedDiscipline) return false;
    }
    if (selectedLevel !== 'ALL' && d.level !== selectedLevel) return false;
    if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const codeMatch = (d.drawingCode || d.drawingNumber || '').toLowerCase().includes(q);
      const titleMatch = (d.drawingTitle || '').toLowerCase().includes(q);
      return codeMatch || titleMatch;
    }
    return true;
  });

  // Summary counts based on active project drawings
  const totalCount = projectDrawings.length;
  const approvedCount = projectDrawings.filter(d => ['Approved', 'Issued for Construction'].includes(d.status)).length;
  const reviewCount = projectDrawings.filter(d => ['Under Review', 'Submitted'].includes(d.status)).length;
  const coordinationCount = projectDrawings.filter(d => d.coordinationFlag || d.status === 'Coordination Required').length;

  // Derives client account based drawing code (e.g. Green Valley Residential -> GVR instead of CL-12)
  const displayProjectCode = deriveProjectCodeFromName(
    projectData?.projectName || projectData?.clientName,
    projectData?.projectCode || selectedProjectId
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-mono font-extrabold">
                {displayProjectCode}
              </span>
              <h1 className="text-xl font-extrabold text-brand-charcoal dark:text-white truncate">
                {projectData?.projectName || 'Project Drawing Register'}
              </h1>
            </div>
            <p className="text-xs text-brand-gray mt-1 flex items-center gap-2">
              <span>Company Account: <strong>{projectData?.company && projectData.company !== 'No Company' ? projectData.company : (projectData?.clientName || projectData?.projectName || 'N/A')}</strong></span>
              {projectData?.contactPerson && projectData.contactPerson !== 'N/A' && (
                <>
                  <span>•</span>
                  <span>Representative: <strong>{projectData.contactPerson}</strong></span>
                </>
              )}
              <span>•</span>
              <span>Type: <strong>{projectData?.projectType || 'Commercial'}</strong></span>
            </p>
          </div>
        </div>

        {/* Read-Only Client Account Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-brand-charcoal dark:text-white shadow-xs">
            <Building2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{(projectData?.company && projectData.company !== 'No Company') ? projectData.company : (projectData?.clientName || projectData?.projectName || 'Company Account')}</span>
            <span className="ml-1 text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {displayProjectCode}
            </span>
          </div>

          <button
            onClick={() => setIsAddDisciplineModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-extrabold text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Discipline Folder
          </button>

          <button
            onClick={handleOpenMasterModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Configure Drawing Types Master"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Drawing Types Master
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-gray uppercase tracking-wider">Total Drawings</p>
            <p className="text-xl font-extrabold text-brand-charcoal dark:text-white">{totalCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-gray uppercase tracking-wider">Approved / IFC</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-gray uppercase tracking-wider">Under Review</p>
            <p className="text-xl font-extrabold text-amber-500">{reviewCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-gray uppercase tracking-wider">Coordination Flag</p>
            <p className="text-xl font-extrabold text-rose-500">{coordinationCount}</p>
          </div>
        </div>
      </div>

      {/* Discipline Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        <button
          onClick={() => setSelectedDiscipline('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedDiscipline === 'ALL'
            ? 'bg-brand-primary text-white shadow-sm font-extrabold'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
        >
          <Layers className="w-3.5 h-3.5" /> All Folders ({projectDrawings.length})
        </button>

        {projectData?.disciplines && projectData.disciplines.length > 0 ? (
          projectData.disciplines.map((d: any) => {
            const code = d.code;
            const meta = DISCIPLINE_CATALOG[code as DisciplineCode] || { name: code };
            const isActive = selectedDiscipline === code;
            const folderCode = d.folderCode || `${displayProjectCode}-${code}`;

            return (
              <div
                key={code}
                onClick={() => setSelectedDiscipline(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-extrabold'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500'
                }`}
              >
                <Folder className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'}`} />
                <span>{code} — {meta.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {folderCode}
                </span>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const activePId = selectedProjectId || (projects.length > 0 ? projects[0].id : null);
                    if (!activePId) return;
                    if (confirm(`Are you sure you want to remove discipline folder ${folderCode} and its drawings?`)) {
                      try {
                        const res = await api.delete(`/projects/${activePId}/disciplines/${code}`);
                        if (res.data?.success) {
                          if (selectedDiscipline === code) setSelectedDiscipline('ALL');
                          await fetchProjectDetails(activePId);
                          await fetchProjectDrawings(activePId);
                          return;
                        }
                      } catch (err: any) {
                        console.warn('API delete discipline fallback to local state:', err);
                      }
                      // Fallback local update
                      const remaining = (projectData?.disciplines || []).filter((item: any) => item.code !== code);
                      saveStoredDisciplines(activePId, remaining);
                      setProjectData((prev: any) => ({
                        ...prev,
                        disciplines: remaining
                      }));
                      if (selectedDiscipline === code) setSelectedDiscipline('ALL');
                    }
                  }}
                  className={`ml-1 p-0.5 rounded-md transition-colors ${
                    isActive
                      ? 'text-white/80 hover:text-white hover:bg-white/20'
                      : 'text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                  title={`Delete folder ${folderCode}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        ) : (
          <span className="text-xs text-slate-400 font-medium italic px-2">
            No discipline folders created yet. Click "+ Add Discipline Folder" to create.
          </span>
        )}

        <button
          onClick={() => setIsAddDisciplineModalOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border border-dashed border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Discipline Folder</span>
        </button>
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Drawing Code or Title..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-brand-charcoal dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-brand-gray font-semibold">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-charcoal dark:text-white cursor-pointer"
            >
              <option value="ALL">All Levels</option>
              <option value="GF">GF (Ground Floor)</option>
              <option value="01">01 (First Floor)</option>
              <option value="02">02 (Second Floor)</option>
              <option value="03">03 (Third Floor)</option>
              <option value="04">04 (Fourth Floor)</option>
              <option value="TR">TR (Terrace)</option>
              <option value="SITE">SITE</option>
              <option value="B1">B1 (Basement)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-brand-gray font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-charcoal dark:text-white cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Issued for Construction">Issued for Construction</option>
              <option value="Coordination Required">Coordination Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Drawing Register Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-brand-gray uppercase tracking-wider">Loading Master Drawing Register...</p>
          </div>
        ) : filteredDrawings.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-brand-charcoal dark:text-white">No Drawings Found</p>
            <p className="text-xs text-brand-gray mt-1">Try adjusting your discipline or level filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-brand-gray uppercase tracking-wider">
                  <th className="p-4">Permanent Drawing Code</th>
                  <th className="p-4">Drawing Title</th>
                  <th className="p-4">Disc</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Rev</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Document Sheet</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredDrawings.map((d) => {
                  const isCoord = d.coordinationFlag || d.status === 'Coordination Required';
                  const docUrl = d.fileUrl || d.url;
                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${isCoord ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}
                    >
                      {/* Code */}
                      <td className="p-4 font-mono font-extrabold text-brand-charcoal dark:text-white">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-primary dark:text-brand-gold">
                          <FileCode className="w-3.5 h-3.5 text-brand-primary" />
                          {d.drawingCode || d.drawingNumber}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="p-4 font-bold text-brand-charcoal dark:text-white max-w-xs">
                        <p className="truncate">{d.drawingTitle}</p>
                        {isCoord && (
                          <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Architecture base revised — Coordination required
                          </p>
                        )}
                      </td>

                      {/* Disc */}
                      <td className="p-4 font-bold text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                          {d.disciplineCode || d.discipline}
                        </span>
                      </td>

                      {/* Level */}
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {d.level}
                      </td>

                      {/* Rev */}
                      <td className="p-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {d.currentRevision || d.revisionNumber || 'R00'}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isCoord
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                            : d.status === 'Approved' || d.status === 'Issued for Construction'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : d.status === 'Under Review'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-brand-gray border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          {d.status}
                        </span>
                      </td>

                      {/* Document Sheet Column */}
                      <td className="p-4">
                        {docUrl ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewDoc(d)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                              title="Preview document in-app"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Document
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenRevisionModal(d)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs font-bold cursor-pointer"
                            title="Attach drawing sheet file"
                          >
                            <Upload className="w-3.5 h-3.5" /> Attach Sheet
                          </button>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDrawing(d)}
                            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-brand-primary bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="View Revision History & Details"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRevisionModal(d)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> New Rev
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DRAWING DETAIL & REVISION HISTORY DRAWER / MODAL */}
      {selectedDrawing && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-wider">
                  {selectedDrawing.drawingCode}
                </span>
                <h2 className="text-base font-extrabold text-brand-charcoal dark:text-white">
                  {selectedDrawing.drawingTitle}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDrawing(null)}
                className="p-1.5 rounded-xl text-brand-gray hover:text-brand-charcoal bg-transparent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Cloudinary Document Sheet View Banner */}
              {(selectedDrawing.fileUrl || selectedDrawing.url) && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h4 className="text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Attached Drawing Sheet
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                        {selectedDrawing.originalFileName || selectedDrawing.drawingNumber || 'Cloudinary Sheet'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewDoc(selectedDrawing)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Document
                  </button>
                </div>
              )}

              {/* Coordination Alert if Flagged */}
              {(selectedDrawing.coordinationFlag || selectedDrawing.status === 'Coordination Required') && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                      Coordination Review Flag Active
                    </h4>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                      {selectedDrawing.coordinationNote || 'An architectural base drawing on this level was revised. Please re-coordinate this sheet before issuing for construction.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Drawing Properties Summary */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-brand-gray text-[10px] uppercase">Level</p>
                  <p className="font-extrabold text-brand-charcoal dark:text-white font-mono">{selectedDrawing.level}</p>
                </div>
                <div>
                  <p className="text-brand-gray text-[10px] uppercase">Discipline</p>
                  <p className="font-extrabold text-brand-charcoal dark:text-white">
                    {selectedDrawing.disciplineCode || selectedDrawing.discipline || 'AR'}
                    {DISCIPLINE_CATALOG[(selectedDrawing.disciplineCode || selectedDrawing.discipline || 'AR') as DisciplineCode]?.name
                      ? ` — ${DISCIPLINE_CATALOG[(selectedDrawing.disciplineCode || selectedDrawing.discipline || 'AR') as DisciplineCode].name}`
                      : ''}
                  </p>
                </div>
                <div>
                  <p className="text-brand-gray text-[10px] uppercase">Current Rev</p>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{selectedDrawing.currentRevision || 'R00'}</p>
                </div>
              </div>

              {/* Revision History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-brand-charcoal dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-primary" /> Revision History & Stored Files
                  </h3>
                  <button
                    onClick={() => handleOpenRevisionModal(selectedDrawing)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload New Rev
                  </button>
                </div>

                {(!selectedDrawing.revisions || selectedDrawing.revisions.length === 0) ? (
                  <p className="text-xs text-brand-gray py-4 text-center">No revisions recorded yet.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedDrawing.revisions.map((rev: any) => (
                      <div
                        key={rev.id || rev.revisionCode}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold border border-emerald-500/20">
                            {rev.revisionCode}
                          </span>
                          <span className="text-[10px] text-brand-gray">{rev.revisionDate}</span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 italic">{rev.remarks || 'No remarks recorded.'}</p>

                        <div className="flex items-center justify-between text-[11px] text-brand-gray pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span>Prepared: <strong>{rev.preparedBy || '—'}</strong></span>
                          <span>Checked: <strong>{rev.checkedBy || '—'}</strong></span>
                          <span>Approved: <strong>{rev.approvedBy || '—'}</strong></span>
                        </div>

                        {/* Revision Files */}
                        {rev.files && rev.files.length > 0 && (
                          <div className="pt-2 space-y-1">
                            {rev.files.map((file: any) => (
                              <div
                                key={file.id || file.storedFileName}
                                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                              >
                                <div className="truncate max-w-xs">
                                  <p className="font-bold text-brand-charcoal dark:text-white font-mono text-[11px] truncate">
                                    {file.storedFileName}
                                  </p>
                                  <p className="text-[10px] text-brand-gray truncate">
                                    Original: {file.originalFileName}
                                  </p>
                                </div>
                                <a
                                  href={file.storagePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-primary text-white text-[10px] font-bold shadow-xs hover:bg-brand-primary/90 transition-colors"
                                >
                                  <Download className="w-3 h-3" /> Download
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* NEW REVISION UPLOAD MODAL */}
      {isRevisionModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/20">
              <div>
                <h2 className="text-base font-extrabold text-brand-charcoal dark:text-white">Upload New Revision</h2>
                <p className="text-[11px] text-brand-gray font-mono">{selectedDrawing?.existingConceptCode || selectedDrawing?.drawingCode}</p>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1.5 rounded-xl text-brand-gray hover:text-brand-charcoal bg-transparent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Code
                </label>
                <input
                  type="text"
                  value={revCode}
                  onChange={(e) => setRevCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                  placeholder="e.g. R01"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Prepared By</label>
                  <input
                    type="text"
                    value={revPreparedBy}
                    onChange={(e) => setRevPreparedBy(e.target.value)}
                    placeholder="e.g. Architect"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Checked By</label>
                  <input
                    type="text"
                    value={revCheckedBy}
                    onChange={(e) => setRevCheckedBy(e.target.value)}
                    placeholder="e.g. Lead"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Approved By</label>
                  <input
                    type="text"
                    value={revApprovedBy}
                    onChange={(e) => setRevApprovedBy(e.target.value)}
                    placeholder="e.g. Director"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Revision Status</label>
                <select
                  value={revStatus}
                  onChange={(e) => setRevStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none font-bold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Revision Required">Revision Required</option>
                  <option value="Approved">Approved</option>
                  <option value="Issued for Construction">Issued for Construction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Upload Revision File</label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-center relative cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="py-2">
                      <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-1" />
                      <p className="text-[11px] font-bold text-brand-gray">Uploading & Renaming File...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="py-1">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{uploadedFile.name}</p>
                      <p className="text-[10px] text-brand-gray mt-0.5">
                        Will be stored as: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{selectedDrawing?.existingConceptCode || selectedDrawing?.drawingCode}_{revCode}.pdf</span>
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Upload className="w-6 h-6 text-brand-primary mx-auto mb-1" />
                      <p className="font-bold text-slate-700 dark:text-slate-200">Click or Drag & Drop File</p>
                      <p className="text-[10px] text-brand-gray">PDF, DWG, DXF, RVT, JPG, PNG, DOCX, XLSX</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Revision Remarks</label>
                <textarea
                  value={revRemarks}
                  onChange={(e) => setRevRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none"
                  placeholder="e.g. Base plan wall thickness updated as per client review."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRevision}
                  disabled={revSubmitting || uploading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-colors"
                >
                  {revSubmitting ? 'Saving Revision...' : 'Save & Publish Revision'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DRAWING TYPES MASTER ADMIN MODAL */}
      {isMasterModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-primary" />
                <h2 className="text-base font-extrabold text-brand-charcoal dark:text-white">
                  Drawing Types Master Directory
                </h2>
              </div>
              <button
                onClick={() => setIsMasterModalOpen(false)}
                className="p-1.5 rounded-xl text-brand-gray hover:text-brand-charcoal bg-transparent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-brand-gray">
                Configure standard drawing types, codes, and floor rules for each discipline. Per-floor drawing types automatically generate one sheet per project floor level.
              </p>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-brand-gray uppercase text-[10px]">
                      <th className="p-3">Disc</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Level Rule</th>
                      <th className="p-3">Per Floor</th>
                      <th className="p-3">Purpose Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {drawingTypes.map((dt) => (
                      <tr key={dt.id || `${dt.disciplineCode}-${dt.code}`}>
                        <td className="p-3 font-mono font-bold">{dt.disciplineCode}</td>
                        <td className="p-3 font-mono font-extrabold text-brand-primary">{dt.code}</td>
                        <td className="p-3 font-bold">{dt.title}</td>
                        <td className="p-3">{dt.levelType}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dt.isPerFloor ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-100 text-slate-600'}`}>
                            {dt.isPerFloor ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-brand-gray max-w-xs truncate">{dt.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* MANUALLY CREATE DISCIPLINE FOLDER MODAL */}
      {isAddDisciplineModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2.5">
                <Folder className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-base font-extrabold text-brand-charcoal dark:text-white">
                    Create Discipline Folder
                  </h2>
                  <p className="text-[11px] text-brand-gray font-mono">
                    Project: {projectData?.projectCode || 'PROJECT'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDisciplineModalOpen(false)}
                className="p-1.5 rounded-xl text-brand-gray hover:text-brand-charcoal bg-transparent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Discipline to Create Folder
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {Object.entries(DISCIPLINE_CATALOG).map(([code, meta]) => {
                    const existingCodes = (projectData?.disciplines || []).map((d: any) => d.code);
                    const isAlreadyCreated = existingCodes.includes(code);
                    const isSelected = newDisciplineCode === code;

                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={isAlreadyCreated}
                        onClick={() => setNewDisciplineCode(code)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isAlreadyCreated
                          ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                          }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="font-mono">{code}</span>
                          {isAlreadyCreated && <span className="text-[9px] uppercase font-bold text-slate-400">Created</span>}
                        </div>
                        <span className="text-[11px] font-semibold mt-1 truncate">{meta.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Folder Code Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 font-mono">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Folder Code Preview</p>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {(() => {
                    const rawId = selectedProjectId || projectData?.id || projectData?.projectCode || 'CL12';
                    const cleanClientTag = rawId
                      .replace(/[^a-zA-Z0-9]/g, '')
                      .replace(/^LEAD/i, 'CL')
                      .replace(/^LD/i, 'CL')
                      .toUpperCase();
                    const clientTag = cleanClientTag.startsWith('CL') ? cleanClientTag : `CL${cleanClientTag}`;
                    return `${clientTag}-0001-${newDisciplineCode}`;
                  })()}
                </p>
                <p className="text-[10px] text-slate-500 font-sans mt-1">
                  Creating this folder will initialize master drawing deliverables specifically for <strong>{DISCIPLINE_CATALOG[newDisciplineCode as DisciplineCode]?.name || newDisciplineCode}</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDisciplineModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newDisciplineCode) return;
                    setAddingDiscipline(true);
                    const activePId = selectedProjectId || (projects.length > 0 ? projects[0].id : DEFAULT_PROJECT.id);
                    const rawId = activePId || projectData?.id || projectData?.projectCode || 'CL12';
                    const cleanClientTag = rawId
                      .replace(/[^a-zA-Z0-9]/g, '')
                      .replace(/^LEAD/i, 'CL')
                      .replace(/^LD/i, 'CL')
                      .toUpperCase();
                    const clientTag = cleanClientTag.startsWith('CL') ? cleanClientTag : `CL${cleanClientTag}`;
                    const folderCode = `${clientTag}-0001-${newDisciplineCode}`;

                    try {
                      const res = await api.post(`/projects/${activePId}/disciplines`, {
                        disciplineCode: newDisciplineCode
                      });
                      if (res.data?.success) {
                        setIsAddDisciplineModalOpen(false);
                        setSelectedDiscipline(newDisciplineCode);
                        await fetchProjectDetails(activePId);
                        await fetchProjectDrawings(activePId);
                        return;
                      }
                    } catch (err: any) {
                      console.warn('API discipline creation fallback to local state:', err);
                    }

                    // Fallback local update if backend server isn't running or mock mode active
                    const newDiscObj = { code: newDisciplineCode, folderCode };
                    const existingDiscs = projectData?.disciplines || [];
                    let updatedDiscs = existingDiscs;
                    if (!existingDiscs.some((d: any) => d.code === newDisciplineCode)) {
                      updatedDiscs = [...existingDiscs, newDiscObj];
                    }
                    saveStoredDisciplines(activePId, updatedDiscs);
                    setProjectData((prev: any) => ({
                      ...prev,
                      disciplines: updatedDiscs
                    }));
                    setIsAddDisciplineModalOpen(false);
                    setSelectedDiscipline(newDisciplineCode);
                    setAddingDiscipline(false);
                  }}
                  disabled={addingDiscipline}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {addingDiscipline ? 'Creating Folder...' : 'Create Discipline Folder'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* QUICK DOCUMENT PREVIEW MODAL */}
      {previewDoc && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-600/10 text-blue-600 font-mono font-extrabold text-xs border border-blue-600/20">
                  {previewDoc.drawingCode || previewDoc.drawingNumber}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{previewDoc.drawingTitle}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Revision: {previewDoc.currentRevision || previewDoc.revisionNumber || 'R00'} | Discipline: {previewDoc.disciplineCode || previewDoc.discipline}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl || previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Open in Cloudinary
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-950/40">
              {(() => {
                const rawUrl = previewDoc.fileUrl || previewDoc.url || '';
                const isImage = /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(rawUrl);

                if (isImage) {
                  return (
                    <img
                      src={rawUrl}
                      alt={previewDoc.drawingTitle}
                      className="max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-slate-700"
                    />
                  );
                }

                if (pdfLoading || !blobPdfUrl) {
                  return (
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-xs font-bold text-slate-300">Loading document preview...</p>
                    </div>
                  );
                }

                return (
                  <iframe
                    src={blobPdfUrl}
                    className="w-full h-[70vh] rounded-2xl border border-slate-700 bg-white"
                    title={previewDoc.drawingTitle}
                    allow="fullscreen"
                  />
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
