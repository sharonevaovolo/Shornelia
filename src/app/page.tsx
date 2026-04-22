'use client';

import { useState, useRef } from 'react';

// Animated Circular Progress Component
const CircularProgress = ({ score, size = 60, strokeWidth = 6 }: { score: string, size?: number, strokeWidth?: number }) => {
  const percentage = parseFloat(score) || 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  let color = '#ef4444'; // red
  if (percentage >= 70) color = '#10b981'; // green
  else if (percentage >= 50) color = '#f59e0b'; // yellow

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <span className="absolute text-sm font-bold">{percentage}%</span>
    </div>
  );
};

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  // Helper function to parse candidate data from text field
  const parseCandidateData = (item: any) => {
    try {
      if (item && item.text) {
        // Extract JSON from markdown code block
        const jsonText = item.text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonText);
      }
      return item;
    } catch (e) {
      console.error('Failed to parse candidate data', e);
      return item;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      setExtractedText('');
      setError('');
      setMetadata(null);
      setAiAnalysis(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      setExtractedText('');
      setError('');
      setMetadata(null);
      setAiAnalysis(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      formData.append('count', files.length.toString());

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Échec de l\'analyse des CV');
      }

      setExtractedText(result.extractedText || result.text);
      setMetadata(result.metadata);
      setAiAnalysis(result.aiAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const clearAll = () => {
    setFiles([]);
    setExtractedText('');
    setMetadata(null);
    setAiAnalysis(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate statistics from candidates
  const calculateStats = (candidates: any[]) => {
    const validCandidates = candidates.map(parseCandidateData).filter(c => c && c.score_global);

    const avgScore = validCandidates.length > 0
      ? (validCandidates.reduce((sum: number, c: any) => sum + parseFloat(c.score_global), 0) / validCandidates.length).toFixed(1)
      : 0;

    const maxScore = validCandidates.length > 0
      ? Math.max(...validCandidates.map((c: any) => parseFloat(c.score_global)))
      : 0;

    const minScore = validCandidates.length > 0
      ? Math.min(...validCandidates.map((c: any) => parseFloat(c.score_global)))
      : 0;

    const above60 = validCandidates.filter((c: any) => parseFloat(c.score_global) >= 60).length;

    return {
      total: candidates.length,
      avgScore,
      maxScore,
      minScore,
      above60
    };
  };

  // Get score color class
  const getScoreColor = (score: string) => {
    const num = parseFloat(score);
    if (num >= 70) return 'bg-green-100 text-green-700 border-green-300';
    if (num >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  // Parse all candidates
  const getAllCandidates = () => {
    if (!aiAnalysis) return [];

    if (Array.isArray(aiAnalysis)) {
      return aiAnalysis.map(parseCandidateData).filter(c => c);
    }

    const candidate = parseCandidateData(aiAnalysis);
    return candidate ? [candidate] : [];
  };


  // Export as CSV
  const exportAsCSV = () => {
    setExportLoading('csv');
    try {
      const candidates = getAllCandidates();

      const headers = [
        'Nom', 'Poste actuel', 'Niveau étude', 'Expérience', 'Entreprises précédentes',
        'Score compétences', 'Score expérience', 'Score diplôme', 'Score mots-clés', 'Score global',
        'Décision', 'Justification', 'Compétences', 'Langues', 'Secteurs activité'
      ];

      const rows = candidates.map((c: any) => [
        `"${c.nom || ''}"`,
        `"${c.poste_actuel || ''}"`,
        `"${c.niveau_etude || ''}"`,
        c.experience || 0,
        c.nombre_entreprises_precedentes || 0,
        `"${c.score_competences || ''}"`,
        `"${c.score_experience || ''}"`,
        `"${c.score_diplome || ''}"`,
        `"${c.score_mots_cles || ''}"`,
        `"${c.score_global || ''}"`,
        `"${c.decision || ''}"`,
        `"${(c.justification || '').replace(/"/g, "'")}"`,
        `"${(c.competences_techniques || []).join('; ')}"`,
        `"${(c.langues_parlees || []).map((l: any) => typeof l === 'string' ? l : `${l.langue} (${l.niveau})`).join('; ')}"`,
        `"${(c.secteur_activite || []).join('; ')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analyse-cv-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } catch (err) {
      console.error('CSV export failed', err);
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-12">
      <div className={aiAnalysis ? "max-w-6xl mx-auto" : "max-w-3xl mx-auto"}>
        {/* Header - Only show when no results */}
        {!aiAnalysis && (
          <div className="text-center mb-12">
            <div className="text-6xl mb-4 animate-bounce">📋✨</div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Tri de CV
            </h1>
            <p className="text-lg text-gray-600">
              Faculté des sciences juridiques, économiques et sociales 🎓 | Analyse par Intelligence Artificielle
            </p>
          </div>
        )}

        {/* Upload Card - Only show when no results */}
        {!aiAnalysis && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8 mb-6 border border-white/50">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-2xl p-6 md:p-10 text-center transition-all duration-300 mb-6 ${
              isDragging
                ? 'border-pink-400 bg-pink-50 scale-105'
                : 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="text-5xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Glissez votre CV ici
              </p>
               <p className="text-sm text-gray-500">
                 ou cliquez pour sélectionner un ou plusieurs CV au format PDF
               </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-col gap-3 mb-4">
                {files.map((file, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-800 break-all">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} Ko</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      ✖️
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Analyse en cours...
                    </span>
                  ) : (
                    `Analyser ${files.length} CV ✨`
                  )}
                </button>
                <button
                  onClick={clearAll}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Tout effacer
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <span className="mr-2">❌</span> {error}
            </div>
          )}
        </div>
        )}

        {/* Success Card */}
        {metadata && !aiAnalysis && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl animate-pulse">✅</span>
              <div>
                <h3 className="font-bold text-green-800 text-xl">Analyse réussie !</h3>
                {metadata.usedOCR && <p className="text-sm text-green-600">Analyse OCR activée</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-gray-500">Pages</p>
                <p className="text-xl font-bold text-green-700">{metadata.pages}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-gray-500">Caractères</p>
                <p className="text-xl font-bold text-green-700">{extractedText.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Dashboard */}
        {aiAnalysis && (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl animate-pulse">🤖</span>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Résultats de l'Analyse IA
                    </h1>
                    <p className="text-gray-500">Dashboard des candidats analysés</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={exportAsCSV}
                    disabled={!!exportLoading}
                    className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {exportLoading === 'csv' ? '⏳ Export...' : '📊 CSV'}
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-5 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                  >
                    🔄 Nouvelle analyse
                  </button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(() => {
                  const stats = calculateStats(getAllCandidates());
                  return (
                    <>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                        <p className="text-sm text-purple-600 font-medium">Total CV</p>
                        <p className="text-3xl font-bold text-purple-800">{stats.total}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                        <p className="text-sm text-green-600 font-medium">Score Moyen</p>
                        <p className="text-3xl font-bold text-green-800">{stats.avgScore}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200">
                        <p className="text-sm text-emerald-600 font-medium">Score Max</p>
                        <p className="text-3xl font-bold text-emerald-800">{stats.maxScore}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                        <p className="text-sm text-orange-600 font-medium">Score Min</p>
                        <p className="text-3xl font-bold text-orange-800">{stats.minScore}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200">
                        <p className="text-sm text-indigo-600 font-medium">≥ 60%</p>
                        <p className="text-3xl font-bold text-indigo-800">{stats.above60}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Candidates Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getAllCandidates()
                .sort((a: any, b: any) => parseFloat(b.score_global) - parseFloat(a.score_global))
                .map((candidate: any, index: number) => {
                  const score = parseFloat(candidate.score_global) || 0;
                  let cardClass = 'bg-white/90 border-white/50';

                  if (score >= 60) {
                    cardClass = 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
                  } else if (score < 50) {
                    cardClass = 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200';
                  }

                  return (
                  <div
                    key={index}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`${cardClass} backdrop-blur-lg rounded-3xl shadow-xl p-6 border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                  >
                    {/* Candidate Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{candidate.nom || 'Non spécifié'}</h3>
                        <p className="text-sm text-purple-600 font-medium">{candidate.poste_actuel || 'Poste non spécifié'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(candidate.score_global)}`}>
                        {candidate.score_global || 'N/A'}
                      </span>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="bg-purple-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-500">Compétences</p>
                        <p className="font-bold text-purple-700">{candidate.score_competences || '-'}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-500">Expérience</p>
                        <p className="font-bold text-green-700">{candidate.score_experience || '-'}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-500">Diplôme</p>
                        <p className="font-bold text-blue-700">{candidate.score_diplome || '-'}</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-500">Mots-clés</p>
                        <p className="font-bold text-orange-700">{candidate.score_mots_cles || '-'}</p>
                      </div>
                    </div>

                    {/* Info Lines */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">🎓 Niveau d'étude</span>
                        <span className="font-medium text-gray-800">{candidate.niveau_etude || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">⏱️ Expérience</span>
                        <span className="font-medium text-gray-800">{candidate.experience || 0} ans</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">🏢 Entreprises</span>
                        <span className="font-medium text-gray-800">{candidate.nombre_entreprises_precedentes || 0}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">🛠️ Compétences techniques</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(candidate.competences_techniques) && candidate.competences_techniques.slice(0, 5).map((skill: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                            {skill}
                          </span>
                        ))}
                        {Array.isArray(candidate.competences_techniques) && candidate.competences_techniques.length > 5 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs">
                            +{candidate.competences_techniques.length - 5}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">🌍 Langues</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(candidate.langues_parlees) && candidate.langues_parlees.slice(0, 4).map((lang: any, i: number) => {
                          const langName = typeof lang === 'string' ? lang : lang.langue || lang;
                          const level = typeof lang === 'object' && lang.niveau ? ` (${lang.niveau})` : '';
                          return (
                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                              {langName}{level}
                            </span>
                          );
                        })}
                        {Array.isArray(candidate.langues_parlees) && candidate.langues_parlees.length > 4 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs">
                            +{candidate.langues_parlees.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Activity Sectors */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">🏭 Secteurs d'activité</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(candidate.secteur_activite) && candidate.secteur_activite.map((sector: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs">
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Decision */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
                      <div className="mb-1">
                        <span className="font-bold text-purple-800">{candidate.decision || 'En attente'}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{candidate.justification || 'Aucune justification disponible'}</p>
                    </div>
                  </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Extracted Text */}
        {extractedText && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">📝 Texte extrait</h2>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
              >
                Copier 📋
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-2xl max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">{extractedText}</pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Fait avec 💜 à la Faculté des sciences juridiques, économiques et sociales</p>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {selectedCandidate.nom || 'Non spécifié'}
                </h2>
                <p className="text-gray-500">{selectedCandidate.poste_actuel || 'Poste non spécifié'}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Animated Score Charts */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">📊 Scores détaillés</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <CircularProgress score={selectedCandidate.score_global} size={60} />
                    <p className="text-xs text-gray-500 mt-1">Global</p>
                  </div>
                  <div className="text-center">
                    <CircularProgress score={selectedCandidate.score_competences} size={60} />
                    <p className="text-xs text-gray-500 mt-1">Compétences</p>
                  </div>
                  <div className="text-center">
                    <CircularProgress score={selectedCandidate.score_experience} size={60} />
                    <p className="text-xs text-gray-500 mt-1">Expérience</p>
                  </div>
                  <div className="text-center">
                    <CircularProgress score={selectedCandidate.score_diplome} size={60} />
                    <p className="text-xs text-gray-500 mt-1">Diplôme</p>
                  </div>
                  <div className="text-center">
                    <CircularProgress score={selectedCandidate.score_mots_cles} size={60} />
                    <p className="text-xs text-gray-500 mt-1">Mots-clés</p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600">🎓 Niveau d'étude</p>
                  <p className="font-bold text-purple-800">{selectedCandidate.niveau_etude || '-'}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600">⏱️ Expérience</p>
                  <p className="font-bold text-green-800">{selectedCandidate.experience || 0} ans</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600">🏢 Entreprises précédentes</p>
                  <p className="font-bold text-blue-800">{selectedCandidate.nombre_entreprises_precedentes || 0}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-sm text-orange-600">⚖️ Décision</p>
                  <p className="font-bold text-orange-800">{selectedCandidate.decision || 'En attente'}</p>
                </div>
              </div>

              {/* Full Competences */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">🛠️ Toutes les compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedCandidate.competences_techniques) &&
                    selectedCandidate.competences_techniques.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm">
                        {skill}
                      </span>
                    ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">🌍 Langues</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedCandidate.langues_parlees) &&
                    selectedCandidate.langues_parlees.map((lang: any, i: number) => {
                      const langName = typeof lang === 'string' ? lang : lang.langue || lang;
                      const level = typeof lang === 'object' && lang.niveau ? ` (${lang.niveau})` : '';
                      return (
                        <span key={i} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm">
                          {langName}{level}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* Activity Sectors */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">🏭 Secteurs d'activité</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedCandidate.secteur_activite) &&
                    selectedCandidate.secteur_activite.map((sector: string, i: number) => (
                      <span key={i} className="px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm">
                        {sector}
                      </span>
                    ))}
                </div>
              </div>

              {/* Justification */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <h3 className="font-bold text-purple-800 mb-2">📝 Justification</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedCandidate.justification || 'Aucune justification disponible'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
