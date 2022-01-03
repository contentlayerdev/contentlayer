/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`dist/__test__/convert.spec.js TAP azimuth schema > must match snapshot 1`] = `
Object {
  "documentTypeDefMap": Object {
    "Blog": Object {
      "_tag": "DocumentTypeDef",
      "computedFields": Array [
        Object {
          "description": "The URL path of this page relative to site root. For example, the site root page would be \\"/\\", and post page would be \\"posts/new-post/\\"",
          "name": "url_path",
          "resolve": Function resolve(_),
          "type": "string",
        },
      ],
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "title": Object {
              "label": "Title",
            },
          },
          "file": "blog.md",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the page",
          "isRequired": true,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "seo",
          "nestedTypeName": "SEO",
          "type": "nested",
        },
      ],
      "isSingleton": true,
      "name": "Blog",
    },
    "Config": Object {
      "_tag": "DocumentTypeDef",
      "computedFields": Array [],
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "base_font": Object {
              "label": "Font",
            },
            "domain": Object {
              "label": "Domain",
            },
            "favicon": Object {
              "label": "Favicon",
            },
            "footer": Object {
              "label": "Footer Configuration",
            },
            "header": Object {
              "label": "Header Configuration",
            },
            "palette": Object {
              "label": "Color Palette",
            },
            "path_prefix": Object {
              "hidden": true,
              "label": "Base URL",
            },
            "title": Object {
              "label": "Title",
            },
          },
          "file": "config.json",
          "label": "Site Configuration",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "Site title",
          "isRequired": true,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The base URL of this site. Useful for sites hosted under specific path, e.g.: https://www.example.com/my-site/",
          "isRequired": true,
          "isSystemField": false,
          "name": "path_prefix",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The domain of your site, including the protocol, e.g. https://mysite.com/",
          "isRequired": false,
          "isSystemField": false,
          "name": "domain",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "A square icon that represents your website",
          "isRequired": false,
          "isSystemField": false,
          "name": "favicon",
          "type": "string",
        },
        Object {
          "default": "blue",
          "description": "The color palette of the site",
          "isRequired": true,
          "isSystemField": false,
          "name": "palette",
          "options": Array [
            "blue",
            "cyan",
            "green",
            "orange",
            "purple",
          ],
          "type": "enum",
        },
        Object {
          "default": "nunito-sans",
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "base_font",
          "options": Array [
            "fira-sans",
            "nunito-sans",
            "system-sans",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "header",
          "nestedTypeName": "Header",
          "type": "nested",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "footer",
          "nestedTypeName": "Footer",
          "type": "nested",
        },
      ],
      "isSingleton": true,
      "name": "Config",
    },
    "Landing": Object {
      "_tag": "DocumentTypeDef",
      "computedFields": Array [
        Object {
          "description": "The URL path of this page relative to site root. For example, the site root page would be \\"/\\", and post page would be \\"posts/new-post/\\"",
          "name": "url_path",
          "resolve": Function resolve(_),
          "type": "string",
        },
      ],
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "sections": Object {
              "label": "Sections",
            },
            "title": Object {
              "label": "Title",
            },
          },
          "label": "Landing Page",
          "match": Array [
            "contact.md",
            "features.md",
            "index.md",
            "pricing.md",
          ],
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the page",
          "isRequired": true,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Page sections",
          "isRequired": false,
          "isSystemField": false,
          "name": "sections",
          "of": Array [
            Object {
              "nestedTypeName": "SectionContent",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionCta",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionFaq",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionFeatures",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionHero",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionPosts",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionPricing",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionReviews",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "SectionContact",
              "type": "nested",
            },
          ],
          "type": "list_polymorphic",
          "typeField": "type",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "seo",
          "nestedTypeName": "SEO",
          "type": "nested",
        },
      ],
      "isSingleton": false,
      "name": "Landing",
    },
    "Page": Object {
      "_tag": "DocumentTypeDef",
      "computedFields": Array [
        Object {
          "description": "The URL path of this page relative to site root. For example, the site root page would be \\"/\\", and post page would be \\"posts/new-post/\\"",
          "name": "url_path",
          "resolve": Function resolve(_),
          "type": "string",
        },
      ],
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "match": Array [
            "about.md",
            "privacy-policy.md",
            "signup.md",
            "style-guide.md",
            "terms-of-service.md",
          ],
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the page",
          "isRequired": true,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The text shown below the page title",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The image shown below the page title",
          "isRequired": false,
          "isSystemField": false,
          "name": "image",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image_alt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "seo",
          "nestedTypeName": "SEO",
          "type": "nested",
        },
        Object {
          "default": undefined,
          "description": "Markdown file body",
          "isRequired": true,
          "isSystemField": true,
          "name": "body",
          "type": "markdown",
        },
      ],
      "isSingleton": false,
      "name": "Page",
    },
    "Person": Object {
      "_tag": "DocumentTypeDef",
      "computedFields": Array [],
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "folder": "authors",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "first_name",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "last_name",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "bio",
          "type": "markdown",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "photo",
          "type": "string",
        },
      ],
      "isSingleton": false,
      "name": "Person",
    },
    "Post": Object {
      "_tag": "DocumentTypeDef",
      "computedFields": Array [
        Object {
          "description": "The URL path of this page relative to site root. For example, the site root page would be \\"/\\", and post page would be \\"posts/new-post/\\"",
          "name": "url_path",
          "resolve": Function resolve(_),
          "type": "string",
        },
      ],
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "date": Object {
              "label": "Date",
            },
            "excerpt": Object {
              "label": "Excerpt",
            },
            "image": Object {
              "label": "Image",
            },
            "image_alt": Object {
              "label": "Image alt text (single post)",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "thumb_image": Object {
              "label": "Image (blog feed)",
            },
            "thumb_image_alt": Object {
              "label": "Image alt text (blog feed)",
            },
            "title": Object {
              "label": "Title",
            },
          },
          "match": "blog/**.md",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the post",
          "isRequired": true,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The text shown just below the title or the featured image",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "date",
          "type": "date",
        },
        Object {
          "default": undefined,
          "description": "Post author",
          "documentTypeName": "Person",
          "isRequired": false,
          "isSystemField": false,
          "name": "author",
          "type": "reference",
        },
        Object {
          "default": undefined,
          "description": "The excerpt of the post displayed in the blog feed",
          "isRequired": false,
          "isSystemField": false,
          "name": "excerpt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The image shown below the title",
          "isRequired": false,
          "isSystemField": false,
          "name": "image",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the featured image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image_alt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The image shown in the blog feed",
          "isRequired": false,
          "isSystemField": false,
          "name": "thumb_image",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the blog feed image",
          "isRequired": false,
          "isSystemField": false,
          "name": "thumb_image_alt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "seo",
          "nestedTypeName": "SEO",
          "type": "nested",
        },
        Object {
          "default": undefined,
          "description": "Markdown file body",
          "isRequired": true,
          "isSystemField": true,
          "name": "body",
          "type": "markdown",
        },
      ],
      "isSingleton": false,
      "name": "Post",
    },
  },
  "hash": "5b10fecfe6a09406",
  "nestedTypeDefMap": Object {
    "Action": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "has_icon": Object {
              "label": "Show icon",
            },
            "icon": Object {
              "label": "Icon",
            },
            "icon_position": Object {
              "label": "Icon position",
            },
            "label": Object {
              "label": "Label",
            },
            "new_window": Object {
              "label": "Open in new window",
            },
            "no_follow": Object {
              "label": "No follow",
            },
            "style": Object {
              "label": "Style",
            },
            "url": Object {
              "label": "URL",
            },
          },
          "labelField": "label",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "label",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "url",
          "type": "string",
        },
        Object {
          "default": "link",
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "style",
          "options": Array [
            "link",
            "primary",
            "secondary",
          ],
          "type": "enum",
        },
        Object {
          "default": false,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "has_icon",
          "type": "boolean",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "icon",
          "options": Array [
            "arrow-left",
            "arrow-right",
            "envelope",
            "facebook",
            "github",
            "instagram",
            "linkedin",
            "twitter",
            "vimeo",
            "youtube",
          ],
          "type": "enum",
        },
        Object {
          "default": "left",
          "description": "The position of the icon relative to text",
          "isRequired": false,
          "isSystemField": false,
          "name": "icon_position",
          "options": Array [
            "left",
            "right",
          ],
          "type": "enum",
        },
        Object {
          "default": false,
          "description": "Should the link open a new tab",
          "isRequired": false,
          "isSystemField": false,
          "name": "new_window",
          "type": "boolean",
        },
        Object {
          "default": false,
          "description": "Add rel=\\"nofollow\\" attribute to the link",
          "isRequired": false,
          "isSystemField": false,
          "name": "no_follow",
          "type": "boolean",
        },
      ],
      "name": "Action",
    },
    "FaqItem": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "answer": Object {
              "label": "Answer",
            },
            "question": Object {
              "label": "Question",
            },
          },
          "label": "FAQ Item",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "question",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "answer",
          "type": "markdown",
        },
      ],
      "name": "FaqItem",
    },
    "FeatureItem": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "actions": Object {
              "label": "Action Buttons",
            },
            "content": Object {
              "label": "Content",
            },
            "image": Object {
              "control": Object {
                "options": Object {},
                "type": "image-gallery",
              },
              "label": "Image",
            },
            "image_alt": Object {
              "label": "Image Alt Text",
            },
            "title": Object {
              "label": "Title",
            },
          },
          "label": "Feature Item",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Feature description",
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "markdown",
        },
        Object {
          "default": undefined,
          "description": "Feature image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the feature image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image_alt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "actions",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "FeatureItem",
    },
    "Footer": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "content": Object {
              "label": "Footer Content",
            },
            "has_nav": Object {
              "label": "Enable Horizontal Navigation",
            },
            "links": Object {
              "label": "Links",
            },
            "nav_links": Object {
              "label": "Horizontal Navigation Links",
            },
            "sections": Object {
              "label": "Sections",
            },
          },
          "label": "Footer Configuration",
          "labelField": "content",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "Footer sections",
          "isRequired": false,
          "isSystemField": false,
          "name": "sections",
          "of": Array [
            Object {
              "nestedTypeName": "FooterForm",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "FooterNav",
              "type": "nested",
            },
            Object {
              "nestedTypeName": "FooterText",
              "type": "nested",
            },
          ],
          "type": "list_polymorphic",
          "typeField": "type",
        },
        Object {
          "default": true,
          "description": "Display the horizontal navigation menu bar in the footer",
          "isRequired": false,
          "isSystemField": false,
          "name": "has_nav",
          "type": "boolean",
        },
        Object {
          "default": undefined,
          "description": "List of horizontal navigation links",
          "isRequired": false,
          "isSystemField": false,
          "name": "nav_links",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
        Object {
          "default": undefined,
          "description": "The copyright text displayed in the footer",
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "A list of links displayed in the footer",
          "isRequired": false,
          "isSystemField": false,
          "name": "links",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "Footer",
    },
    "FooterForm": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "content": Object {
              "label": "Content",
            },
            "form_action": Object {
              "label": "Form Action",
            },
            "form_fields": Object {
              "label": "Form Fields",
            },
            "form_id": Object {
              "label": "Form ID",
            },
            "hide_labels": Object {
              "label": "Hide Labels",
            },
            "submit_label": Object {
              "label": "Submit Button Label",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Footer Form",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The content of the section, appears above the form",
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "markdown",
        },
        Object {
          "default": undefined,
          "description": "A unique identifier of the form, must not contain whitespace",
          "isRequired": true,
          "isSystemField": false,
          "name": "form_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The path of your custom \\"success\\" page, if you want to replace the default success message./index.js",
          "isRequired": false,
          "isSystemField": false,
          "name": "form_action",
          "type": "string",
        },
        Object {
          "default": false,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "hide_labels",
          "type": "boolean",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "form_fields",
          "of": Object {
            "nestedTypeName": "FormField",
            "type": "nested",
          },
          "type": "list",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "submit_label",
          "type": "string",
        },
      ],
      "name": "FooterForm",
    },
    "FooterNav": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "nav_links": Object {
              "label": "Vertical Navigation Links",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Vertical Navigation",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "List of vertical navigation links",
          "isRequired": false,
          "isSystemField": false,
          "name": "nav_links",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "FooterNav",
    },
    "FooterText": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "content": Object {
              "label": "Content",
            },
            "image": Object {
              "label": "Image",
            },
            "image_alt": Object {
              "label": "Image Alt Text",
            },
            "image_url": Object {
              "label": "Image URL",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Text",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The image displayed in the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "image",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image_alt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The url of the image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image_url",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The text content of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "markdown",
        },
      ],
      "name": "FooterText",
    },
    "FormField": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "default_value": Object {
              "label": "Placeholder text or default value",
            },
            "input_type": Object {
              "label": "Type",
            },
            "is_required": Object {
              "label": "Is the field required?",
            },
            "label": Object {
              "label": "Label",
            },
            "name": Object {
              "label": "Name",
            },
            "options": Object {
              "label": "Options",
            },
          },
          "label": "Form Field",
          "labelField": "name",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "Type of the form field",
          "isRequired": true,
          "isSystemField": false,
          "name": "input_type",
          "options": Array [
            "text",
            "textarea",
            "email",
            "tel",
            "number",
            "checkbox",
            "select",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": "The name of the field, submitted with the form",
          "isRequired": true,
          "isSystemField": false,
          "name": "name",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The caption of the field, shown above the field input",
          "isRequired": false,
          "isSystemField": false,
          "name": "label",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The placeholder for textual field types or default option for select field",
          "isRequired": false,
          "isSystemField": false,
          "name": "default_value",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The list of options for select field",
          "isRequired": false,
          "isSystemField": false,
          "name": "options",
          "of": Object {
            "type": "string",
          },
          "type": "list",
        },
        Object {
          "default": false,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "is_required",
          "type": "boolean",
        },
      ],
      "name": "FormField",
    },
    "Header": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "has_nav": Object {
              "label": "Enable Navigation",
            },
            "logo_img": Object {
              "label": "Logo",
            },
            "logo_img_alt": Object {
              "label": "Logo Alt Text",
            },
            "nav_links": Object {
              "label": "Navigation Links",
            },
          },
          "label": "Header Configuration",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The logo image displayed in the header (if no logo added, the site title is displayed instead)",
          "isRequired": false,
          "isSystemField": false,
          "name": "logo_img",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the logo image",
          "isRequired": false,
          "isSystemField": false,
          "name": "logo_img_alt",
          "type": "string",
        },
        Object {
          "default": true,
          "description": "Display the navigation menu bar in the header",
          "isRequired": false,
          "isSystemField": false,
          "name": "has_nav",
          "type": "boolean",
        },
        Object {
          "default": undefined,
          "description": "List of navigation links",
          "isRequired": false,
          "isSystemField": false,
          "name": "nav_links",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "Header",
    },
    "PricingPlan": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "actions": Object {
              "label": "Action Buttons",
            },
            "details": Object {
              "label": "Details",
            },
            "highlight": Object {
              "label": "Highlight",
            },
            "price": Object {
              "label": "Price",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
          },
          "label": "Pricing Plan",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "price",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "details",
          "type": "markdown",
        },
        Object {
          "default": false,
          "description": "Make the plan stand out by adding a distinctive style",
          "isRequired": false,
          "isSystemField": false,
          "name": "highlight",
          "type": "boolean",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "actions",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "PricingPlan",
    },
    "ReviewItem": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "author": Object {
              "label": "Author",
            },
            "avatar": Object {
              "label": "Author Image",
            },
            "avatar_alt": Object {
              "label": "Author Image Alt Text",
            },
            "content": Object {
              "label": "Content",
            },
          },
          "label": "Review Item",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "author",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "avatar",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "avatar_alt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "string",
        },
      ],
      "name": "ReviewItem",
    },
    "SectionContact": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "background": Object {
              "label": "Background",
            },
            "content": Object {
              "label": "Content",
            },
            "form_action": Object {
              "label": "Form Action",
            },
            "form_fields": Object {
              "label": "Form Fields",
            },
            "form_id": Object {
              "label": "Form ID",
            },
            "hide_labels": Object {
              "label": "Hide labels of the form fields?",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "submit_label": Object {
              "label": "Submit Button Label",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Contact Section",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The text shown below the title",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "the content of the section, appears above the form",
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "markdown",
        },
        Object {
          "default": "gray",
          "description": "The background of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "background",
          "options": Array [
            "gray",
            "white",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": "A unique identifier of the form, must not contain whitespace",
          "isRequired": true,
          "isSystemField": false,
          "name": "form_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The path of your custom \\"success\\" page, if you want to replace the default success message./index.js",
          "isRequired": false,
          "isSystemField": false,
          "name": "form_action",
          "type": "string",
        },
        Object {
          "default": false,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "hide_labels",
          "type": "boolean",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "form_fields",
          "of": Object {
            "nestedTypeName": "FormField",
            "type": "nested",
          },
          "type": "list",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": true,
          "isSystemField": false,
          "name": "submit_label",
          "type": "string",
        },
      ],
      "name": "SectionContact",
    },
    "SectionContent": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fieldGroups": Array [
            Object {
              "label": "Content",
              "name": "content",
            },
            Object {
              "label": "Design",
              "name": "design",
            },
          ],
          "fields": Object {
            "actions": Object {
              "label": "Action Buttons",
            },
            "background": Object {
              "control": Object {
                "options": Object {},
                "type": "image-gallery",
              },
              "group": "design",
              "label": "Background",
            },
            "content": Object {
              "group": "content",
              "label": "Content",
            },
            "image": Object {
              "control": Object {
                "options": Object {},
                "type": "image-gallery",
              },
              "group": "content",
              "label": "Image",
            },
            "image_alt": Object {
              "group": "content",
              "label": "Image Alt Text",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Content Section",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The text content of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "markdown",
        },
        Object {
          "default": undefined,
          "description": "The image of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "image",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the section image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image_alt",
          "type": "string",
        },
        Object {
          "default": "gray",
          "description": "The background of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "background",
          "options": Array [
            "gray",
            "white",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "actions",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "SectionContent",
    },
    "SectionCta": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "actions": Object {
              "label": "Action Buttons",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Call to Action Section",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The subtitle of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "actions",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "SectionCta",
    },
    "SectionFaq": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "background": Object {
              "label": "Background",
            },
            "faq_items": Object {
              "label": "FAQ Items",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Contact Section",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The subtitle of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": "gray",
          "description": "The background of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "background",
          "options": Array [
            "gray",
            "white",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "faq_items",
          "of": Object {
            "nestedTypeName": "FaqItem",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "SectionFaq",
    },
    "SectionFeatures": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "background": Object {
              "label": "Background",
            },
            "features": Object {
              "label": "Features",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Features Section",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The subtitle of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": "gray",
          "description": "The background of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "background",
          "options": Array [
            "gray",
            "white",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "features",
          "of": Object {
            "nestedTypeName": "FeatureItem",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "SectionFeatures",
    },
    "SectionHero": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "actions": Object {
              "label": "Action Buttons",
            },
            "content": Object {
              "label": "Content",
            },
            "image": Object {
              "control": Object {
                "options": Object {},
                "type": "image-gallery",
              },
              "label": "Image",
            },
            "image_alt": Object {
              "label": "Image Alt Text",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Hero Section",
          "labelField": "title",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The text content of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "content",
          "type": "markdown",
        },
        Object {
          "default": undefined,
          "description": "The image of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "image",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The alt text of the section image",
          "isRequired": false,
          "isSystemField": false,
          "name": "image_alt",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "actions",
          "of": Object {
            "nestedTypeName": "Action",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "SectionHero",
    },
    "SectionPosts": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "background": Object {
              "label": "Background",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Posts List",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The subtitle of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": "gray",
          "description": "The background of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "background",
          "options": Array [
            "gray",
            "white",
          ],
          "type": "enum",
        },
      ],
      "name": "SectionPosts",
    },
    "SectionPricing": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "background": Object {
              "label": "Background",
            },
            "pricing_plans": Object {
              "label": "Pricing Plans",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Pricing Section",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The subtitle of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": "gray",
          "description": "The background of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "background",
          "options": Array [
            "gray",
            "white",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "pricing_plans",
          "of": Object {
            "nestedTypeName": "PricingPlan",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "SectionPricing",
    },
    "SectionReviews": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "background": Object {
              "label": "Background",
            },
            "reviews": Object {
              "label": "Reviews",
            },
            "section_id": Object {
              "label": "Section ID",
            },
            "subtitle": Object {
              "label": "Subtitle",
            },
            "title": Object {
              "label": "Title",
            },
            "type": Object {
              "label": "Section type",
            },
          },
          "label": "Reviews Section",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "A unique identifier of the section, must not contain whitespace",
          "isRequired": false,
          "isSystemField": false,
          "name": "section_id",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The title of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "Needed for contentlayer for polymorphic list types",
          "isRequired": true,
          "isSystemField": false,
          "name": "type",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The subtitle of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "subtitle",
          "type": "string",
        },
        Object {
          "default": "gray",
          "description": "The background of the section",
          "isRequired": false,
          "isSystemField": false,
          "name": "background",
          "options": Array [
            "gray",
            "white",
          ],
          "type": "enum",
        },
        Object {
          "default": undefined,
          "description": undefined,
          "isRequired": false,
          "isSystemField": false,
          "name": "reviews",
          "of": Object {
            "nestedTypeName": "ReviewItem",
            "type": "nested",
          },
          "type": "list",
        },
      ],
      "name": "SectionReviews",
    },
    "SEO": Object {
      "_tag": "NestedTypeDef",
      "description": undefined,
      "extensions": Object {
        "stackbit": Object {
          "fields": Object {
            "description": Object {
              "label": "Description",
            },
            "extra": Object {
              "label": "Extra",
            },
            "robots": Object {
              "label": "Robots",
            },
            "title": Object {
              "label": "Title",
            },
          },
          "label": "Page meta data",
        },
      },
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The page title that goes into the <title> tag",
          "isRequired": false,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The page description that goes into the <meta name=\\"description\\"> tag",
          "isRequired": false,
          "isSystemField": false,
          "name": "description",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The items that go into the <meta name=\\"robots\\"> tag",
          "isRequired": false,
          "isSystemField": false,
          "name": "robots",
          "of": Object {
            "options": Array [
              "all",
              "index",
              "follow",
              "noindex",
              "nofollow",
              "noimageindex",
              "notranslate",
              "none",
            ],
            "type": "enum",
          },
          "type": "list",
        },
        Object {
          "default": undefined,
          "description": "Additional definition for specific meta tags such as open-graph, twitter, etc.",
          "isRequired": false,
          "isSystemField": false,
          "name": "extra",
          "of": Object {
            "type": "nested_unnamed",
            "typeDef": Object {
              "_tag": "NestedUnnamedTypeDef",
              "extensions": Object {},
              "fieldDefs": Array [
                Object {
                  "default": undefined,
                  "description": undefined,
                  "isRequired": false,
                  "isSystemField": false,
                  "name": "name",
                  "type": "string",
                },
                Object {
                  "default": undefined,
                  "description": undefined,
                  "isRequired": false,
                  "isSystemField": false,
                  "name": "value",
                  "type": "string",
                },
                Object {
                  "default": "name",
                  "description": undefined,
                  "isRequired": false,
                  "isSystemField": false,
                  "name": "keyName",
                  "type": "string",
                },
                Object {
                  "default": undefined,
                  "description": undefined,
                  "isRequired": false,
                  "isSystemField": false,
                  "name": "relativeUrl",
                  "type": "boolean",
                },
              ],
            },
          },
          "type": "list",
        },
      ],
      "name": "SEO",
    },
  },
}
`

