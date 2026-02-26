import React, { useState } from 'react';
import { talkingPoints, TalkingPoint } from './lib/talkingPoints';
import { highPriorityRecipients, Recipient } from './lib/highPriorityRecipients';
import { countWords, formatDate, generateMailto } from './lib/utils';
import { generateHeuristicLetter } from './lib/heuristicLetter';
import { Check, ChevronDown, ChevronUp, Copy, Download, ExternalLink, Mail, MapPin, Search, ShieldCheck, Trash2 } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1 state
  const [selectedPointIds, setSelectedPointIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(new Set());

  // Step 2 state
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [recipientTab, setRecipientTab] = useState<'high-priority' | 'legislators'>('high-priority');
  
  // Manual legislator entry state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualAddress, setManualAddress] = useState('');

  // Step 3 state
  const [senderName, setSenderName] = useState('');
  const [senderTown, setSenderTown] = useState('');
  const [senderState, setSenderState] = useState('MA');
  const [tone, setTone] = useState<'Respectful' | 'Urgent' | 'Firm'>('Respectful');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [lockVariation, setLockVariation] = useState(false);
  const [includeAlternatives, setIncludeAlternatives] = useState(true);

  const categories = Array.from(new Set(talkingPoints.map(p => p.category)));

  const filteredPoints = talkingPoints.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const togglePointSelection = (id: string) => {
    setSelectedPointIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      return [...prev, id];
    });
  };

  const togglePointExpansion = (id: string) => {
    setExpandedPoints(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const movePoint = (index: number, direction: 'up' | 'down') => {
    const newIds = [...selectedPointIds];
    if (direction === 'up' && index > 0) {
      [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    } else if (direction === 'down' && index < newIds.length - 1) {
      [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
    }
    setSelectedPointIds(newIds);
  };

  const handleUseManualRecipient = () => {
    if (!manualName.trim()) return;
    setSelectedRecipient({
      id: 'manual-legislator',
      name: manualName.trim(),
      email: manualEmail.trim() || undefined,
      mailingAddress: manualAddress.trim() || undefined,
      type: 'legislator'
    });
  };

  const generateLetter = async (isRegenerate = false) => {
    setIsGenerating(true);
    setGenerateError('');
    try {
      const selectedPointsData = selectedPointIds.map(id => talkingPoints.find(p => p.id === id)!);
      
      let currentSeed = seed;
      if (isRegenerate && !lockVariation) {
        currentSeed = Math.floor(Math.random() * 1000000);
        setSeed(currentSeed);
      }

      // Simulate a tiny delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const letter = generateHeuristicLetter({
        recipient: selectedRecipient,
        sender: { name: senderName, town: senderTown, state: senderState },
        tone,
        selectedPoints: selectedPointsData,
        seed: currentSeed,
        includeAlternatives
      });
      
      setGeneratedLetter(letter);
    } catch (err: any) {
      setGenerateError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopyMessage('Copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showCopyMessage('Copied to clipboard!');
      } catch (e) {
        setGenerateError('Failed to copy. Please select the text and copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const showCopyMessage = (msg: string) => {
    setCopyMessage(msg);
    setTimeout(() => setCopyMessage(''), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "advocacy_letter.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      <header className="bg-emerald-800 text-white py-12 px-4 shadow-sm border-b-4 border-emerald-600">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Save the MassBay Forest Letter Writer
          </h1>
          <div className="text-emerald-50/90 text-lg md:text-xl leading-relaxed space-y-4 max-w-3xl font-medium">
            <p>
              Life moves fast. This AI-powered tool helps you put your thoughts into words—clearly, respectfully, and in your voice.
            </p>
            <p>
              Pick a few talking points, and we’ll generate a concise letter you can copy, download, or email to the right decision-makers.
            </p>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 bg-emerald-900/40 text-emerald-100 px-4 py-2.5 rounded-full text-sm font-medium border border-emerald-700/50">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Privacy promise: We do not store your personal data or the content of your letter.</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* STEP 1 */}
        <section className={`bg-white rounded-2xl shadow-sm border-2 p-6 md:p-8 ${step === 1 ? 'border-emerald-500' : 'border-stone-200 opacity-70'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800">Step 1: Choose Talking Points</h2>
            {step !== 1 && <button onClick={() => setStep(1)} className="text-emerald-700 font-semibold underline text-lg">Edit</button>}
          </div>
          
          {step === 1 && (
            <div className="space-y-8">
              <p className="text-lg text-stone-600">Select at least 3 points you want to include in your letter.</p>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-stone-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Search points..." 
                    className="w-full pl-12 pr-4 py-3 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="py-3 px-4 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500 bg-white"
                  value={selectedCategory || ''}
                  onChange={e => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredPoints.map(point => {
                  const isSelected = selectedPointIds.includes(point.id);
                  const isExpanded = expandedPoints.has(point.id);
                  return (
                    <div key={point.id} className={`border-2 rounded-xl p-4 transition-colors ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-white'}`}>
                      <div className="flex items-start gap-4">
                        <button 
                          onClick={() => togglePointSelection(point.id)}
                          className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-stone-400'}`}
                          aria-label={isSelected ? "Deselect point" : "Select point"}
                        >
                          {isSelected && <Check className="text-white" size={20} />}
                        </button>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-sm font-bold text-emerald-700 mb-1 block">{point.id} • {point.category}</span>
                              <h3 className="text-xl font-bold text-stone-800 mb-2">{point.title}</h3>
                            </div>
                          </div>
                          <p className="text-stone-700 text-lg leading-relaxed">
                            {isExpanded ? point.text : `${point.text.substring(0, 100)}...`}
                          </p>
                          <button 
                            onClick={() => togglePointExpansion(point.id)}
                            className="text-emerald-700 font-semibold mt-2 flex items-center gap-1 text-lg"
                          >
                            {isExpanded ? <><ChevronUp size={20}/> Show less</> : <><ChevronDown size={20}/> Read full text</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPointIds.length > 0 && (
                <div className="bg-stone-100 p-6 rounded-xl border-2 border-stone-200">
                  <h3 className="text-xl font-bold mb-4">Selected Points ({selectedPointIds.length})</h3>
                  <p className="text-stone-600 mb-4">Rank them by importance (top point gets emphasized first).</p>
                  <div className="space-y-2">
                    {selectedPointIds.map((id, index) => {
                      const point = talkingPoints.find(p => p.id === id)!;
                      return (
                        <div key={id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-stone-300">
                          <div className="flex flex-col">
                            <button onClick={() => movePoint(index, 'up')} disabled={index === 0} className="text-stone-500 disabled:opacity-30 p-1"><ChevronUp size={24}/></button>
                            <button onClick={() => movePoint(index, 'down')} disabled={index === selectedPointIds.length - 1} className="text-stone-500 disabled:opacity-30 p-1"><ChevronDown size={24}/></button>
                          </div>
                          <div className="flex-1 font-medium text-lg">{point.title}</div>
                          <button onClick={() => togglePointSelection(id)} className="text-red-600 p-2"><Trash2 size={24}/></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setStep(2)}
                disabled={selectedPointIds.length < 3}
                className="w-full py-4 text-xl font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
              >
                {selectedPointIds.length < 3 ? `Select ${3 - selectedPointIds.length} more point(s) to continue` : 'Continue to Step 2'}
              </button>
            </div>
          )}
        </section>

        {/* STEP 2 */}
        <section className={`bg-white rounded-2xl shadow-sm border-2 p-6 md:p-8 ${step === 2 ? 'border-emerald-500' : 'border-stone-200 opacity-70'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800">Step 2: Choose Recipient</h2>
            {step > 2 && <button onClick={() => setStep(2)} className="text-emerald-700 font-semibold underline text-lg">Edit</button>}
          </div>

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex border-b-2 border-stone-200">
                <button 
                  className={`flex-1 py-4 text-xl font-bold border-b-4 transition-colors ${recipientTab === 'high-priority' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-stone-500'}`}
                  onClick={() => setRecipientTab('high-priority')}
                >
                  High-Priority Targets
                </button>
                <button 
                  className={`flex-1 py-4 text-xl font-bold border-b-4 transition-colors ${recipientTab === 'legislators' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-stone-500'}`}
                  onClick={() => setRecipientTab('legislators')}
                >
                  Find My Legislators
                </button>
              </div>

              {recipientTab === 'high-priority' && (
                <div className="grid grid-cols-1 gap-4">
                  {highPriorityRecipients.map(rec => (
                    <div key={rec.id} className={`border-2 rounded-xl p-6 ${selectedRecipient?.id === rec.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'}`}>
                      <h3 className="text-2xl font-bold mb-1">{rec.name}</h3>
                      {rec.title && <p className="text-stone-600 text-lg mb-4">{rec.title}</p>}
                      
                      <div className="space-y-3 mb-6">
                        {rec.email && (
                          <div className="flex items-center gap-2 text-lg">
                            <Mail className="text-stone-400" />
                            <span className="font-medium">{rec.email}</span>
                            <button onClick={() => copyToClipboard(rec.email!)} className="text-emerald-700 text-sm font-bold uppercase ml-2 px-3 py-1 bg-emerald-100 rounded-full">Copy</button>
                          </div>
                        )}
                        {rec.mailingAddress && (
                          <div className="flex items-start gap-2 text-lg">
                            <MapPin className="text-stone-400 mt-1" />
                            <span className="whitespace-pre-line font-medium">{rec.mailingAddress}</span>
                            <button onClick={() => copyToClipboard(rec.mailingAddress!)} className="text-emerald-700 text-sm font-bold uppercase ml-2 px-3 py-1 bg-emerald-100 rounded-full">Copy</button>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => setSelectedRecipient(rec)}
                        className={`w-full py-3 text-lg font-bold rounded-xl border-2 transition-colors ${selectedRecipient?.id === rec.id ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-emerald-700 border-emerald-700 hover:bg-emerald-50'}`}
                      >
                        {selectedRecipient?.id === rec.id ? 'Selected' : 'Select this recipient'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {recipientTab === 'legislators' && (
                <div className="space-y-6">
                  <div className="bg-stone-100 p-6 rounded-xl border-2 border-stone-200">
                    <h3 className="text-xl font-bold mb-4">How to find your legislators</h3>
                    <ol className="list-decimal list-inside space-y-3 text-lg text-stone-700 mb-6">
                      <li>
                        Open the official Massachusetts Legislature tool in a new tab:<br/>
                        <a href="https://malegislature.gov/Search/FindMyLegislator" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1 mt-1">
                          Find My Legislator <ExternalLink size={18} />
                        </a>
                      </li>
                      <li>Find your State Representative and State Senator on that page.</li>
                      <li>Copy their contact email (and mailing address if you want) back into this app below.</li>
                    </ol>
                    
                    <div className="space-y-4 bg-white p-6 rounded-xl border-2 border-stone-200">
                      <div>
                        <label className="block text-lg font-bold mb-2">Legislator Full Name *</label>
                        <input 
                          type="text" 
                          className="w-full py-3 px-4 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500"
                          placeholder="e.g. Senator Jane Doe"
                          value={manualName}
                          onChange={e => setManualName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-bold mb-2">Legislator Email *</label>
                        <input 
                          type="email" 
                          className="w-full py-3 px-4 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500"
                          placeholder="e.g. jane.doe@masenate.gov"
                          value={manualEmail}
                          onChange={e => setManualEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-bold mb-2">Legislator Mailing Address (Optional)</label>
                        <textarea 
                          className="w-full py-3 px-4 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500 min-h-[100px]"
                          placeholder="e.g. 24 Beacon St, Room 123, Boston, MA 02133"
                          value={manualAddress}
                          onChange={e => setManualAddress(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleUseManualRecipient}
                        disabled={!manualName.trim() || !manualEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail.trim())}
                        className="w-full mt-4 py-3 px-8 text-lg font-bold rounded-xl text-white bg-stone-800 hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Use this recipient
                      </button>
                    </div>
                  </div>

                  {selectedRecipient?.id === 'manual-legislator' && (
                    <div className="grid grid-cols-1 gap-4">
                      <h3 className="text-xl font-bold text-stone-800">Your Selected Legislator</h3>
                      <div className="border-2 rounded-xl p-6 border-emerald-500 bg-emerald-50">
                        <h3 className="text-2xl font-bold mb-4">{selectedRecipient.name}</h3>
                        
                        <div className="space-y-3 mb-6">
                          {selectedRecipient.email && (
                            <div className="flex items-center gap-2 text-lg">
                              <Mail className="text-stone-400" />
                              <span className="font-medium">{selectedRecipient.email}</span>
                              <button onClick={() => copyToClipboard(selectedRecipient.email!)} className="text-emerald-700 text-sm font-bold uppercase ml-2 px-3 py-1 bg-emerald-100 rounded-full">Copy</button>
                            </div>
                          )}
                          {selectedRecipient.mailingAddress && (
                            <div className="flex items-start gap-2 text-lg">
                              <MapPin className="text-stone-400 mt-1" />
                              <span className="whitespace-pre-line font-medium">{selectedRecipient.mailingAddress}</span>
                              <button onClick={() => copyToClipboard(selectedRecipient.mailingAddress!)} className="text-emerald-700 text-sm font-bold uppercase ml-2 px-3 py-1 bg-emerald-100 rounded-full">Copy</button>
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full py-3 text-lg font-bold rounded-xl border-2 bg-emerald-700 text-white border-emerald-700 text-center">
                          Selected
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedRecipient && (
                <div className="mt-8 pt-8 border-t-2 border-stone-200">
                  <button 
                    onClick={() => setStep(3)}
                    className="w-full py-4 text-xl font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
                  >
                    Continue to Step 3
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* STEP 3 */}
        <section className={`bg-white rounded-2xl shadow-sm border-2 p-6 md:p-8 ${step === 3 ? 'border-emerald-500' : 'border-stone-200 opacity-70'}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-6">Step 3: Generate & Send</h2>
          
          {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold mb-2">Your Name *</label>
                  <input 
                    type="text" 
                    className="w-full py-3 px-4 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-lg font-bold mb-2">Town *</label>
                    <input 
                      type="text" 
                      className="w-full py-3 px-4 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500"
                      value={senderTown}
                      onChange={e => setSenderTown(e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-lg font-bold mb-2">State</label>
                    <input 
                      type="text" 
                      className="w-full py-3 px-4 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500"
                      value={senderState}
                      onChange={e => setSenderState(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Letter Tone</label>
                <div className="flex gap-4">
                  {['Respectful', 'Urgent', 'Firm'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t as any)}
                      className={`flex-1 py-3 text-lg font-bold rounded-xl border-2 transition-colors ${tone === t ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {generateError && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-bold text-lg">
                  {generateError}
                </div>
              )}

              <button 
                onClick={() => generateLetter(false)}
                disabled={!senderName || !senderTown || isGenerating}
                className="w-full py-4 text-xl font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
              >
                {isGenerating ? 'Drafting your letter...' : 'Generate Letter'}
              </button>

              {generatedLetter && (
                <div className="mt-12 space-y-6 border-t-2 border-stone-200 pt-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-2xl font-bold text-stone-800">Your Letter</h3>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-stone-600 text-sm font-medium cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={includeAlternatives} 
                          onChange={e => setIncludeAlternatives(e.target.checked)} 
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Include alternatives line (recommended)
                      </label>
                      <label className="flex items-center gap-2 text-stone-600 text-sm font-medium cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={lockVariation} 
                          onChange={e => setLockVariation(e.target.checked)} 
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Lock variation
                      </label>
                      <button 
                        onClick={() => generateLetter(true)}
                        disabled={isGenerating}
                        className="py-2 px-4 text-sm font-bold rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                      >
                        Regenerate (new variation)
                      </button>
                    </div>
                  </div>
                  <div className="bg-stone-50 border-2 border-stone-200 rounded-xl p-6 whitespace-pre-wrap text-lg font-serif leading-relaxed text-stone-800">
                    {generatedLetter}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => copyToClipboard(generatedLetter)}
                      className="flex-1 py-4 text-lg font-bold rounded-xl border-2 border-stone-300 bg-white hover:bg-stone-50 flex items-center justify-center gap-2"
                    >
                      <Copy size={24} /> Copy Letter
                    </button>
                    <button 
                      onClick={downloadTxt}
                      className="flex-1 py-4 text-lg font-bold rounded-xl border-2 border-stone-300 bg-white hover:bg-stone-50 flex items-center justify-center gap-2"
                    >
                      <Download size={24} /> Download .txt
                    </button>
                  </div>

                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mt-8">
                    <h4 className="text-xl font-bold text-emerald-900 mb-4">Send to {selectedRecipient?.name}</h4>
                    
                    {selectedRecipient?.email ? (
                      <div className="space-y-4">
                        <a 
                          href={generateMailto(selectedRecipient.email, "Please protect the MassBay Forest / Centennial Park parcel", generatedLetter)}
                          className="block w-full py-4 text-xl font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 text-center flex items-center justify-center gap-2"
                        >
                          <Mail size={24} /> Email this letter
                        </a>
                        <button 
                          onClick={() => copyToClipboard(`To: ${selectedRecipient.email}\nSubject: Please protect the MassBay Forest / Centennial Park parcel\n\n${generatedLetter}`)}
                          className="w-full py-4 text-lg font-bold rounded-xl border-2 border-emerald-700 text-emerald-800 bg-white hover:bg-emerald-50 flex items-center justify-center gap-2"
                        >
                          <Copy size={24} /> Copy Email + Letter
                        </button>
                      </div>
                    ) : selectedRecipient?.contactUrl ? (
                      <div className="space-y-4">
                        <p className="text-lg text-emerald-800 font-medium">Paste the letter into the official contact form.</p>
                        <a 
                          href={selectedRecipient.contactUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-4 text-xl font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 text-center flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={24} /> Open official contact form
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-lg text-emerald-800 font-medium">This recipient only accepts physical mail. Please print and mail to:</p>
                        <div className="bg-white p-4 rounded-lg border border-emerald-200 whitespace-pre-line font-medium text-lg">
                          {selectedRecipient?.mailingAddress}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-stone-500 border-t-2 border-stone-200 mt-8">
        <p className="text-sm font-medium">
          Built by{' '}
          <a href="https://www.linkedin.com/in/clark-ohlenbusch-bb8b60253/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">Clark Ohlenbusch</a>
          {' '}and{' '}
          <a href="https://www.linkedin.com/in/juliehohenberg/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">Julie Hohenberg</a>.
        </p>
      </footer>

      {copyMessage && (
        <div className="fixed bottom-4 right-4 bg-stone-800 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-lg z-50">
          {copyMessage}
        </div>
      )}
    </div>
  );
}
