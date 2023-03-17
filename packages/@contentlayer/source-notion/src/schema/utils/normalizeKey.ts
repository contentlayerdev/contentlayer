import slugify from "slugify";

export const normalizeKey = (key: string) => {
    const slugified = slugify(key);
    return slugified.toLowerCase().replace(/[-_][a-z0-9]/g, (group) => group.slice(-1).toUpperCase());
}