exports[`dist/__test__/convert.spec.js TAP azimuth schema > must match snapshot 2`] = `
stackbitVersion: ~0.3.0
nodeVersion: ">=12"
models:
  Blog:
    label: Blog
    labelField: null
    description: null
    fields:
      - name: title
        required: true
        const: null
        default: null
        description: The title of the page
        hidden: null
        label: Title
        type: string
      - name: seo
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: model
        models:
          - SEO
    match: null
    folder: null
    file: blog.md
    type: page
    singleInstance: true
  Landing:
    label: Landing Page
    labelField: null
    description: null
    fields:
      - name: title
        required: true
        const: null
        default: null
        description: The title of the page
        hidden: null
        label: Title
        type: string
      - name: sections
        required: false
        const: null
        default: null
        description: Page sections
        hidden: null
        label: Sections
        type: list
        items:
          type: model
          models:
            - SectionContent
            - SectionCta
            - SectionFaq
            - SectionFeatures
            - SectionHero
            - SectionPosts
            - SectionPricing
            - SectionReviews
            - SectionContact
      - name: seo
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: model
        models:
          - SEO
    match:
      - contact.md
      - features.md
      - index.md
      - pricing.md
    folder: null
    file: null
    type: page
    singleInstance: false
  Page:
    label: Page
    labelField: null
    description: null
    fields:
      - name: title
        required: true
        const: null
        default: null
        description: The title of the page
        hidden: null
        label: null
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The text shown below the page title
        hidden: null
        label: null
        type: string
      - name: image
        required: false
        const: null
        default: null
        description: The image shown below the page title
        hidden: null
        label: null
        type: string
      - name: image_alt
        required: false
        const: null
        default: null
        description: The alt text of the image
        hidden: null
        label: null
        type: string
      - name: seo
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: model
        models:
          - SEO
      - name: body
        required: true
        const: null
        default: null
        description: Markdown file body
        hidden: null
        label: null
        type: markdown
    match:
      - about.md
      - privacy-policy.md
      - signup.md
      - style-guide.md
      - terms-of-service.md
    folder: null
    file: null
    type: page
    singleInstance: false
  Post:
    label: Post
    labelField: null
    description: null
    fields:
      - name: title
        required: true
        const: null
        default: null
        description: The title of the post
        hidden: null
        label: Title
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The text shown just below the title or the featured image
        hidden: null
        label: Subtitle
        type: string
      - name: date
        required: true
        const: null
        default: null
        description: null
        hidden: null
        label: Date
        type: date
      - name: author
        required: false
        const: null
        default: null
        description: Post author
        hidden: null
        label: null
        type: reference
        models:
          - Person
      - name: excerpt
        required: false
        const: null
        default: null
        description: The excerpt of the post displayed in the blog feed
        hidden: null
        label: Excerpt
        type: string
      - name: image
        required: false
        const: null
        default: null
        description: The image shown below the title
        hidden: null
        label: Image
        type: string
      - name: image_alt
        required: false
        const: null
        default: null
        description: The alt text of the featured image
        hidden: null
        label: Image alt text (single post)
        type: string
      - name: thumb_image
        required: false
        const: null
        default: null
        description: The image shown in the blog feed
        hidden: null
        label: Image (blog feed)
        type: string
      - name: thumb_image_alt
        required: false
        const: null
        default: null
        description: The alt text of the blog feed image
        hidden: null
        label: Image alt text (blog feed)
        type: string
      - name: seo
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: model
        models:
          - SEO
      - name: body
        required: true
        const: null
        default: null
        description: Markdown file body
        hidden: null
        label: null
        type: markdown
    match: blog/**.md
    folder: null
    file: null
    type: page
    singleInstance: false
  Config:
    label: Site Configuration
    labelField: null
    description: null
    fields:
      - name: title
        required: true
        const: null
        default: null
        description: Site title
        hidden: null
        label: Title
        type: string
      - name: path_prefix
        required: true
        const: null
        default: null
        description: "The base URL of this site. Useful for sites hosted under specific
          path, e.g.: https://www.example.com/my-site/"
        hidden: true
        label: Base URL
        type: string
      - name: domain
        required: false
        const: null
        default: null
        description: The domain of your site, including the protocol, e.g.
          https://mysite.com/
        hidden: null
        label: Domain
        type: string
      - name: favicon
        required: false
        const: null
        default: null
        description: A square icon that represents your website
        hidden: null
        label: Favicon
        type: string
      - name: palette
        required: true
        const: null
        default: blue
        description: The color palette of the site
        hidden: null
        label: Color Palette
        type: enum
        options:
          - blue
          - cyan
          - green
          - orange
          - purple
      - name: base_font
        required: true
        const: null
        default: nunito-sans
        description: null
        hidden: null
        label: Font
        type: enum
        options:
          - fira-sans
          - nunito-sans
          - system-sans
      - name: header
        required: true
        const: null
        default: null
        description: null
        hidden: null
        label: Header Configuration
        type: model
        models:
          - Header
      - name: footer
        required: true
        const: null
        default: null
        description: null
        hidden: null
        label: Footer Configuration
        type: model
        models:
          - Footer
    match: null
    folder: null
    file: config.json
    type: data
    singleInstance: true
  Person:
    label: Person
    labelField: null
    description: null
    fields:
      - name: first_name
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: string
      - name: last_name
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: string
      - name: bio
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: markdown
      - name: photo
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: null
        type: string
    match: null
    folder: authors
    file: null
    type: data
    singleInstance: false
  SEO:
    label: Page meta data
    labelField: null
    description: null
    fields:
      - name: title
        required: false
        const: null
        default: null
        description: The page title that goes into the <title> tag
        hidden: null
        label: Title
        type: string
      - name: description
        required: false
        const: null
        default: null
        description: The page description that goes into the <meta name="description"> tag
        hidden: null
        label: Description
        type: string
      - name: robots
        required: false
        const: null
        default: null
        description: The items that go into the <meta name="robots"> tag
        hidden: null
        label: Robots
        type: list
        items:
          type: enum
          options:
            - all
            - index
            - follow
            - noindex
            - nofollow
            - noimageindex
            - notranslate
            - none
      - name: extra
        required: false
        const: null
        default: null
        description: Additional definition for specific meta tags such as open-graph,
          twitter, etc.
        hidden: null
        label: Extra
        type: list
        items:
          type: object
          fields:
            - name: name
              required: false
              const: null
              default: null
              description: null
              hidden: null
              label: null
              type: string
            - name: value
              required: false
              const: null
              default: null
              description: null
              hidden: null
              label: null
              type: string
            - name: keyName
              required: false
              const: null
              default: name
              description: null
              hidden: null
              label: null
              type: string
            - name: relativeUrl
              required: false
              const: null
              default: null
              description: null
              hidden: null
              label: null
              type: boolean
    match: null
    folder: null
    file: null
    type: object
  Header:
    label: Header Configuration
    labelField: null
    description: null
    fields:
      - name: logo_img
        required: false
        const: null
        default: null
        description: The logo image displayed in the header (if no logo added, the site
          title is displayed instead)
        hidden: null
        label: Logo
        type: string
      - name: logo_img_alt
        required: false
        const: null
        default: null
        description: The alt text of the logo image
        hidden: null
        label: Logo Alt Text
        type: string
      - name: has_nav
        required: false
        const: null
        default: true
        description: Display the navigation menu bar in the header
        hidden: null
        label: Enable Navigation
        type: boolean
      - name: nav_links
        required: false
        const: null
        default: null
        description: List of navigation links
        hidden: null
        label: Navigation Links
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  Action:
    label: Action
    labelField: label
    description: null
    fields:
      - name: label
        required: true
        const: null
        default: null
        description: null
        hidden: null
        label: Label
        type: string
      - name: url
        required: true
        const: null
        default: null
        description: null
        hidden: null
        label: URL
        type: string
      - name: style
        required: false
        const: null
        default: link
        description: null
        hidden: null
        label: Style
        type: enum
        options:
          - link
          - primary
          - secondary
      - name: has_icon
        required: false
        const: null
        default: false
        description: null
        hidden: null
        label: Show icon
        type: boolean
      - name: icon
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Icon
        type: enum
        options:
          - arrow-left
          - arrow-right
          - envelope
          - facebook
          - github
          - instagram
          - linkedin
          - twitter
          - vimeo
          - youtube
      - name: icon_position
        required: false
        const: null
        default: left
        description: The position of the icon relative to text
        hidden: null
        label: Icon position
        type: enum
        options:
          - left
          - right
      - name: new_window
        required: false
        const: null
        default: false
        description: Should the link open a new tab
        hidden: null
        label: Open in new window
        type: boolean
      - name: no_follow
        required: false
        const: null
        default: false
        description: Add rel="nofollow" attribute to the link
        hidden: null
        label: No follow
        type: boolean
    match: null
    folder: null
    file: null
    type: object
  Footer:
    label: Footer Configuration
    labelField: content
    description: null
    fields:
      - name: sections
        required: false
        const: null
        default: null
        description: Footer sections
        hidden: null
        label: Sections
        type: list
        items:
          type: model
          models:
            - FooterForm
            - FooterNav
            - FooterText
      - name: has_nav
        required: false
        const: null
        default: true
        description: Display the horizontal navigation menu bar in the footer
        hidden: null
        label: Enable Horizontal Navigation
        type: boolean
      - name: nav_links
        required: false
        const: null
        default: null
        description: List of horizontal navigation links
        hidden: null
        label: Horizontal Navigation Links
        type: list
        items:
          type: model
          models:
            - Action
      - name: content
        required: false
        const: null
        default: null
        description: The copyright text displayed in the footer
        hidden: null
        label: Footer Content
        type: string
      - name: links
        required: false
        const: null
        default: null
        description: A list of links displayed in the footer
        hidden: null
        label: Links
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  FooterForm:
    label: Footer Form
    labelField: title
    description: null
    fields:
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: content
        required: false
        const: null
        default: null
        description: The content of the section, appears above the form
        hidden: null
        label: Content
        type: markdown
      - name: form_id
        required: true
        const: null
        default: null
        description: A unique identifier of the form, must not contain whitespace
        hidden: null
        label: Form ID
        type: string
      - name: form_action
        required: false
        const: null
        default: null
        description: The path of your custom "success" page, if you want to replace the
          default success message./index.js
        hidden: null
        label: Form Action
        type: string
      - name: hide_labels
        required: false
        const: null
        default: false
        description: null
        hidden: null
        label: Hide Labels
        type: boolean
      - name: form_fields
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Form Fields
        type: list
        items:
          type: model
          models:
            - FormField
      - name: submit_label
        required: true
        const: null
        default: null
        description: null
        hidden: null
        label: Submit Button Label
        type: string
    match: null
    folder: null
    file: null
    type: object
  FormField:
    label: Form Field
    labelField: name
    description: null
    fields:
      - name: input_type
        required: true
        const: null
        default: null
        description: Type of the form field
        hidden: null
        label: Type
        type: enum
        options:
          - text
          - textarea
          - email
          - tel
          - number
          - checkbox
          - select
      - name: name
        required: true
        const: null
        default: null
        description: The name of the field, submitted with the form
        hidden: null
        label: Name
        type: string
      - name: label
        required: false
        const: null
        default: null
        description: The caption of the field, shown above the field input
        hidden: null
        label: Label
        type: string
      - name: default_value
        required: false
        const: null
        default: null
        description: The placeholder for textual field types or default option for
          select field
        hidden: null
        label: Placeholder text or default value
        type: string
      - name: options
        required: false
        const: null
        default: null
        description: The list of options for select field
        hidden: null
        label: Options
        type: list
        items:
          type: string
      - name: is_required
        required: false
        const: null
        default: false
        description: null
        hidden: null
        label: Is the field required?
        type: boolean
    match: null
    folder: null
    file: null
    type: object
  FooterNav:
    label: Vertical Navigation
    labelField: title
    description: null
    fields:
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: nav_links
        required: false
        const: null
        default: null
        description: List of vertical navigation links
        hidden: null
        label: Vertical Navigation Links
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  FooterText:
    label: Text
    labelField: title
    description: null
    fields:
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: image
        required: false
        const: null
        default: null
        description: The image displayed in the section
        hidden: null
        label: Image
        type: string
      - name: image_alt
        required: false
        const: null
        default: null
        description: The alt text of the image
        hidden: null
        label: Image Alt Text
        type: string
      - name: image_url
        required: false
        const: null
        default: null
        description: The url of the image
        hidden: null
        label: Image URL
        type: string
      - name: content
        required: false
        const: null
        default: null
        description: The text content of the section
        hidden: null
        label: Content
        type: markdown
    match: null
    folder: null
    file: null
    type: object
  SectionContent:
    label: Content Section
    labelField: title
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: content
        required: false
        const: null
        default: null
        description: The text content of the section
        hidden: null
        label: Content
        type: markdown
      - name: image
        required: false
        const: null
        default: null
        description: The image of the section
        hidden: null
        label: Image
        type: string
      - name: image_alt
        required: false
        const: null
        default: null
        description: The alt text of the section image
        hidden: null
        label: Image Alt Text
        type: string
      - name: background
        required: false
        const: null
        default: gray
        description: The background of the section
        hidden: null
        label: Background
        type: enum
        options:
          - gray
          - white
      - name: actions
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Action Buttons
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  SectionCta:
    label: Call to Action Section
    labelField: title
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The subtitle of the section
        hidden: null
        label: Subtitle
        type: string
      - name: actions
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Action Buttons
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  SectionFaq:
    label: Contact Section
    labelField: title
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The subtitle of the section
        hidden: null
        label: Subtitle
        type: string
      - name: background
        required: false
        const: null
        default: gray
        description: The background of the section
        hidden: null
        label: Background
        type: enum
        options:
          - gray
          - white
      - name: faq_items
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: FAQ Items
        type: list
        items:
          type: model
          models:
            - FaqItem
    match: null
    folder: null
    file: null
    type: object
  FaqItem:
    label: FAQ Item
    labelField: null
    description: null
    fields:
      - name: question
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Question
        type: string
      - name: answer
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Answer
        type: markdown
    match: null
    folder: null
    file: null
    type: object
  SectionFeatures:
    label: Features Section
    labelField: title
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The subtitle of the section
        hidden: null
        label: Subtitle
        type: string
      - name: background
        required: false
        const: null
        default: gray
        description: The background of the section
        hidden: null
        label: Background
        type: enum
        options:
          - gray
          - white
      - name: features
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Features
        type: list
        items:
          type: model
          models:
            - FeatureItem
    match: null
    folder: null
    file: null
    type: object
  FeatureItem:
    label: Feature Item
    labelField: title
    description: null
    fields:
      - name: title
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Title
        type: string
      - name: content
        required: false
        const: null
        default: null
        description: Feature description
        hidden: null
        label: Content
        type: markdown
      - name: image
        required: false
        const: null
        default: null
        description: Feature image
        hidden: null
        label: Image
        type: string
      - name: image_alt
        required: false
        const: null
        default: null
        description: The alt text of the feature image
        hidden: null
        label: Image Alt Text
        type: string
      - name: actions
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Action Buttons
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  SectionHero:
    label: Hero Section
    labelField: title
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: content
        required: false
        const: null
        default: null
        description: The text content of the section
        hidden: null
        label: Content
        type: markdown
      - name: image
        required: false
        const: null
        default: null
        description: The image of the section
        hidden: null
        label: Image
        type: string
      - name: image_alt
        required: false
        const: null
        default: null
        description: The alt text of the section image
        hidden: null
        label: Image Alt Text
        type: string
      - name: actions
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Action Buttons
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  SectionPosts:
    label: Posts List
    labelField: null
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The subtitle of the section
        hidden: null
        label: Subtitle
        type: string
      - name: background
        required: false
        const: null
        default: gray
        description: The background of the section
        hidden: null
        label: Background
        type: enum
        options:
          - gray
          - white
    match: null
    folder: null
    file: null
    type: object
  SectionPricing:
    label: Pricing Section
    labelField: null
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The subtitle of the section
        hidden: null
        label: Subtitle
        type: string
      - name: background
        required: false
        const: null
        default: gray
        description: The background of the section
        hidden: null
        label: Background
        type: enum
        options:
          - gray
          - white
      - name: pricing_plans
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Pricing Plans
        type: list
        items:
          type: model
          models:
            - PricingPlan
    match: null
    folder: null
    file: null
    type: object
  PricingPlan:
    label: Pricing Plan
    labelField: title
    description: null
    fields:
      - name: title
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Title
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Subtitle
        type: string
      - name: price
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Price
        type: string
      - name: details
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Details
        type: markdown
      - name: highlight
        required: false
        const: null
        default: false
        description: Make the plan stand out by adding a distinctive style
        hidden: null
        label: Highlight
        type: boolean
      - name: actions
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Action Buttons
        type: list
        items:
          type: model
          models:
            - Action
    match: null
    folder: null
    file: null
    type: object
  SectionReviews:
    label: Reviews Section
    labelField: null
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The subtitle of the section
        hidden: null
        label: Subtitle
        type: string
      - name: background
        required: false
        const: null
        default: gray
        description: The background of the section
        hidden: null
        label: Background
        type: enum
        options:
          - gray
          - white
      - name: reviews
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Reviews
        type: list
        items:
          type: model
          models:
            - ReviewItem
    match: null
    folder: null
    file: null
    type: object
  ReviewItem:
    label: Review Item
    labelField: null
    description: null
    fields:
      - name: author
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Author
        type: string
      - name: avatar
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Author Image
        type: string
      - name: avatar_alt
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Author Image Alt Text
        type: string
      - name: content
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Content
        type: string
    match: null
    folder: null
    file: null
    type: object
  SectionContact:
    label: Contact Section
    labelField: title
    description: null
    fields:
      - name: section_id
        required: false
        const: null
        default: null
        description: A unique identifier of the section, must not contain whitespace
        hidden: null
        label: Section ID
        type: string
      - name: title
        required: false
        const: null
        default: null
        description: The title of the section
        hidden: null
        label: Title
        type: string
      - name: type
        required: true
        const: null
        default: null
        description: Needed for contentlayer for polymorphic list types
        hidden: null
        label: Section type
        type: string
      - name: subtitle
        required: false
        const: null
        default: null
        description: The text shown below the title
        hidden: null
        label: Subtitle
        type: string
      - name: content
        required: false
        const: null
        default: null
        description: the content of the section, appears above the form
        hidden: null
        label: Content
        type: markdown
      - name: background
        required: false
        const: null
        default: gray
        description: The background of the section
        hidden: null
        label: Background
        type: enum
        options:
          - gray
          - white
      - name: form_id
        required: true
        const: null
        default: null
        description: A unique identifier of the form, must not contain whitespace
        hidden: null
        label: Form ID
        type: string
      - name: form_action
        required: false
        const: null
        default: null
        description: The path of your custom "success" page, if you want to replace the
          default success message./index.js
        hidden: null
        label: Form Action
        type: string
      - name: hide_labels
        required: false
        const: null
        default: false
        description: null
        hidden: null
        label: Hide labels of the form fields?
        type: boolean
      - name: form_fields
        required: false
        const: null
        default: null
        description: null
        hidden: null
        label: Form Fields
        type: list
        items:
          type: model
          models:
            - FormField
      - name: submit_label
        required: true
        const: null
        default: null
        description: null
        hidden: null
        label: Submit Button Label
        type: string
    match: null
    folder: null
    file: null
    type: object
pagesDir: null
dataDir: null

`

