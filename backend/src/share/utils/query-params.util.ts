import { SortOrderOption } from 'src/share/enums/sortOrderOption.enum';
import { ProcessedQueryParams, QueryOptions } from 'src/share/interface';

export function processQueryParams<T>(
  query: T & QueryOptions,
  searchFields?: string[],
): ProcessedQueryParams<T> {
  const filter: any = { ...query };
  const options: QueryOptions = {};
  if (searchFields) {
    searchFields.forEach(field => {
      if (filter[field]) {
        filter[field] = { $regex: filter[field], $options: 'i' };
      }
    });
  }

  if (query.limit) {
    options.limit = query.limit;
    delete filter.limit;
  }

  if (query.skip) {
    options.skip = query.skip;
    delete filter.skip;
  }

  if (query.orderBy) {
    options.orderBy = query.orderBy;
    delete filter.orderBy;
  }

  if (query.sortOrder) {
    options.sortOrder = query.sortOrder;
    delete filter.sortOrder;
  }

  return { filter, options };
}

export function applyQueryOptions<T>(queryBuilder: T, options?: QueryOptions): T {
  if (!options) return queryBuilder;

  if (options.orderBy) {
    const sortDirection = options.sortOrder === SortOrderOption.DESC ? -1 : 1;
    (queryBuilder as any).sort({ [options.orderBy]: sortDirection });
  }

  if (options.skip !== undefined) {
    (queryBuilder as any).skip(options.skip);
  }

  if (options.limit !== undefined) {
    (queryBuilder as any).limit(options.limit);
  }

  return queryBuilder;
}
