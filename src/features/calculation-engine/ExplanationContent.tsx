import { useTranslation } from 'react-i18next'
import type { HumanExplanation } from './explain-human'

export function ExplanationContent({ explanation }: { explanation: HumanExplanation }) {
  const { t } = useTranslation()

  if (explanation.unavailable) {
    return (
      <p className="pb-2 text-sm text-muted">
        {t('calc.explanationUnavailable')}
      </p>
    )
  }

  return (
    <div className="space-y-5 pb-2">
      {explanation.sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">{section.title}</p>
          <div className="mt-1.5 space-y-1">
            {section.lines.map((line) => (
              <p key={line} className="text-sm font-medium leading-relaxed text-text">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
