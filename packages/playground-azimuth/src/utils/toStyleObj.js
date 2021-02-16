import _ from "lodash";

export default function toStyleObj(styleAttr) {
    return styleAttr.split(';').reduce((accumulator, pair) => {
        pair = pair.trim();
        if (_.isEmpty(pair)) {
            return accumulator;
        }
        let index = pair.indexOf(':');
        if (index === -1) {
            throw 'could not split style attribute into names and values';
        }
        let name = _.camelCase(pair.substring(0, index).trim());
        accumulator[name] = pair.substring(index + 1).trim();
        return accumulator;
    }, {});
}
