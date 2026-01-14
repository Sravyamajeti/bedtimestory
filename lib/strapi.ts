import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export async function fetchAPI(
    path: string,
    urlParamsObject = {},
    options = {}
) {
    // Merge default and user options
    const mergedOptions = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        ...options,
    };

    // Build request URL
    const queryString = qs.stringify(urlParamsObject, { arrayFormat: 'brackets' });
    const requestUrl = `${STRAPI_URL}/api${path}${queryString ? `?${queryString}` : ''}`;

    // Trigger API call
    try {
        const response = await fetch(requestUrl, mergedOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching from Strapi: ${error}`);
        return null;
    }
}

export async function getBlogPosts(page = 1, pageSize = 12, filters = {}) {
    const urlParamsObject = {
        populate: ['coverImage', 'category', 'author.avatar'],
        sort: ['publishedAt:desc'],
        pagination: {
            page,
            pageSize,
        },
        filters,
    };
    return await fetchAPI('/articles', urlParamsObject);
}

export async function getBlogPostBySlug(slug: string) {
    const urlParamsObject = {
        filters: { slug: { $eq: slug } },
        populate: ['coverImage', 'category', 'author.avatar'],
    };
    const data = await fetchAPI('/articles', urlParamsObject);
    return data?.data?.[0] || null;
}

export async function getCategories() {
    const urlParamsObject = {
        sort: ['name:asc'],
    };
    return await fetchAPI('/categories', urlParamsObject);
}

// Media helper to get full URL
export function getStrapiMedia(url: string | null) {
    if (url == null) {
        return null;
    }

    // Return the full URL if the media is hosted on an external provider
    if (url.startsWith('http') || url.startsWith('//')) {
        return url;
    }

    // Otherwise prepend the URL path with the Strapi URL
    return `${STRAPI_URL}${url}`;
}
