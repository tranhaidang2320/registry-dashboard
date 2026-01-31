import { createServerFn } from '@tanstack/react-start'
import { fetchCatalogPage, fetchRepositories } from '../../registry.server'
import { validateCatalogInput } from './validators'

export const getRepositories = createServerFn({
  method: 'GET',
}).handler(fetchRepositories)

export const getCatalogPage = createServerFn({
  method: 'GET',
})
  .inputValidator(validateCatalogInput)
  .handler(async ({ data }) => fetchCatalogPage(data))
