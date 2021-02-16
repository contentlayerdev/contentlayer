var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// src/examples/azimuth/schema/index.ts
__export(exports, {
  default: () => schema_default
});

// ../sourcebit-sdk/src/schema.ts
var defineObject = (_) => _;
var defineDocument = (_) => _;
var defineSchema = (_) => _;

// src/lib/utils.ts
var sluggify = (_) => _;

// src/examples/azimuth/schema/documents/blog.ts
var blog = defineDocument({
  name: "blog",
  label: "Blog",
  urlPath: (doc) => `/blog/${sluggify(doc.title)}`,
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the page",
      required: true
    },
    {
      type: "string",
      name: "meta_title",
      label: "Meta Title",
      description: "The meta title of the page (recommended length is 50\u201360 characters)"
    },
    {
      type: "string",
      name: "meta_description",
      label: "Meta Description",
      description: "The meta description of the page (recommended length is 50\u2013160 characters)"
    },
    {
      type: "string",
      name: "canonical_url",
      label: "Canonical URL",
      description: "The canonical url of the page"
    },
    {
      type: "boolean",
      name: "no_index",
      label: "No Index",
      default: false,
      description: "Tell search engines not to index this page"
    }
  ]
});

// src/examples/azimuth/schema/objects/action.ts
var action = defineObject({
  name: "action",
  label: "Section",
  labelField: "title",
  fields: [
    {
      type: "string",
      name: "section_id",
      label: "Section ID",
      description: "A unique identifier of the section, must not contain whitespace"
    },
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the section"
    },
    {
      type: "string",
      name: "title2",
      label: "Title",
      description: "The title of the section"
    }
  ]
});

// src/examples/azimuth/schema/objects/form_field.ts
var form_field = defineObject({
  name: "form_field",
  label: "Form Field",
  labelField: "name",
  fields: [
    {
      type: "enum",
      name: "input_type",
      label: "Type",
      options: [
        "text",
        "textarea",
        "email",
        "tel",
        "number",
        "checkbox",
        "select"
      ],
      description: "Type of the form field",
      required: true
    },
    {
      type: "string",
      name: "name",
      label: "Name",
      description: "The name of the field, submitted with the form",
      required: true
    },
    {
      type: "string",
      name: "label",
      label: "Label",
      description: "The caption of the field, shown above the field input"
    },
    {
      type: "string",
      name: "default_value",
      label: "Placeholder text or default value",
      description: "The placeholder for textual field types or default option for select field"
    },
    {
      type: "list",
      name: "options",
      label: "Options",
      description: "The list of options for select field",
      items: {type: "string"}
    },
    {
      type: "boolean",
      name: "is_required",
      label: "Is the field required?",
      default: false
    }
  ]
});

