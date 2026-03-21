'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Info } from 'lucide-react'

interface HelpContent {
  manual: string
  glossary: string
  eli5: string
}

interface HelpDialogProps {
  content: HelpContent
  title?: string
}

export function HelpDialog({ content, title = 'Ayuda' }: HelpDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Ayuda: ${title}`}
        className="text-muted-foreground hover:text-primary"
      >
        <Info className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="manual" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="manual">Manual de uso</TabsTrigger>
              <TabsTrigger value="glossary">Glosario</TabsTrigger>
              <TabsTrigger value="eli5">ELI5</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="flex-1 overflow-y-auto mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{content.manual}</ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="glossary" className="flex-1 overflow-y-auto mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{content.glossary}</ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="eli5" className="flex-1 overflow-y-auto mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{content.eli5}</ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
