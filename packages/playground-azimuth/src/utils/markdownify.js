import marked from 'marked';
import htmlToReact from './htmlToReact';

export default function markdownify(markdown) {
    if (!markdown) {
        return null;
    }
    return htmlToReact(marked(markdown));
};
