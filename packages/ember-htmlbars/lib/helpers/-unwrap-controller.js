/**
@module ember
@submodule ember-htmlbars
*/

import { get } from 'ember-metal/property_get';
import ControllerMixin from "ember-runtime/mixins/controller";

export default function unwrapControllerHelper([value], hash) {
  /* jshint loopfunc:true */
  while (ControllerMixin.detect(value)) {
    Ember.deprecate(
      'Providing `{{link-to}}` or `{{action}}` with a param that is ' +
      'wrapped in a controller is deprecated. Please append `.model` ' +
      'to the path in the template' +
      (function() {
        if (hash._debugModuleName && hash._debugLine) {
          return ` near ${hash._debugModuleName}:${hash._debugLine}.`;
        } else {
          return '.';
        }
      })()
    );

    value = get(value, 'model');
  }

  return value;
}