// src/examples/azimuth/schema/documents/config.ts
var config = defineDocument({
  name: "config",
  label: "Site Configuration",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "Site title",
      required: true
    },
    {
      type: "string",
      name: "path_prefix",
      label: "Base URL",
      description: "The base URL of this site. Useful for sites hosted under specific path, e.g.: https://www.example.com/my-site/",
      required: true,
      hidden: true
    },
    {
      type: "string",
      name: "domain",
      label: "Domain",
      description: "The domain of your site, including the protocol, e.g. https://mysite.com/"
    },
    {
      type: "image",
      name: "favicon",
      label: "Favicon",
      description: "A square icon that represents your website"
    },
    {
      type: "enum",
      name: "palette",
      label: "Color Palette",
      description: "The color palette of the site",
      options: ["blue", "cyan", "green", "orange", "purple"],
      default: "blue",
      required: true
    },
    {
      type: "enum",
      name: "base_font",
      label: "Font",
      options: ["fira-sans", "nunito-sans", "system-sans"],
      default: "nunito-sans",
      required: true
    },
    {
      type: "object",
      name: "header",
      label: "Header Configuration",
      object: () => header
    },
    {
      type: "object",
      name: "footer",
      label: "Footer Configuration",
      object: () => footer
    }
  ]
});
var header = defineObject({
  name: "header",
  label: "Header Configuration",
  fields: [
    {
      type: "image",
      name: "logo_img",
      label: "Logo",
      description: "The logo image displayed in the header (if no logo added, the site title is displayed instead)"
    },
    {
      type: "string",
      name: "logo_img_alt",
      label: "Logo Alt Text",
      description: "The alt text of the logo image"
    },
    {
      type: "boolean",
      name: "has_nav",
      label: "Enable Navigation",
      description: "Display the navigation menu bar in the header",
      default: true
    },
    {
      type: "list",
      name: "nav_links",
      label: "Navigation Links",
      description: "List of navigation links",
      items: {
        type: "object",
        object: action
      }
    }
  ]
});
var footer = defineObject({
  name: "footer",
  label: "Footer Configuration",
  labelField: "content",
  fields: [
    {
      type: "list",
      name: "sections",
      label: "Sections",
      description: "Footer sections",
      items: {
        type: "object",
        object: () => [footer_form, footer_nav, footer_text]
      }
    },
    {
      type: "boolean",
      name: "has_nav",
      label: "Enable Horizontal Navigation",
      description: "Display the horizontal navigation menu bar in the footer",
      default: true
    },
    {
      type: "object",
      name: "nav_links",
      label: "Horizontal Navigation Links",
      description: "List of horizontal navigation links",
      object: action
    },
    {
      type: "string",
      name: "content",
      label: "Footer Content",
      description: "The copyright text displayed in the footer"
    },
    {
      type: "list",
      name: "links",
      label: "Links",
      description: "A list of links displayed in the footer",
      items: {type: "object", object: action}
    }
  ]
});
var footer_form = defineObject({
  name: "footer_form",
  label: "Form",
  labelField: "title",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the section"
    },
    {
      type: "markdown",
      name: "content",
      label: "Content",
      description: "The content of the section, appears above the form"
    },
    {
      type: "string",
      name: "form_id",
      label: "Form ID",
      description: "A unique identifier of the form, must not contain whitespace",
      required: true
    },
    {
      type: "string",
      name: "form_action",
      label: "Form Action",
      description: 'The path of your custom "success" page, if you want to replace the default success message.'
    },
    {
      type: "boolean",
      name: "hide_labels",
      label: "Hide labels of the form fields?",
      default: false
    },
    {
      type: "list",
      name: "form_fields",
      label: "Form Fields",
      items: {type: "object", object: form_field}
    },
    {
      type: "string",
      name: "submit_label",
      label: "Submit Button Label",
      required: true
    }
  ]
});
var footer_nav = defineObject({
  name: "footer_nav",
  label: "Vertical Navigation",
  labelField: "title",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the section"
    },
    {
      type: "object",
      name: "nav_links",
      label: "Vertical Navigation Links",
      description: "List of vertical navigation links",
      object: action
    }
  ]
});
var footer_text = defineObject({
  name: "footer_text",
  label: "Text",
  labelField: "title",
  fields: [
    {
      type: "image",
      name: "image",
      label: "Image",
      description: "The image displayed in the section"
    },
    {
      type: "string",
      name: "image_alt",
      label: "Image Alt Text",
      description: "The alt text of the image"
    },
    {
      type: "string",
      name: "image_url",
      label: "Image URL",
      description: "The url of the image"
    },
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the section"
    },
    {
      type: "markdown",
      name: "content",
      label: "Content",
      description: "The text content of the section"
    }
  ]
});

// src/examples/azimuth/schema/documents/landing.ts
var landing = defineDocument({
  name: "landing",
  label: "Landing Page",
  urlPath: "/",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the page",
      required: true
    },
    {
      type: "string",
      name: "meta_title",
      label: "Meta Title",
      description: "The meta title of the page (recommended length is 50\u201360 characters)"
    },
    {
      type: "string",
      name: "meta_description",
      label: "Meta Description",
      description: "The meta description of the page (recommended length is 50\u2013160 characters)"
    },
    {
      type: "string",
      name: "canonical_url",
      label: "Canonical URL",
      description: "The canonical url of the page"
    },
    {
      type: "boolean",
      name: "no_index",
      label: "No Index",
      default: false,
      description: "Tell search engines not to index this page"
    },
    {
      type: "list",
      name: "sections",
      label: "Sections",
      description: "Page sections",
      items: {
        type: "object",
        labelField: "title",
        object: () => [section_content, section_cta]
      }
    }
  ]
});
var sectionBaseFields = [
  {
    type: "string",
    name: "section_id",
    label: "Section ID",
    description: "A unique identifier of the section, must not contain whitespace"
  },
  {
    type: "string",
    name: "title",
    label: "Title",
    description: "The title of the section"
  }
];
var section_content = defineObject({
  name: "section_content",
  label: "Content Section",
  labelField: "title",
  fields: [
    ...sectionBaseFields,
    {
      type: "markdown",
      name: "content",
      label: "Content",
      description: "The text content of the section"
    },
    {
      type: "image",
      name: "image",
      label: "Image",
      description: "The image of the section"
    },
    {
      type: "string",
      name: "image_alt",
      label: "Image Alt Text",
      description: "The alt text of the section image"
    },
    {
      type: "enum",
      name: "background",
      label: "Background",
      description: "The background of the section",
      options: ["gray", "white"],
      default: "gray"
    },
    {
      type: "list",
      name: "actions",
      label: "Action Buttons",
      items: {type: "object", object: action}
    }
  ]
});
var section_cta = defineObject({
  name: "section_cta",
  label: "Call to Action Section",
  labelField: "title",
  fields: [
    ...sectionBaseFields,
    {
      type: "string",
      name: "subtitle",
      label: "Subtitle",
      description: "The subtitle of the section"
    },
    {
      type: "list",
      name: "actions",
      label: "Action Buttons",
      items: {type: "object", object: action}
    }
  ]
});

