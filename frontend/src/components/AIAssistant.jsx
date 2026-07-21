import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import api from '../api/axios';

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-dark rounded-lg mb-3 overflow-hidden bg-bg-dark">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-sm font-semibold text-white bg-bg-card hover:bg-bg-card-hover transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {isOpen && (
        <div className="p-3 text-sm text-slate-300">
          {children}
        </div>
      )}
    </div>
  );
};

const AIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [scriptNotes, setScriptNotes] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState('');
  const [videoOutline, setVideoOutline] = useState('');
  
  const { activeScriptData, addNotification } = useAppStore();

  const handleAIRequest = async (contextType, setter, successMsg) => {
    if (!activeScriptData?.content || activeScriptData.content.trim() === '' || activeScriptData.content === '<p></p>') {
      addNotification('Please paste or write a script in the editor first.', 'error');
      return;
    }

    setIsLoading(true);
    setter('');
    try {
      const response = await api.post('/ai/generate', {
        prompt: `Generate ${contextType}`,
        selectedText: activeScriptData.content,
        contextType
      });
      
      let htmlResponse = response.data.suggestion;
      htmlResponse = htmlResponse.replace(/```html/g, '').replace(/```/g, '').trim();

      setter(htmlResponse);
      addNotification(successMsg, 'success');
    } catch (error) {
      console.error("AI Error:", error);
      addNotification("Failed to generate. Check your API key.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border-dark">
        <h3 className="font-semibold text-white text-sm">AI Assistant (Gemini API)</h3>
        <div className="flex items-center space-x-2">
          <button className="text-slate-500 hover:text-white"><ChevronUp size={16} /></button>
          <button className="text-slate-500 hover:text-white"><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {suggestion && (
          <CollapsibleSection title="AI Response" defaultOpen={true}>
            <div className="whitespace-pre-wrap prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: suggestion }} />
          </CollapsibleSection>
        )}
        
        <CollapsibleSection title="Script Notes" defaultOpen={true}>
          {scriptNotes ? (
            <div className="whitespace-pre-wrap prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: scriptNotes }} />
          ) : (
            <div className="text-center py-2">
              <p className="text-slate-500 italic text-xs mb-3">Get AI feedback on your pacing and clarity.</p>
              <button 
                onClick={() => handleAIRequest('ScriptNotes', setScriptNotes, 'Notes generated!')}
                disabled={isLoading}
                className="bg-slate-800 hover:bg-slate-700 text-xs font-medium px-4 py-1.5 rounded transition-colors text-white border border-slate-700"
              >
                Analyze Script
              </button>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Title Suggestions" defaultOpen={true}>
          {titleSuggestions ? (
            <div className="whitespace-pre-wrap prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: titleSuggestions }} />
          ) : (
            <div className="text-center py-2">
              <p className="text-slate-500 italic text-xs mb-3">Brainstorm 5 highly clickable titles.</p>
              <button 
                onClick={() => handleAIRequest('Title', setTitleSuggestions, 'Titles generated!')}
                disabled={isLoading}
                className="bg-slate-800 hover:bg-slate-700 text-xs font-medium px-4 py-1.5 rounded transition-colors text-white border border-slate-700"
              >
                Generate Titles
              </button>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Video Outline" defaultOpen={true}>
          {videoOutline ? (
            <div className="whitespace-pre-wrap prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: videoOutline }} />
          ) : (
            <div className="text-center py-2">
              <p className="text-slate-500 italic text-xs mb-3">Summarize your script into a structural outline.</p>
              <button 
                onClick={() => handleAIRequest('VideoOutline', setVideoOutline, 'Outline created!')}
                disabled={isLoading}
                className="bg-slate-800 hover:bg-slate-700 text-xs font-medium px-4 py-1.5 rounded transition-colors text-white border border-slate-700"
              >
                Create Outline
              </button>
            </div>
          )}
        </CollapsibleSection>
      </div>

      <div className="p-4 border-t border-border-dark space-y-3">
        <button 
          onClick={() => handleAIRequest('StructureScript', setSuggestion, 'Script structurally analyzed!')}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-brand-orange to-brand-purple hover:opacity-90 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-opacity shadow-lg"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Sparkles size={18} />
              <span className="text-sm font-semibold tracking-wide">Magic Structure Script</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
