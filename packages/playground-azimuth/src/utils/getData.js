import _ from 'lodash';

export default function getData(props, dataPath) {
    dataPath = _.trim(dataPath, '/');
    if (_.startsWith(dataPath, 'content/data/')) {
        dataPath = dataPath.replace('content/data/', '');
    }
    // remove extension
    dataPath = dataPath.replace(/\.\w+$/, '');
    const path = dataPath.split('/');
    return _.get(props, path);
}