// src/examples/azimuth/schema/documents/page.ts
var page = defineDocument({
  name: "page",
  label: "Page",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the page",
      required: true
    },
    {
      type: "string",
      name: "subtitle",
      label: "Subtitle",
      description: "The text shown below the page title"
    },
    {
      type: "image",
      name: "image",
      label: "Image",
      description: "The image shown below the page title"
    },
    {
      type: "string",
      name: "image_alt",
      label: "Image Alt Text",
      description: "The alt text of the image"
    },
    {
      type: "string",
      name: "meta_title",
      label: "Meta title",
      description: "The meta title of the page (recommended length is 50\u201360 characters)"
    },
    {
      type: "string",
      name: "meta_description",
      label: "Meta description",
      description: "The meta description of the page (recommended length is 50\u2013160 characters)"
    },
    {
      type: "string",
      name: "canonical_url",
      label: "Canonical URL",
      description: "The canonical url of the page"
    },
    {
      type: "boolean",
      name: "no_index",
      label: "No Index",
      default: false,
      description: "Tell search engines not to index this page"
    }
  ]
});

// src/examples/azimuth/schema/documents/person.ts
var person = defineDocument({
  name: "person",
  label: "Person",
  fields: [
    {type: "string", name: "first_name"},
    {type: "string", name: "last_name"},
    {type: "markdown", name: "bio"},
    {type: "image", name: "photo"}
  ]
});

// src/examples/azimuth/schema/documents/post.ts
var post = defineDocument({
  name: "post",
  label: "Post",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      description: "The title of the post",
      required: true
    },
    {
      type: "string",
      name: "subtitle",
      label: "Subtitle",
      description: "The text shown just below the title or the featured image"
    },
    {
      type: "date",
      name: "date",
      label: "Date",
      required: true
    },
    {
      type: "reference",
      name: "author",
      description: "Post author",
      document: person
    },
    {
      type: "string",
      name: "excerpt",
      label: "Excerpt",
      description: "The excerpt of the post displayed in the blog feed"
    },
    {
      type: "image",
      name: "image",
      label: "Image (single post)",
      description: "The image shown below the title"
    },
    {
      type: "string",
      name: "image_alt",
      label: "Image alt text (single post)",
      description: "The alt text of the featured image"
    },
    {
      type: "image",
      name: "thumb_image",
      label: "Image (blog feed)",
      description: "The image shown in the blog feed"
    },
    {
      type: "string",
      name: "thumb_image_alt",
      label: "Image alt text (blog feed)",
      description: "The alt text of the blog feed image"
    },
    {
      type: "string",
      name: "meta_title",
      label: "Meta title",
      description: "The meta title of the post (recommended length is 50\u201360 characters)"
    },
    {
      type: "string",
      name: "meta_description",
      label: "Meta description",
      description: "The meta description of the post (recommended length is 50\u2013160 characters)"
    },
    {
      type: "string",
      name: "canonical_url",
      label: "Canonical URL",
      description: "The canonical url of the post"
    },
    {
      type: "boolean",
      name: "no_index",
      label: "No Index",
      default: false,
      description: "Tell search engines not to index this post"
    }
  ]
});

// src/examples/azimuth/schema/index.ts
var schema_default = defineSchema({
  documents: [blog, config, landing, page, person, post],
  cms: "",
  ssg: ""
});
