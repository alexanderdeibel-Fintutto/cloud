import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityPost {
  id: string;
  title: string | null;
  content: string | null;
  author_id: string | null;
  category: string | null;
  status: string | null;
  is_pinned: boolean | null;
  like_count: number | null;
  comment_count: number | null;
  created_at: string | null;
}

export interface CommunityComment {
  id: string;
  post_id: string | null;
  author_id: string | null;
  content: string | null;
  is_flagged: boolean | null;
  created_at: string | null;
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as CommunityPost[];
    },
  });
}

export function useCommunityComments() {
  return useQuery({
    queryKey: ['community-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as CommunityComment[];
    },
  });
}

export function useCommunityStats() {
  const { data: posts } = useCommunityPosts();
  const { data: comments } = useCommunityComments();

  return {
    totalPosts: posts?.length || 0,
    pinnedPosts: posts?.filter(p => p.is_pinned).length || 0,
    totalComments: comments?.length || 0,
    flaggedComments: comments?.filter(c => c.is_flagged).length || 0,
    totalLikes: posts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0,
    byCategory: posts?.reduce((acc, p) => {
      const cat = p.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };
}
