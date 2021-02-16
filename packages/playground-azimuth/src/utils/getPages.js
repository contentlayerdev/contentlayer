import _ from 'lodash';

/**
 * Get all the pages located under the provided `urlPath`, not including the
 * index page. I.e.: All pages having their URLs start with `urlPath` excluding
 * the page having its URL equal to `urlPath`.
 *
 * @example
 * pages => [
 *   {'__metadata.urlPath': '/'},
 *   {'__metadata.urlPath': '/about'},
 *   {'__metadata.urlPath': '/posts'},
 *   {'__metadata.urlPath': '/posts/hello'},
 *   {'__metadata.urlPath': '/posts/world'}
 * ]
 *
 * getPages(pages, /posts')
 * => [
 *   {'__metadata.urlPath': '/posts/hello'},
 *   {'__metadata.urlPath': '/posts/world'}
 * ]
 *
 *
 * @param {Array} pages Array of page objects. All pages must have '__metadata.urlPath' field.
 * @param {string} urlPath The url path to filter pages by
 * @return {Array}
 */
export default function getPages(pages, urlPath) {
    urlPath = _.trim(urlPath, '/');
    const urlPathParts = _.split(urlPath, '/');
    return _.filter(pages, page => {
        const pageUrlPath = _.trim(_.get(page, '__metadata.urlPath'), '/');
        const pageUrlParts = _.split(pageUrlPath, '/');
        return pageUrlParts.length > urlPathParts.length && _.isEqual(pageUrlParts.slice(0, urlPathParts.length), urlPathParts);
    });
}
