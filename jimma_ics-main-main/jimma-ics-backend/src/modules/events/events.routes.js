import { Router } from 'express';
import * as eventsController from './events.controller.js';
import {
  createEventSchema,
  eventIdParamSchema,
  listEventRegistrationsSchema,
  listEventsSchema,
  registerForEventSchema,
  updateEventSchema,
  updateRegistrationSchema,
} from './events.validation.js';
import { validate } from '../../common/middlewares/validate.js';
import { authenticate } from '../../common/middlewares/authenticate.js';
import { authorize } from '../../common/middlewares/authorize.js';
import { strictRateLimiter } from '../../common/middlewares/rateLimiter.js';

export const eventsPublicRouter = Router();
export const eventsAdminRouter = Router();

eventsPublicRouter.get('/', validate(listEventsSchema), eventsController.listPublic);
eventsPublicRouter.get('/:id', validate(eventIdParamSchema), eventsController.getPublic);
eventsPublicRouter.post(
  '/:id/registrations',
  strictRateLimiter({ windowMs: 60 * 60 * 1000, max: 12 }),
  validate(registerForEventSchema),
  eventsController.register
);

eventsAdminRouter.use(authenticate, authorize('events.write'));
eventsAdminRouter.get('/registrations', validate(listEventRegistrationsSchema), eventsController.listRegistrations);
eventsAdminRouter.patch('/registrations/:id', validate(updateRegistrationSchema), eventsController.updateRegistration);
eventsAdminRouter.get('/', validate(listEventsSchema), eventsController.listAdmin);
eventsAdminRouter.post('/', validate(createEventSchema), eventsController.create);
eventsAdminRouter.get('/:id', validate(eventIdParamSchema), eventsController.getAdmin);
eventsAdminRouter.patch('/:id', validate(updateEventSchema), eventsController.update);
eventsAdminRouter.delete('/:id', validate(eventIdParamSchema), eventsController.remove);
