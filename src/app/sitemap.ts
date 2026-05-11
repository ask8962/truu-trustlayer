import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute['sitemap']> {
  const baseUrl = 'https://truu-trustlayer.vercel.app';

  // Static pages
  const staticPages: MetadataRoute['sitemap'] = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  // Dynamic profile pages — fetch all users
  try {
    const supabase = await createClient();
    const { data: users } = await supabase
      .from('users')
      .select('github_username, created_at')
      .not('github_username', 'is', null);

    if (users) {
      const profilePages: MetadataRoute['sitemap'] = users.map((user) => ({
        url: `${baseUrl}/profile/${user.github_username}`,
        lastModified: new Date(user.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
      return [...staticPages, ...profilePages];
    }
  } catch (e) {
    console.error('Sitemap generation error:', e);
  }

  return staticPages;
}
