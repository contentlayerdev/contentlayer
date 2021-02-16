import _ from 'lodash';
import getPage from './getPage';

export default function toUrl(pages, pagePath) {
    if (_.startsWith(pagePath, '#')) {
        return pagePath;
    } else {
        // remove extension
        pagePath = pagePath.replace(/\.\w+$/, '');
        const page = getPage(pages, pagePath);
        if (!page) {
            throw new Error('could not find page with path: ' + pagePath);
        }
        return page.url;
    }
}
