export function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

export function assertOptionalString(
  value: unknown,
  field: string,
): string | null | undefined {
  if (value === null || value === undefined) {
    return value
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

export function assertOptionalNumber(
  value: unknown,
  field: string,
): number | null | undefined {
  if (value === null || value === undefined) {
    return value
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

export type CatalogInput = {
  last?: string | null
  n?: number | null
}

export type NameRefInput = {
  name: string
  ref: string
}

export type NameTagInput = {
  name: string
  tag: string
}

export type TagListInput = {
  name: string
  last?: string | null
  n?: number | null
}

export function validateCatalogInput(
  data: { last?: unknown; n?: unknown } | undefined,
): CatalogInput {
  return {
    last: assertOptionalString(data?.last, 'last'),
    n: assertOptionalNumber(data?.n, 'n'),
  }
}

export function validateNameRefInput(
  data: { name?: unknown; ref?: unknown } | undefined,
): NameRefInput {
  return {
    name: assertString(data?.name, 'name'),
    ref: assertString(data?.ref, 'ref'),
  }
}

export function validateNameTagInput(
  data: { name?: unknown; tag?: unknown } | undefined,
): NameTagInput {
  return {
    name: assertString(data?.name, 'name'),
    tag: assertString(data?.tag, 'tag'),
  }
}

export function validateTagListInput(
  data: { name?: unknown; last?: unknown; n?: unknown } | undefined,
): TagListInput {
  return {
    name: assertString(data?.name, 'name'),
    last: assertOptionalString(data?.last, 'last'),
    n: assertOptionalNumber(data?.n, 'n'),
  }
}
