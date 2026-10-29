import { scanGitConfigAssignments } from './git-config-assignments'

// `section` and `key` must be lowercase: git config names are case-insensitive.
export function parseGitConfigFlag(
  configContent: string,
  section: string,
  key: string
): boolean | undefined {
  let value: boolean | undefined
  for (const assignment of scanGitConfigAssignments(configContent)) {
    if (
      assignment.section?.name !== section ||
      assignment.section.hasSubsection ||
      assignment.key !== key
    ) {
      continue
    }
    if (assignment.value.kind === 'implicit') {
      value = true
      continue
    }
    const decoded = assignment.value.decoded
    if (!decoded) {
      value = false
      continue
    }
    const current = parseDecodedGitConfigBoolean(decoded.value)
    const legacy =
      decoded.legacyValue === undefined
        ? current
        : parseDecodedGitConfigBoolean(decoded.legacyValue)
    value = current === legacy ? current : false
  }
  return value
}

function parseDecodedGitConfigBoolean(decoded: string): boolean {
  const value = decoded.toLowerCase()
  return value === 'true' || value === 'yes' || value === 'on' || value === '1'
}
