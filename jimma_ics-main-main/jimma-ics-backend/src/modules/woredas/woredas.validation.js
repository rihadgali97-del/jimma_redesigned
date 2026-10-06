import { z, idParamSchema, paginationQuerySchema } from '../../common/validation/shared.js';
import { SUPPORTED_LOCALES } from '../../common/services/translation.service.js';

const localeEnum = z.enum(SUPPORTED_LOCALES);
const translationsShape = z.record(localeEnum, z.string().trim().min(1)).optional();

export const listWoredasSchema = z.object({
  query: paginationQuerySchema.extend({
    locale: localeEnum.optional(),
  }),
});

export const woredaIdParamSchema = z.object({
  params: idParamSchema,
});

export const createWoredaSchema = z.object({
  body: z.object({
    code: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/, 'code must be lowercase letters, numbers, and hyphens only'),
    name: translationsShape, // { en: 'Agaro', am: '...', om: '...', ar: '...' }
  }),
});

export const updateWoredaSchema = z.object({
  params: idParamSchema,
  body: z
    .object({
      name: translationsShape,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});