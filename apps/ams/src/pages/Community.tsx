import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, ThumbsUp, Flag, Pin } from 'lucide-react';
import { useCommunityPosts, useCommunityComments, useCommunityStats } from '@/hooks/useCommunity';

export default function Community() {
  const { data: posts, isLoading } = useCommunityPosts();
  const { data: comments } = useCommunityComments();
  const stats = useCommunityStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">Posts, Kommentare und Moderation</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Posts</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">{stats.pinnedPosts} angepinnt</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kommentare</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Likes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gemeldet</CardTitle>
              <Flag className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.flaggedComments}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="posts">Posts ({posts?.length || 0})</TabsTrigger>
            <TabsTrigger value="comments">Kommentare ({comments?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Titel</th>
                    <th className="p-3 text-left text-sm font-medium">Kategorie</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-right text-sm font-medium">Likes</th>
                    <th className="p-3 text-right text-sm font-medium">Kommentare</th>
                    <th className="p-3 text-center text-sm font-medium">Angepinnt</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : posts?.map((post) => (
                    <tr key={post.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium truncate max-w-[200px]">{post.title || '–'}</td>
                      <td className="p-3"><Badge variant="outline">{post.category || '–'}</Badge></td>
                      <td className="p-3"><Badge variant="outline">{post.status || '–'}</Badge></td>
                      <td className="p-3 text-right">{post.like_count || 0}</td>
                      <td className="p-3 text-right">{post.comment_count || 0}</td>
                      <td className="p-3 text-center">{post.is_pinned ? <Pin className="h-4 w-4 text-primary mx-auto" /> : '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{post.created_at ? new Date(post.created_at).toLocaleDateString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!posts || posts.length === 0) && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Posts vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Kommentar</th>
                    <th className="p-3 text-left text-sm font-medium">Post ID</th>
                    <th className="p-3 text-left text-sm font-medium">Autor</th>
                    <th className="p-3 text-center text-sm font-medium">Gemeldet</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {comments?.map((c) => (
                    <tr key={c.id} className={`border-b hover:bg-muted/50 ${c.is_flagged ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                      <td className="p-3 text-sm truncate max-w-[300px]">{c.content || '–'}</td>
                      <td className="p-3"><code className="text-xs">{c.post_id?.slice(0, 8) || '–'}...</code></td>
                      <td className="p-3"><code className="text-xs">{c.author_id?.slice(0, 8) || '–'}...</code></td>
                      <td className="p-3 text-center">
                        {c.is_flagged ? <Flag className="h-4 w-4 text-destructive mx-auto" /> : '–'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!comments || comments.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Kommentare vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
