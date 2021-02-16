import _ from 'lodash';

export default function pathJoin(...pathParts) {
    const result = _.compact(pathParts).join('/').replace(/\/{2,}/g, '/');
    return result || '.';
}
