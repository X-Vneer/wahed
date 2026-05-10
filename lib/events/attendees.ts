/**
 * Diff a previous attendee list against the current list, optionally excluding
 * the actor (the user performing the change should not notify themselves).
 *
 * Works for both internal user IDs and external email strings — pass either.
 */
export function attendeeDelta<T extends string>(
  previous: T[],
  current: T[],
  excludeId?: T
): {
  newlyInvited: T[]
  stillAttending: T[]
  removed: T[]
} {
  const prevSet = new Set(previous)
  const currSet = new Set(current)

  const newlyInvited: T[] = []
  const stillAttending: T[] = []
  for (const id of current) {
    if (excludeId !== undefined && id === excludeId) continue
    if (prevSet.has(id)) {
      stillAttending.push(id)
    } else {
      newlyInvited.push(id)
    }
  }

  const removed: T[] = []
  for (const id of previous) {
    if (excludeId !== undefined && id === excludeId) continue
    if (!currSet.has(id)) removed.push(id)
  }

  return { newlyInvited, stillAttending, removed }
}

/** Normalize external email input: trim, lowercase, dedupe, drop empties. */
export function normalizeEmails(emails: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of emails) {
    const email = raw.trim().toLowerCase()
    if (!email) continue
    if (seen.has(email)) continue
    seen.add(email)
    out.push(email)
  }
  return out
}
