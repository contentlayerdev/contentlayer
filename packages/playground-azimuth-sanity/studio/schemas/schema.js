// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

// Import user defined schema types
import config from './config.js';
import header from './header.js';
import footer from './footer.js';
import footer_form from './footer_form.js';
import footer_nav from './footer_nav.js';
import footer_text from './footer_text.js';
import person from './person.js';
import landing from './landing.js';
import blog from './blog.js';
import page from './page.js';
import post from './post.js';
import section_content from './section_content.js';
import section_cta from './section_cta.js';
import section_faq from './section_faq.js';
import faq_item from './faq_item.js';
import section_features from './section_features.js';
import feature_item from './feature_item.js';
import section_hero from './section_hero.js';
import section_posts from './section_posts.js';
import section_pricing from './section_pricing.js';
import pricing_plan from './pricing_plan.js';
import section_reviews from './section_reviews.js';
import review_item from './review_item.js';
import section_contact from './section_contact.js';
import action from './action.js';
import form_field from './form_field.js';
import stackbit_page_meta from './stackbit_page_meta.js';

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    /* Your types here! */
    config,
    header,
    footer,
    footer_form,
    footer_nav,
    footer_text,
    person,
    landing,
    blog,
    page,
    post,
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
    section_contact,
    action,
    form_field,
    stackbit_page_meta
    ])
})
