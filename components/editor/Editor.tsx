import React, { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { FloatingComposer, FloatingThreads, liveblocksConfig, LiveblocksPlugin, useEditorStatus } from '@liveblocks/react-lexical';
import Loader from '../Loader';
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin';
import { useThreads } from '@liveblocks/react/suspense';
import Comments from '../Comments';
import { DeleteModal } from '../DeleteModal';
import { fetchDocument, saveDocument } from '@/lib/actions/room.actions'; // Adjust the path based on your file structure

// TypeScript interfaces for grammar errors and responses
interface GrammarError {
  message: string;
  // will add relevant fields as needed
}

interface GrammarCheckResponse {
  matches: GrammarError[];
}

// Function to check grammar using LanguageTool API
async function checkGrammar(text: string): Promise<GrammarCheckResponse> {
  const response = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      text: text,
      language: 'en-US',
    }),
  });

  if (!response.ok) {
    throw new Error('Error checking grammar');
  }

  const data = await response.json();
  return data;
}

// Placeholder for empty editor state
function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

// Function to download content as a file
function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

// Editor component
function EditorComponent({ roomId, currentUserType }: { roomId: string; currentUserType: UserType }) {
  const [editor] = useLexicalComposerContext();
  const [grammarErrors, setGrammarErrors] = useState<GrammarError[]>([]);
  const status = useEditorStatus();
  const { threads } = useThreads();

  // Function to handle grammar check
  const handleGrammarCheck = async (content: string) => {
    try {
      const { matches } = await checkGrammar(content);
      setGrammarErrors(matches);
    } catch (error) {
      console.error('Error checking grammar:', error);
    }
  };

  // Function to handle editor change
  const handleEditorChange = () => {
    if (editor) {
      editor.update(() => {
        const editorState = editor.getEditorState();
        editorState.read(() => {
          const root = $getRoot();
          const content = root.getTextContent();
          handleGrammarCheck(content);
        });
      });
    }
  };

  useEffect(() => {
    if (editor) {
      const unsubscribe = editor.registerUpdateListener(handleEditorChange);
      return () => unsubscribe();
    }
  }, [editor]);

  // Function to handle download
  const handleDownload = () => {
    if (editor) {
      editor.update(() => {
        const editorState = editor.getEditorState();
        editorState.read(() => {
          const root = $getRoot();
          const content = root.getTextContent();
          downloadFile(content, 'document.txt', 'text/plain');
        });
      });
    }
  };

  // Function to handle save
  const handleSave = async () => {
    if (editor) {
      editor.update(async () => {
        const editorState = editor.getEditorState();
        editorState.read(async () => {
          const root = $getRoot();
          const content = root.getTextContent();
          try {
            await saveDocument(roomId, content);
          } catch (error) {
            console.error('Error saving document:', error);
          }
        });
      });
    }
  };

  // Fetch and load document content on mount
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const documentContent = await fetchDocument(roomId);
        if (editor && documentContent) {
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            const paragraphNode = $createParagraphNode();
            const textNode = $createTextNode(documentContent);
            paragraphNode.append(textNode);
            root.append(paragraphNode);
          });
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    loadDocument();
  }, [roomId, editor]);

  return (
    <div className="editor-container size-full">
      <div className="toolbar-wrapper flex min-w-full justify-between">
        <ToolbarPlugin />
        {currentUserType === 'editor' && (
          <>
            <div className="top-24 right-6 flex items-center space-x-4 translate-x-4">
              <button onClick={handleDownload} className="rounded-lg bg-dark-500   px-3 py-2 text-white">
                <span className="hidden sm:inline">Download document</span>
              </button>
              <DeleteModal roomId={roomId} />
            </div>
          </>
        )}
      </div>

      <div className="editor-wrapper flex flex-col items-center justify-start">
        {status === 'not-loaded' || status === 'loading' ? (
          <Loader />
        ) : (
          <div className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input h-full" />}
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {currentUserType === 'editor' && <FloatingToolbarPlugin />}
            <HistoryPlugin />
            <AutoFocusPlugin />
          </div>
        )}

        <LiveblocksPlugin>
          <FloatingComposer className="w-[350px]" />
          <FloatingThreads threads={threads} />
          <Comments />
        </LiveblocksPlugin>
      </div>

      {/* Display grammar errors */}
      {grammarErrors.length > 0 && (
        <div className="grammar-errors mt-4">
          <h3>Grammar Issues:</h3>
          <ul>
            {grammarErrors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Higher-level component that includes LexicalComposer
export function Editor({ roomId, currentUserType }: { roomId: string; currentUserType: UserType }) {
  const initialConfig = liveblocksConfig({
    namespace: 'Editor',
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error('Editor Error:', error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === 'editor',
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorComponent roomId={roomId} currentUserType={currentUserType} />
    </LexicalComposer>
  );
}
