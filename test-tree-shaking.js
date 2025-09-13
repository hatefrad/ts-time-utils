// Tree-shaking test to validate that only imported functions are bundled
import { formatDuration } from './dist/esm/format.js';

console.log(formatDuration(5000));
