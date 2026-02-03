'use client';

import dynamic from 'next/dynamic';
import '@mdxeditor/editor/style.css';
import './editor.css';

interface EditorProps {
    markdown?: string;
    onChangeAction: (value: string) => void;
}

const EditorComponent = dynamic(
    () => import('./EditorInner'),
    {
        ssr: false,
        loading: () => (
            <div className="editor h-full relative w-1/2 custom-scrollbar overflow-auto bg-white border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Loading editor...</span>
            </div>
        )
    }
);

export default function Editor({markdown, onChangeAction}: EditorProps) {
    return <EditorComponent markdown={markdown} onChangeAction={onChangeAction} />;
}