exports[`dist/__test__/convert.spec.js TAP blog schema > must match snapshot 1`] = `
Object {
  "documentTypeDefMap": Object {
    "Post": Object {
      "_tag": "DocumentTypeDef",
      "computedFields": Array [
        Object {
          "description": undefined,
          "name": "slug",
          "resolve": Function resolve(_),
          "type": "string",
        },
      ],
      "description": undefined,
      "extensions": Object {},
      "fieldDefs": Array [
        Object {
          "default": undefined,
          "description": "The title of the post",
          "isRequired": true,
          "isSystemField": false,
          "name": "title",
          "type": "string",
        },
        Object {
          "default": undefined,
          "description": "The date of the post",
          "isRequired": true,
          "isSystemField": false,
          "name": "date",
          "type": "date",
        },
        Object {
          "default": undefined,
          "description": "Markdown file body",
          "isRequired": true,
          "isSystemField": true,
          "name": "body",
          "type": "markdown",
        },
      ],
      "isSingleton": false,
      "name": "Post",
    },
  },
  "hash": "b0ef233427c259a6",
  "nestedTypeDefMap": Object {},
}
`

exports[`dist/__test__/convert.spec.js TAP blog schema > must match snapshot 2`] = `
stackbitVersion: ~0.3.0
nodeVersion: ">=12"
models:
  Post:
    label: Post
    labelField: null
    description: null
    fields:
      - name: title
        required: true
        const: null
        default: null
        description: The title of the post
        hidden: null
        label: null
        type: string
      - name: date
        required: true
        const: null
        default: null
        description: The date of the post
        hidden: null
        label: null
        type: date
      - name: body
        required: true
        const: null
        default: null
        description: Markdown file body
        hidden: null
        label: null
        type: markdown
    match: null
    folder: null
    file: null
    type: data
    singleInstance: false
pagesDir: null
dataDir: null

`
