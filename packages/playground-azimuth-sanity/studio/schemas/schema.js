// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator';

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type';

import action from './action';
import person from './person';
import blog_category from './blog_category';
import landing from './landing';
import section_contact from './section_contact';
import section_content from './section_content';
import section_cta from './section_cta';
import section_faq from './section_faq';
import faq_item from './faq_item';
import section_features from './section_features';
import feature_item from './feature_item';
import section_hero from './section_hero';
import section_posts from './section_posts';
import section_pricing from './section_pricing';
import pricing_plan from './pricing_plan';
import section_reviews from './section_reviews';
import review_item from './review_item';
import site_config from './site_config';
import header from './header';
import footer from './footer';
import page from './page';
import blog from './blog';
import post from './post';

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'azimuth',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    landing,
    page,
    blog,
    post,
    action,
    person,
    blog_category,
    section_contact,
    section_content,
    section_cta,
    section_faq,
    faq_item,
    section_features,
    feature_item,
    section_hero,
    section_posts,
    section_pricing,
    pricing_plan,
    section_reviews,
    review_item,
    site_config,
    header,
    footer
  ])
});
