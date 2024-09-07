import { Stack, Space } from '@mantine/core'
import { RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import InsertMessageTag from './InsertMessageTag'
import { MessageTag } from './MessageTag'
import suggestion from './suggestion.js'

interface Props {
  body: string
  setBody: (value: string, valueHtml: string) => void
}

const TextEditor = ({ body, setBody }: Props) => {
  const [content, setContent] = useState<string>('<p></p>')

  useEffect(() => {
    if (body && content == '<p></p>') {
      setContent(body)
    }
  }, [body])

  const editor = useEditor(
    {
      content: content || '',
      extensions: [
        StarterKit,
        MessageTag.configure({
          HTMLAttributes: {
            class: 'vesta-message-tag',
          },
          suggestion: suggestion,
        }),
      ],
      onTransaction({ editor }): void {
        if (editor.getText() != '') setBody(editor.getText(), editor.getHTML())
      },
    },
    [content]
  )

  const insertMessageTag = () => {
    editor?.chain().focus().insertContent('{').run()
  }

  if (!editor) return <></>
  else {
    return (
      <Stack>
        <RichTextEditor editor={editor}>
          <RichTextEditor.Content />
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <InsertMessageTag onClick={insertMessageTag} />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
        </RichTextEditor>
        <Space h={20} />
      </Stack>
    )
  }
}

export default TextEditor
