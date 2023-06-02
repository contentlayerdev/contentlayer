import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';
import { getPageFromSlug, getPagePaths } from '../utils/content.js';

export async function getStaticPaths() {
    const paths = await getPagePaths();
    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const slug = '/' + (params?.slug ?? ['']).join('/');
    const page = await getPageFromSlug(slug);
    return { props: { page } };
}

const componentMap = {
    hero: Hero,
    stats: Stats
};

export default function ComposablePage({ page }) {
    return (
        <div>
            {(page.sections || []).map((section, idx) => {
                const Component = componentMap[section.type];
                return <Component key={idx} {...section} />;
            })}
        </div>
    );
}
