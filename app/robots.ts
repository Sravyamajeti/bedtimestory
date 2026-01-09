import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://bedtimestories.productmama.dev';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
