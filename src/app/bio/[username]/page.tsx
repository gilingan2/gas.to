import { BioPageDisplay } from '@/components/bio/bio-page-display'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentEpoch, parseUserAgent } from '@/lib/utils'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

// Updated dummy data with new theme structure and visibility
const DUMMY_DATA = {
  id: '123',
  title: 'John Doe - Digital Creator',
  username: 'johndoe',
  description: 'Digital creator, photographer, and tech enthusiast. Sharing my journey and connecting with amazing people around the world. Follow me for daily updates and behind-the-scenes content!',
  theme_config: {
    name: 'default',
    colors: {
      primary: '#4F46E5',
      text: '#111827',
      background: '#FFFFFF',
      darkPrimary: '#4F46E5',
      darkText: '#FFFFFF',
      darkBackground: '#111827'
    }
  },
  visibility: 'public',
  profile_image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
  social_image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
  bio_links: [
    {
      id: '1',
      title: 'My Photography Portfolio',
      url: 'https://portfolio.example.com',
      icon: 'camera',
      sort_order: 0,
      is_active: true,
    },
    {
      id: '2',
      title: 'Latest YouTube Video',
      url: 'https://youtube.com/watch?v=123',
      icon: 'video',
      sort_order: 1,
      is_active: true,
    },
    {
      id: '3',
      title: 'Photography Presets Shop',
      url: 'https://shop.example.com',
      icon: 'shopping-cart',
      sort_order: 2,
      is_active: true,
    },
    {
      id: '4',
      title: 'Tech Blog',
      url: 'https://blog.example.com',
      icon: 'book',
      sort_order: 3,
      is_active: true,
    },
    {
      id: '5',
      title: 'Join My Newsletter',
      url: 'https://newsletter.example.com',
      icon: 'mail',
      sort_order: 4,
      is_active: true,
    }
  ],
  social_links: [
    { platform: 'twitter', url: 'https://twitter.com/johndoe' },
    { platform: 'instagram', url: 'https://instagram.com/johndoe' },
    { platform: 'youtube', url: 'https://youtube.com/johndoe' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe' }
  ]
}

export default async function BioPage({
  params: { username },
}: {
  params: { username: string }
}) {
  const supabase = createServerSupabaseClient()
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const referer = headersList.get('referer') || ''
  const ip = headersList.get('x-forwarded-for') || ''

  // Get bio page with all related data
  const { data: bioPage } = await supabase
    .from('bio_pages')
    .select(`
      *,
      bio_links (
        id,
        title,
        url,
        icon,
        sort_order,
        is_active
      ),
      social_links (
        id,
        platform,
        url
      )
    `)
    .eq('username', username)
    .single()

  if (!bioPage) {
    if (username === DUMMY_DATA.username) {
      // Track the page view for dummy data

      return <BioPageDisplay bioPage={{ ...bioPage, visibility: bioPage.visibility as 'public' | 'private' }} />;
    }
    notFound()
  }

  // Check visibility
  if (bioPage.visibility === 'private') {
    // You might want to check if the viewer is the owner
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== bioPage.user_id) {
      return <BioPageDisplay bioPage={{ ...bioPage, bio_links: [], social_links: [] }} />
    }
  }
  // Track the page view
  const { browser, os, device } = parseUserAgent(userAgent)
  const currentEpoch = getCurrentEpoch()
  // Create a click record for analytics
  await supabase
    .from('clicks')
    .insert([
      {
        link_id: null, // No specific link for bio page views
        bio_page_id: bioPage.id,
        ip,
        referer,
        browser,
        os,
        device,
        user_agent: userAgent,
        type: 'bio_view',
        created_at: currentEpoch
      },
    ])

  return <BioPageDisplay bioPage={bioPage} />
}