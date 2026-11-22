/*
  Тексты уроков (вопросы, варианты, чек-листы) приходят строкой.
  Поддерживаем `код` в обратных кавычках и **жирный** — без dangerouslySetInnerHTML.
*/
export function InlineCode({ text = '' }) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return <code key={index}>{part.slice(1, -1)}</code>
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={index}>{part.slice(2, -2)}</strong>
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
