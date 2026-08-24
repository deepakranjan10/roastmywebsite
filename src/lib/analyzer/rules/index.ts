import type { Finding, SiteSignals } from '@/types/audit';
import { technicalSeoFindings } from './technical-seo';
import { performanceFindings } from './performance';
import { contentFindings } from './content';
import { uxFindings } from './ux';
import { conversionFindings } from './conversion';
import { accessibilityFindings } from './accessibility';

export function generateAllFindings(signals: SiteSignals): Finding[] {
  return [
    ...technicalSeoFindings(signals),
    ...performanceFindings(signals),
    ...contentFindings(signals),
    ...uxFindings(signals),
    ...conversionFindings(signals),
    ...accessibilityFindings(signals),
  ];
}

export {
  technicalSeoFindings,
  performanceFindings,
  contentFindings,
  uxFindings,
  conversionFindings,
  accessibilityFindings,
};
