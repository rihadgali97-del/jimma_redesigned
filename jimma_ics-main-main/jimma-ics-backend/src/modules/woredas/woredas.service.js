import { woredasRepository } from './woredas.repository.js';
import {
  upsertTranslations,
  getTranslationsForEntities,
  getTranslationsForEntity,
  resolveLocale,
  DEFAULT_LOCALE,
} from '../../common/services/translation.service.js';
import { NotFoundError, ConflictError } from '../../common/errors/httpErrors.js';
import { writeAuditLog } from '../../common/utils/auditLog.js';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination.js';

const ENTITY_TYPE = 'woreda';

function toPublic(woreda, translations, locale) {
  return {
    id: woreda.id,
    code: woreda.code,
    name: resolveLocale(translations?.name, locale),
  };
}

export async function listWoredas(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const locale = query.locale ?? DEFAULT_LOCALE;

  const { items, totalItems } = await woredasRepository.findMany({ skip, take });
  const translations = await getTranslationsForEntities(
    ENTITY_TYPE,
    items.map((w) => w.id),
    ['name']
  );

  return {
    items: items.map((w) => toPublic(w, translations[w.id], locale)),
    meta: buildPaginationMeta({ page, pageSize, totalItems }),
  };
}

export async function getWoreda(id, locale = DEFAULT_LOCALE) {
  const woreda = await woredasRepository.findById(id);
  if (!woreda) throw new NotFoundError('Woreda not found');

  const translations = await getTranslationsForEntity(ENTITY_TYPE, id, ['name']);
  return toPublic(woreda, translations, locale);
}

export async function createWoreda({ code, name }, actorId) {
  const existing = await woredasRepository.findByCode(code);
  if (existing) throw new ConflictError('A woreda with this code already exists');

  const woreda = await woredasRepository.create({ code });

  if (name) await upsertTranslations(ENTITY_TYPE, woreda.id, { name });

  await writeAuditLog({
    actorId,
    action: 'create',
    entityType: ENTITY_TYPE,
    entityId: woreda.id,
    after: { code, name },
  });

  return getWoreda(woreda.id);
}

export async function updateWoreda(id, { name }, actorId) {
  const woreda = await woredasRepository.findById(id);
  if (!woreda) throw new NotFoundError('Woreda not found');

  if (name) await upsertTranslations(ENTITY_TYPE, id, { name });

  await writeAuditLog({
    actorId,
    action: 'update',
    entityType: ENTITY_TYPE,
    entityId: id,
    after: { name },
  });

  return getWoreda(id);
}