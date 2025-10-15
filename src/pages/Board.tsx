import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Reply, Eye, Clock, ArrowLeft, Plus, Lock, Trash2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface Post {
  id: string;
  parent_id: string | null;
  title: string | null;
  content: string;
  author_name: string;
  depth: number;
  created_at: string;
  reply_count: number;
  view_count: number;
}

const Board = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteDialog, setShowWriteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [replyToPost, setReplyToPost] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth states
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorPassword, setAuthorPassword] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  

  const parentId = searchParams.get("parent");

  useEffect(() => {
    loadPosts();
  }, [parentId]);

  useEffect(() => {
    console.log('🔍 Board: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Board: Auth state changed', { event, session: session ? 'exists' : 'null', userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session?.user);
        
        // Fetch user profile when authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    console.log('🔍 Board: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📋 Board: Initial session check', { 
        session: session ? 'exists' : 'null', 
        userId: session?.user?.id,
        error: error?.message 
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
      } else {
        setUserProfile(data);
        if (data?.display_name) {
          setAuthorName(data.display_name);
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      // 세션이 없어도 정상적으로 처리되도록 수정
      await supabase.auth.signOut();
      
      // 로컬 상태 초기화
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsLoggedIn(false);
      
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      
      // 홈 화면으로 리다이렉트
      navigate("/");
    } catch (error: any) {
      // 세션이 없는 경우에도 성공으로 처리
      console.log('Logout attempt:', error);
      
      // 로컬 상태 초기화
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsLoggedIn(false);
      
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      
      // 홈 화면으로 리다이렉트
      navigate("/");
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_thread_posts_safe", {
        p_parent_id: parentId,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast({
        title: "오류",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!content.trim()) {
      toast({
        title: "오류",
        description: "내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Check author name - only for anonymous users or if logged-in user doesn't have profile info
    const effectiveAuthorName = user ? (userProfile?.display_name || user.email || "") : authorName;
    if (!effectiveAuthorName.trim()) {
      toast({
        title: "오류", 
        description: "작성자명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Check authentication status
    if (!user) {
      // Anonymous user - require password and security key
      if (!authorPassword.trim() || authorPassword.length < 4) {
        toast({
          title: "오류",
          description: "비밀번호는 4자 이상 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      if (!securityKey.trim()) {
        toast({
          title: "오류",
          description: "보안키를 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!replyToPost && !title.trim()) {
      toast({
        title: "오류",
        description: "새 게시글은 제목이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("create_post", {
        p_parent_id: replyToPost || parentId,
        p_title: title || null,
        p_content: content,
        p_author_name: user ? (userProfile?.display_name || user.email || "") : authorName,
        p_author_password: user ? "" : authorPassword,
        p_security_key: user ? "" : securityKey,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });

      if (error) throw error;

      toast({
        title: "성공",
        description: replyToPost ? "댓글이 작성되었습니다." : "게시글이 작성되었습니다.",
      });

      // Reset form
      setTitle("");
      setContent("");
      if (!user) {
        setAuthorName("");
        setAuthorPassword("");
        setSecurityKey("");
      }
      
      setShowWriteDialog(false);
      setReplyToPost(null);
      
      // Reload posts
      loadPosts();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "오류",
        description: error.message || "게시글 작성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const incrementViewCount = async (postId: string) => {
    try {
      await supabase.rpc("increment_view_count", { post_id_param: postId });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const openReplyDialog = (postId: string) => {
    setReplyToPost(postId);
    setShowWriteDialog(true);
  };

  const openDeleteDialog = (postId: string) => {
    setDeletePostId(postId);
    setDeletePassword("");
    setShowDeleteDialog(true);
  };

  const handleDeletePost = async () => {
    const isAdmin = userProfile?.role === 'Admin';
    
    if (!deletePostId || (!isAdmin && !deletePassword.trim())) {
      toast({
        title: "오류",
        description: "비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("delete_post_admin", {
        p_post_id: deletePostId,
        p_author_password: isAdmin ? null : deletePassword,
        p_admin_user_id: isAdmin ? user?.id : null,
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "성공",
          description: "게시글이 삭제되었습니다.",
        });
        setShowDeleteDialog(false);
        setDeletePostId(null);
        setDeletePassword("");
        loadPosts();
      } else {
        toast({
          title: "오류",
          description: isAdmin ? 
            "게시글 삭제에 실패했습니다." : 
            "비밀번호가 일치하지 않습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({
        title: "오류",
        description: error.message || "게시글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const getIndentClass = (depth: number) => {
    const indents = [
      "",
      "ml-8",
      "ml-16", 
      "ml-24",
      "ml-32",
      "ml-40",
      "ml-48",
      "ml-56",
      "ml-64",
      "ml-72"
    ];
    return indents[Math.min(depth, 9)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Show login requirement if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Login Required Message */}
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
              <p className="text-muted-foreground mb-6">
                게시판의 내용을 보시려면 먼저 로그인해주세요.
              </p>
              <Link to="/auth">
                <Button className="w-full">
                  로그인하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
            
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                환영합니다, {userProfile?.display_name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
            
            <Dialog open={showWriteDialog} onOpenChange={setShowWriteDialog}>
              <DialogTrigger asChild>
                <Button variant="security" onClick={() => setReplyToPost(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  새 게시글
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {replyToPost ? "댓글 작성" : "새 게시글 작성"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {!replyToPost && (
                    <Input
                      placeholder="제목"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  )}
                  <Textarea
                    placeholder="내용을 입력하세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                  />
                  <div className="space-y-4">
                    <Input
                      placeholder="작성자명"
                      value={userProfile?.display_name || user?.email || ""}
                      disabled={true}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowWriteDialog(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSubmitPost}>
                      {replyToPost ? "댓글 작성" : "게시글 작성"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          {/* Delete Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  게시글 삭제
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {userProfile?.role === 'Admin' 
                    ? "관리자 권한으로 게시글을 삭제하시겠습니까?"
                    : "게시글을 삭제하려면 작성 시 입력한 비밀번호를 입력하세요."
                  }
                </p>
                {userProfile?.role !== 'Admin' && (
                  <Input
                    type="password"
                    placeholder="비밀번호"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleDeletePost();
                      }
                    }}
                  />
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    취소
                  </Button>
                  <Button variant="destructive" onClick={handleDeletePost}>
                    삭제
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </nav>

      {/* Posts */}
      <div className="container mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 게시글이 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">
                첫 번째 게시글을 작성해보세요!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className={`${getIndentClass(post.depth)} hover:bg-thread-hover transition-colors ${
                  post.depth > 0 ? 'border-l-4 border-l-thread-border' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {post.title && (
                        <CardTitle 
                          className="text-lg mb-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => {
                            incrementViewCount(post.id);
                            if (post.parent_id === null) {
                              navigate(`/board?parent=${post.id}`);
                            }
                          }}
                        >
                          {post.title}
                        </CardTitle>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{post.author_name}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.view_count}
                        </div>
                        {post.reply_count > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.reply_count}
                          </div>
                        )}
                      </div>
                    </div>
                     {isLoggedIn ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReplyDialog(post.id)}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        댓글
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="opacity-50"
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        댓글 (로그인 필요)
                      </Button>
                    )}
                    {userProfile?.role === 'Admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(post.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;