'use client';

import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProofHashDisplay({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success('Proof hash copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const short = `${hash.slice(0, 10)}...${hash.slice(-6)}`;

  return (
    <div className="flex items-center gap-2 group">
      <span className="proof-hash flex-1 truncate">{short}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
        aria-label="Copy proof hash"
      >
        {copied
          ? <CheckCircle2 size={12} className="text-green-400" />
          : <Copy size={12} className="text-muted-foreground" />
        }
      </button>
    </div>
  );
}