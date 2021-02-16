import _ from 'lodash';

/**
 * Get the page at the provided `urlPath`.
 *
 * @param {Array} pages Array of page objects. All pages must have '__metadata.urlPath' field.
 * @param {string} urlPath The url path to find the page by
 * @return {Object}
 */
export default function getPage(pages, urlPath) {
    urlPath = _.trim(urlPath, '/');
    return _.find(pages, page => {
        const pageUrlPath = _.trim(_.get(page, '__metadata.urlPath'), '/');
        return urlPath === pageUrlPath;
    });
}
