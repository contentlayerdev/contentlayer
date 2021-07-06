import type { MigrationFunction } from 'contentful-migration'

const migrate: MigrationFunction = (migration) => {
  const post = migration.createContentType('post', {
    name: 'Blog Post',
    description: 'Posts on our blog',
  })

  post.createField('title', {
    name: 'Title',
    type: 'Text',
    required: true,
    localized: true,
  })

  post.createField('introduction', {
    name: 'Introduction',
    type: 'Text',
    // type: 'RichText',
    required: true,
    localized: true,
  })

  post.createField('body', {
    name: 'Introduction',
    type: 'Text',
    // type: 'RichText',
    required: true,
    localized: true,
  })

  post.createField('background', {
    name: 'Background Image',
    type: 'Link',
    linkType: 'Asset',
  })

  post.createField('card', {
    name: 'Card Image',
    type: 'Link',
    linkType: 'Asset',
  })

  // const page = migration.createContentType('page', {
  //   description: 'Landing Page',
  //   name: 'A landing page',
  // })

  // page.createField('popular', {
  //   name: 'Whether page is popular',
  //   type: 'Boolean',
  //   required: true,
  // })

  // page.createField('isFurry', {
  //   name: 'Is this a furry animal',
  //   type: 'Boolean',
  //   required: false,
  // })

  // const tag = migration.createTag('longexampletag')
  // tag.name('long example marketing')

  // post.createField('pet', {
  //   name: 'Their pet',
  //   type: 'Link',
  //   linkType: 'Entry',
  //   required: false,
  // })

  // page.createField('name', {
  //   name: 'The name of the animal',
  //   type: 'Symbol',
  //   required: true,
  //   localized: true,
  // })
}

module.exports = migrate
