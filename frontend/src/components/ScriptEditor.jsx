import React, { useState, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Link2, Image as ImageIcon, Play, Pause, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api/axios';
import useAppStore from '../store/useAppStore';

const Teleprompter = ({ scriptData, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += speed;
        }
      }, 50);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, speed]);

  return (
    <div ref={scrollRef} className="fixed inset-0 z-[100] bg-black flex flex-col p-12 overflow-y-auto teleprompter-scroll">
      <div className="fixed top-6 right-6 flex items-center space-x-4 bg-slate-900/80 backdrop-blur p-3 rounded-full shadow-xl">
        <input 
          type="range" 
          min="1" max="10" 
          value={speed} 
          onChange={e => setSpeed(Number(e.target.value))}
          className="w-24 accent-brand-purple"
        />
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-brand-purple hover:bg-brand-purple-hover text-white rounded-full transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          onClick={onClose}
          className="p-3 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="max-w-4xl mx-auto w-full pt-20 pb-[500px]">
        <h1 className="text-5xl font-bold text-brand-orange mb-12 text-center leading-tight">
          {scriptData.title || 'Untitled Script'}
        </h1>
        <div className="text-6xl text-white font-semibold leading-[1.4] space-y-16 text-center prose prose-invert max-w-none prose-p:leading-[1.4] prose-headings:leading-[1.4]">
          {scriptData.content && <div dangerouslySetInnerHTML={{ __html: scriptData.content }} />}
        </div>
      </div>
    </div>
  );
};

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center space-x-1 p-2 bg-bg-dark border-b border-border-dark text-slate-400">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive('bold') ? 'bg-slate-800 text-white' : ''}`}>
        <Bold size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive('italic') ? 'bg-slate-800 text-white' : ''}`}>
        <Italic size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive('underline') ? 'bg-slate-800 text-white' : ''}`}>
        <Underline size={16} />
      </button>
      <div className="w-px h-4 bg-slate-700 mx-2"></div>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-800 text-white' : ''}`}>
        <AlignLeft size={16} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-800 text-white' : ''}`}>
        <AlignCenter size={16} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-800 text-white' : ''}`}>
        <AlignRight size={16} />
      </button>
      <div className="w-px h-4 bg-slate-700 mx-2"></div>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive('bulletList') ? 'bg-slate-800 text-white' : ''}`}>
        <List size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive('orderedList') ? 'bg-slate-800 text-white' : ''}`}>
        <ListOrdered size={16} />
      </button>
      <div className="w-px h-4 bg-slate-700 mx-2"></div>
      <button 
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
          else if (url === '') editor.chain().focus().unsetLink().run();
        }} 
        className={`p-1.5 rounded hover:bg-slate-800 ${editor.isActive('link') ? 'bg-slate-800 text-white' : ''}`}
      >
        <Link size={16} />
      </button>
      <button 
        onClick={() => {
          const url = window.prompt('Enter image URL:');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }} 
        className="p-1.5 rounded hover:bg-slate-800"
      >
        <ImageIcon size={16} />
      </button>
    </div>
  );
};

const defaultExtensions = [
  StarterKit,
  UnderlineExtension,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  LinkExtension.configure({ openOnClick: false }),
  ImageExtension,
];

const SectionEditor = ({ title, content, onChange, placeholder, onFocus, minHeight = 'min-h-[80px]' }) => {
  const [extensions] = useState(() => [
    ...defaultExtensions,
    Placeholder.configure({ placeholder })
  ]);

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: ({ editor }) => {
      onFocus(editor);
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none ${minHeight} text-slate-300 py-2`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold tracking-wide text-white mb-2">{title}</h2>
      <EditorContent editor={editor} />
    </div>
  );
};

const ScriptEditor = () => {
  const { activeScriptId, scripts, setScripts, activeScriptData, setActiveScriptData, updateActiveScriptData } = useAppStore();
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  
  const debouncedData = useDebounce(activeScriptData, 1500);

  useEffect(() => {
    const saveScript = async () => {
      if (!activeScriptId) return;

      try {
        const response = await api.patch(`/scripts/${activeScriptId}`, debouncedData);
        setScripts(scripts.map(s => s._id === activeScriptId ? response.data : s));
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    };

    saveScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedData, activeScriptId]);

  useEffect(() => {
    if (activeScriptId) {
      const active = scripts.find(s => s._id === activeScriptId);
      if (active) setActiveScriptData(active);
    }
  }, [activeScriptId, scripts, setActiveScriptData]);

  return (
    <div className="flex flex-col h-full bg-bg-card">
      {isTeleprompterOpen && (
        <Teleprompter scriptData={activeScriptData} onClose={() => setIsTeleprompterOpen(false)} />
      )}
      
      <div className="flex items-center px-4 border-b border-border-dark bg-bg-dark shrink-0">
        <MenuBar editor={activeEditor} />
        <div className="ml-auto">
          <button 
            onClick={() => setIsTeleprompterOpen(true)}
            className="flex items-center space-x-2 text-xs font-medium text-white bg-brand-purple hover:bg-brand-purple-hover px-3 py-1.5 rounded transition-colors shadow-sm shadow-brand-purple/20"
          >
            <Play size={14} />
            <span>Teleprompter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <SectionEditor 
          title="Video Script" 
          content={activeScriptData.content} 
          onChange={(val) => updateActiveScriptData('content', val)}
          onFocus={setActiveEditor}
          placeholder="Start writing or paste your raw script here for the AI to structure..."
          minHeight="min-h-[700px]"
        />
      </div>
    </div>
  );
};

export default ScriptEditor;
