import _get from 'lodash/get';
import _setWith from 'lodash/setWith';
import _clone from 'lodash/clone';
import _debug from 'debug';
import { checkContext } from '../utils/check-context';
import { Forbidden } from '@feathersjs/errors';
import type { Hook } from '@feathersjs/feathers';
import type { SetFieldOptions } from '../types';

const debug = _debug('feathers-hooks-common/setField');

export function setField (
  { as, from, allowUndefined = false }: SetFieldOptions
): Hook {
  if (!as || !from) {
    throw new Error('\'as\' and \'from\' options have to be set');
  }

  return context => {
    const { params, app } = context;

    if (app.version < '4.0.0') {
      throw new Error('The \'setField\' hook only works with Feathers 4 and the latest database adapters');
    }

    checkContext(context, 'before', null, 'setField');

    const value = _get(context, from);

    if (value === undefined) {
      if (!params.provider || allowUndefined) {
        debug(`Skipping call with value ${from} not set`);
        return context;
      }

      throw new Forbidden(`Expected field ${as} not available`);
    }

    debug(`Setting value '${value}' from '${from}' as '${as}'`);

    return _setWith(context, as, value, _clone);
  };
}