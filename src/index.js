export * from './context';
import { patch as patchNatives } from './natives';
import { patch as patchPromise } from './promise';

patchNatives();
if (typeof Promise !== 'undefined') {
  patchPromise();
}
