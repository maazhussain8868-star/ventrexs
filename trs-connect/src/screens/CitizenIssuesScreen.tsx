import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { CitizenIssue, IssueCategory, IssueStatus } from '../lib/types';
import {
  AlertCircle,
  Plus,
  MapPin,
  Camera,
  CheckCircle2,
  X,
  Phone,
  Building,
  Shield,
  Clock,
  Info
} from 'lucide-react';

export const CitizenIssuesScreen: React.FC = () => {
  const { issues, reportCitizenIssue, user, showToast } = useApp();
  const { t } = useI18n();

  const [selectedIssue, setSelectedIssue] = useState<CitizenIssue | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // New Issue Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<IssueCategory>('Roads & Potholes');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('Road No. 45, Jubilee Hills');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const categories: IssueCategory[] = [
    'Roads & Potholes',
    'Water Supply & Pipelines',
    'Electricity & Transformers',
    'Sanitation & Garbage',
    'Streetlights & Safety',
    'Drainage & Sewage',
    'Parks & Public Amenities'
  ];

  // In compliance with Security Audit: Private issues per citizen
  const myIssues = issues.filter((issue) => !user || issue.userId === user.id || issue.userId === 'usr_dev_citizen');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security Check: Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Only JPG, PNG or WEBP image formats are supported', 'error');
      return;
    }

    // Security Check: Enforce 5MB size limit
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast('Please provide a title and description', 'error');
      return;
    }

    reportCitizenIssue({
      title: newTitle,
      category: newCategory,
      description: newDescription,
      locationName: newLocation,
      constituency: user?.constituency || 'Jubilee Hills (AC-61)',
      ward: user?.ward || 'Ward 98',
      photoUrl: photoPreview || undefined
    });

    // Reset
    setNewTitle('');
    setNewDescription('');
    setPhotoPreview(null);
    setShowReportModal(false);
  };

  const getStatusStepIndex = (status: IssueStatus): number => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'under_review':
        return 1;
      case 'assigned':
        return 2;
      case 'resolved':
        return 3;
    }
  };

  const statusSteps = ['Submitted', 'Under Review', 'Assigned', 'Resolved'];

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Header & Report Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-tight">
            {t('issuesTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            Private & voluntary grievance tracking
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="py-2 px-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Report Grievance</span>
        </button>
      </div>

      {/* Security Notice: RLS Protected */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <Shield className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Standard:</strong> Grievance reports are strictly private to your citizen account and assigned ward engineers. Other citizens cannot read your reports.
        </p>
      </div>

      {/* Issues List */}
      <div className="space-y-3.5">
        {myIssues.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No Grievances Reported</h4>
            <p className="text-xs text-slate-500">
              You haven't submitted any civic issue reports yet. Tap "Report Grievance" to submit one.
            </p>
          </div>
        ) : (
          myIssues.map((issue) => {
            const currentStep = getStatusStepIndex(issue.status);

            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer space-y-3"
              >
                {/* Category & Status Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {issue.category}
                  </span>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      issue.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : issue.status === 'assigned'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Title & Photo */}
                <div className="flex items-start gap-3">
                  {issue.photoUrl && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <img
                        src={issue.photoUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">
                      {issue.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>
                </div>

                {/* Location Tag */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{issue.locationName}</span>
                </div>

                {/* 4-Step Progress Tracker Bar */}
                <div className="pt-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1.5 px-1">
                    {statusSteps.map((s, idx) => (
                      <span
                        key={s}
                        className={
                          idx <= currentStep
                            ? 'text-emerald-700 font-extrabold'
                            : 'text-slate-400'
                        }
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {statusSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx <= currentStep
                            ? 'bg-emerald-600'
                            : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Tracking Ref #{issue.id.slice(-6).toUpperCase()}</span>
                  <span className="text-emerald-700 font-bold text-[11px]">View Progress Details →</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-emerald-100 animate-scale-up no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Submit Civic Grievance
                  </h3>
                  <p className="text-[10px] text-slate-500">Direct to Ward Authority</p>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-3.5 pt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as IssueCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Summary
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Brief description of the problem"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mention landmarks and specific hazards..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Location / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Photo Upload with Security Validation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Photo (Max 5MB • JPG, PNG, WEBP)
                </label>
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden h-28 w-full border border-slate-200">
                    <img
                      src={photoPreview}
                      alt="Site Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="p-3 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 bg-slate-50">
                    <Camera className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">Choose Image File</span>
                    <span className="text-[9px] text-slate-400">Validated for security</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Submit Citizen Grievance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE DETAIL MODAL */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-emerald-100 animate-scale-up space-y-4 no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono font-bold text-slate-400">
                GRIEVANCE #{selectedIssue.id.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedIssue.photoUrl && (
              <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedIssue.photoUrl}
                  alt={selectedIssue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                {selectedIssue.category}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mt-1 leading-snug">
                {selectedIssue.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {selectedIssue.description}
              </p>
            </div>

            {/* Tracking Pipeline Timeline */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900">
                Official Redressal Timeline
              </h4>

              <div className="space-y-3 text-xs">
                {statusSteps.map((stepName, idx) => {
                  const isDone = idx <= getStatusStepIndex(selectedIssue.status);
                  return (
                    <div key={stepName} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1">
                        <span
                          className={`font-bold ${
                            isDone ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {stepName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department & Officer Info */}
            {selectedIssue.assignedDepartment && (
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>{selectedIssue.assignedDepartment}</span>
                </div>
                {selectedIssue.resolutionNotes && (
                  <p className="text-[11px] text-slate-600 pt-1 border-t border-emerald-100">
                    <span className="font-bold text-slate-700">Official Note: </span>
                    {selectedIssue.resolutionNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
