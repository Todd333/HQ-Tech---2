import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, MessageSquare, Clock, Users, Lock, Mail, Key, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import gampHeroImage from "@/assets/operator-manufacturing-facility-as-550323556-1200x627.webp";
import landingHeroImage from "@/assets/operator-manufacturing-facility-as-550323556-1200x627.webp";

const Index = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔍 Index: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Index: Auth state changed', { event, session: session ? 'exists' : 'null', userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    console.log('🔍 Index: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📋 Index: Initial session check', { 
        session: session ? 'exists' : 'null', 
        userId: session?.user?.id,
        error: error?.message 
      });
      
      // 세션이 있지만 에러가 있는 경우 세션을 클리어
      if (error && error.message.includes('session_not_found')) {
        console.log('🧹 Index: Clearing invalid session');
        setSession(null);
        setUser(null);
        setUserProfile(null);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('👤 Index: Fetching user profile for:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('👤 Index: Profile fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // 세션이 없어도 정상적으로 처리되도록 수정
      await supabase.auth.signOut();
      
      // 로컬 상태 초기화
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error: any) {
      // 세션이 없는 경우에도 성공으로 처리
      console.log('Logout attempt:', error);
      
      // 로컬 상태 초기화
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
    }
  };

  // Security key request handler commented out since form is hidden
  /*
  const handleSecurityKeyRequest = async (e: React.FormEvent) => {
    ... handler code removed since security key request form is hidden ...
  };
  */

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">주식회사 에이치큐테크</div>
          <div className="flex gap-4 items-center">
            <Link to="/board">
              <Button variant="outline">게시판</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {userProfile?.display_name || user.email?.split('@')[0] || '사용자'}
                    {userProfile?.role && (
                      <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {userProfile.role}
                      </span>
                    )}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-primary leading-tight">
                Computerized System Validation (CSV)
              </h1>
              <p className="text-2xl font-semibold text-muted-foreground mb-4">
                FDA, EMA, MHRA 및 기타 기관의 기대에 부응하는 맞춤형 위험 기반 검증 접근 방식입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/board">
                  <Button variant="hero" size="lg">
                    게시판 바로가기
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg">
                      자세히 알아보기
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Computer System Validation (CSV)</DialogTitle>
                      <DialogDescription>
                        시스템의 잠재력을 최대한 활용하세요
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 text-sm">
                      <section>
                        <h2 className="text-xl font-bold mb-3">CSV 개요</h2>
                        <p className="text-muted-foreground mb-4">
                          Computer System Validation (CSV)은 컴퓨터 시스템이 규제 요구 사항을 충족하고 완벽하게 작동하도록 보장하는 데 중요합니다. 
                          포괄적인 CSV 서비스에는 다음이 포함됩니다:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                          <li><strong>Computer System Validation:</strong> 21 CFR Part 11, Annex 11, ASTM E2500, ISO 9001:2015와 같은 표준을 준수하기 위한 컴퓨터 시스템의 상세한 검증</li>
                          <li><strong>Pharmaceutical Validation:</strong> 데이터 무결성 및 시스템 신뢰성을 보장하기 위한 제약 산업 맞춤형 솔루션</li>
                          <li><strong>GxP Systems Validation:</strong> 산업 규정 준수를 보장하기 위한 GxP(Good Practice) 가이드라인에 따른 시스템 검증 전문 지식</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className="text-xl font-bold mb-3">CSV란 무엇인가?</h2>
                        <p className="text-muted-foreground mb-4">
                          Computer System Validation (CSV)은 컴퓨터화된 시스템이 생명 과학 산업을 위해 설정된 규제 요구 사항을 안정적으로 수행하고 충족하도록 보장하는 
                          위험 기반의 구조화된 프로세스입니다. CSV는 의약품, 의료 기기 및 생명공학 제품의 생산, 보관 및 유통과 관련된 시스템에 중요합니다. 
                          시스템이 정의된 사양을 충족하고 의도한 대로 작동함을 확인하기 위한 포괄적인 테스트, 문서화 및 위험 평가가 포함됩니다.
                        </p>
                        <p className="text-muted-foreground mb-4">
                          CSV는 컴퓨터화된 시스템이 FDA의 21 CFR Part 11, EU Annex 11 및 기타 GxP 규정과 같은 글로벌 규제 표준을 준수하도록 보장하여 
                          조직이 데이터 무결성을 보호하고 운영 제어를 유지하며 규정 준수를 달성하도록 돕습니다.
                        </p>
                      </section>

                      <section>
                        <h2 className="text-xl font-bold mb-3">생명 과학 분야에서 CSV가 중요한 이유</h2>
                        <p className="text-muted-foreground mb-4">
                          생명 과학 분야에서 컴퓨터화된 시스템의 검증은 규제 준수를 유지하고 제품 품질을 보장하는 데 중요합니다. 
                          이러한 시스템을 제대로 검증하지 않으면 규제 벌금, 제품 리콜 및 평판 손상을 포함한 심각한 결과를 초래할 수 있습니다.
                        </p>
                        
                        <h3 className="text-lg font-semibold mb-2 mt-4">• 규제 준수</h3>
                        <p className="text-muted-foreground mb-3">
                          FDA, EMA 및 기타 글로벌 규제 요구 사항 준수를 보장하여 비준수 위험을 줄입니다.
                        </p>

                        <h3 className="text-lg font-semibold mb-2">• 데이터 무결성</h3>
                        <p className="text-muted-foreground mb-3">
                          시스템 수명 주기 전반에 걸쳐 데이터의 정확성, 일관성 및 신뢰성을 유지하여 신뢰와 추적성을 지원합니다.
                        </p>

                        <h3 className="text-lg font-semibold mb-2">• 운영 효율성</h3>
                        <p className="text-muted-foreground mb-3">
                          검증된 시스템은 오류 없이 작동하도록 최적화되어 다운타임을 줄이고 규제 프로세스의 전반적인 효율성을 향상시킵니다.
                        </p>

                        <h3 className="text-lg font-semibold mb-2">• 위험 완화</h3>
                        <p className="text-muted-foreground mb-3">
                          적절한 CSV는 시스템 장애, 데이터 침해 및 비준수 위험을 줄여 지속적이고 안전한 운영을 보장합니다.
                        </p>
                      </section>

                      <section>
                        <h2 className="text-xl font-bold mb-3">CSV 접근 방식</h2>
                        <p className="text-muted-foreground mb-4">
                          우리의 Computer System Validation (CSV) 접근 방식은 체계적이며 귀하의 요구에 맞게 조정됩니다:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                          <li><strong>검색 및 계획:</strong> 시스템을 평가하고, 규정 준수 요구 사항을 이해하며, 명확한 전략을 개요합니다.</li>
                          <li><strong>위험 기반 전략:</strong> 중요한 시스템을 우선시하여 컴퓨터 및 데이터 안전과 규정 준수에 가장 큰 영향을 미치는 영역에 집중합니다.</li>
                          <li><strong>문서화 및 테스트:</strong> 포괄적인 CSV 프로토콜을 개발하고 시스템이 모든 운영 및 규제 표준을 충족하는지 확인하기 위해 테스트(IQ, OQ, PQ)를 실행합니다.</li>
                          <li><strong>지속적인 모니터링:</strong> 검증 후 진화하는 규정과의 규정 준수를 유지하기 위해 지속적인 컴퓨터 모니터링 및 업데이트를 제공합니다.</li>
                        </ol>
                        <p className="text-muted-foreground">
                          우리의 목표는 효율적이고 규정을 준수하며 미래 지향적인 CSV 서비스를 제공하여 규제 요구 사항을 앞서가도록 하는 것입니다.
                        </p>
                      </section>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-hover/20 rounded-3xl blur-3xl"></div>
              <img 
                src={landingHeroImage} 
                alt="주식회사 에이치큐테크 메인 화면" 
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              제약 및 바이오 기업의 GxP 소프트웨어 검증 서비스
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">FDA, EMA, MHRA 준수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  HQ-Tech는 귀하의 검증이 FDA, EMA, MHRA 및 기타 기관 규정을 준수하도록 보장합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">표준 검증 템플릿</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  우리는 검증 계획, 사용자 요구 사항, 검증 프로토콜, 검증 보고서 등 소프트웨어 검증 템플릿의 표준 세트를 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">입증된 검증 방법론</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  당사 전문가는 FDA, EMA, MHRA 및 기타 기관의 기대에 부응하기 위해 맞춤형 위험 기반 검증 접근 방식을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">CSV 및 CSA 전문 지식</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  귀하의 검증 프로젝트를 정해진 시간 내에 완료할 수 있는 숙련된 소프트웨어 검증 관리자와 엔지니어입니다.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">검사 준비 문서</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  우리는 고객에게 검증 결과물이 업계 표준을 충족하고 고객 감사 및 규제 검사의 면밀한 조사를 견뎌낼 것이라는 확신을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">교육 및 지속적인 지원</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  우리는 귀사 직원에게 소프트웨어 품질 보증 SOP와 검증 템플릿의 사용 방법을 교육하고, 검증 프로젝트 전반에 걸쳐 지속적인 지원을 제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Key Request Section - Hidden as requested */}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="text-left space-y-1">
              <p className="text-muted-foreground text-sm font-semibold">회사명: 주식회사 에이치큐테크 사업자등록번호: 199-81-03835 대표자: 조형래</p>
              <p className="text-muted-foreground text-sm font-semibold">주소: 경기도 화성시 병점노을4로 19(골든스퀘어 원), 1315</p>
              <p className="text-muted-foreground text-sm font-semibold">Tel: 031-8067-7870 / Fax: 0504-405-1742</p>
              <p className="text-muted-foreground font-bold text-sm mt-2">
                © 2025 HQ-Tech Co.,Ltd Allright reserved
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors font-semibold">
                    이용약관
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">이용약관</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-sm">
                    <section>
                      <h2 className="text-xl font-bold mb-3">제 1 장 총 칙</h2>
                      
                      <h3 className="text-lg font-semibold mb-2">제 1 조 (목적)</h3>
                      <p className="text-muted-foreground mb-4">
                        1. 본 약관은 주식회사 에이치큐테크(이하 "회사"라 함)가 제공하는 서비스의 이용과 관련하여 회사와 회원 사이에 발생하는 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                      </p>

                      <h3 className="text-lg font-semibold mb-2">제 2 조 (용어의 정의)</h3>
                      <p className="text-muted-foreground mb-2">본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>주식회사 에이치큐테크 온라인 서비스(이하 "서비스"라 함): 회사에서 온라인을 통해 직접 운영하는 웹서비스 일체를 의미합니다.</li>
                        <li>주식회사 에이치큐테크 온라인 통합회원 (이하 "회원"이라 함): 회사에서 제공하는 온라인 서비스를 통해 본 약관에 동의하고 정해진 가입 절차에 따라 가입하여 정상적으로 서비스를 이용할 수 있는 권한을 부여받은 고객을 말합니다.</li>
                        <li>주식회사 에이치큐테크 온라인 포인트 (이하 "포인트"라 함): 회사에서 제공하는 온라인 서비스를 이용하는 과정에서 적립, 사용, 할인, 이벤트 참여 등에 사용 가능한 전반적인 고객 서비스 프로그램에 사용되는 포인트를 말합니다.</li>
                        <li>주식회사 에이치큐테크 온라인 쿠폰 (이하 "쿠폰"이라 함): 회사에서 제공하는 서비스 중에서 온라인에서 사용 가능한 쿠폰을 말합니다.</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">제 2 장 회원의 가입 및 관리</h2>
                      
                      <h3 className="text-lg font-semibold mb-2">제 3 조 (회원가입절차)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회원이 본 약관을 읽고 "동의" 버튼을 누르거나 "확인" 등에 체크하는 방법을 취한 경우 본 약관에 동의한 것으로 간주합니다.</li>
                        <li>회사의 회원가입을 통해 회원가입이 가능합니다. 이 때 회사는 회원가입을 위해 필요한 정보를 요구할 수 있으며, 회사의 개인정보에 대한 정책은 개인정보 처리방침에서 확인할 수 있습니다.</li>
                        <li>회사는 기술적인 이유나 정책 등의 이유로 회원 가입신청을 보류할 수 있습니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 4 조 (회원 가입의 거절)</h3>
                      <p className="text-muted-foreground mb-2">1. 회사는 아래 각 호에 해당하는 경우에는 회원등록을 거절할 수 있습니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>가입신청서의 내용을 허위로 기재하여 가입신청을 하는 경우</li>
                      </ul>

                      <h3 className="text-lg font-semibold mb-2">제 5 조 (회원의 접속 정보 관리)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회원은 서비스 이용을 위한 회원 ID, 비밀번호의 관리에 대한 책임은 모두 회원에게 있습니다.</li>
                        <li>회원 본인 ID 의 제 3 자에 의한 부정사용 등 회원의 고의∙과실로 인해 발생하는 모든 불이익에 대한 책임을 부담합니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 6 조 (회원정보의 변경)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회원은 가입 정보를 허위로 정보를 기입해서는 안되고, 등록된 정보는 항상 정확한 최신정보가 유지될 수 있도록 관리하여야 합니다.</li>
                        <li>회사는 회원이 온/오프라인 이벤트에 참여하거나 상품 구매 또는 프로모션을 위해 제출한 개인정보를 보유할 수 있으며, 해당 정보를 회원이 가입 시에 입력한 회원의 정보에 추가 또는 수정할 수 있습니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 7 조 (회원 탈퇴)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회원은 언제든지 통합 회원 웹사이트의 마이페이지를 통해 회원 탈퇴를 요청할 수 있습니다.</li>
                        <li>회원 탈퇴 후에도 서비스 분쟁 시의 대응을 위해 1 년간 개인 정보가 분리 보관되며, 만약 서비스를 다시 이용하고 싶으실 경우 회사 고객센터로 문의하여 주십시오.</li>
                        <li>회원 탈퇴 신청하면 법률이 정하는 바에 따라 처리하며, 회원의 다음 정보가 일괄 파기되며, 해당 정보는 복구가 불가능합니다.</li>
                        <li>탈퇴 이후에도 공개형 게시판에 등록된 게시물은 삭제되지 않습니다. 만약 해당 게시물들을 삭제하길 원하실 경우 탈퇴 이전에 삭제를 해주십시오.</li>
                        <li>만약 포인트의 적립 원천이 되는 행위의 취소로 인해 마이너스 포인트가 발생할 경우, 해당 포인트에 해당하는 금액을 변제하기 전까지는 탈퇴가 불가능할 수 있습니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 8 조 (회원 자격의 상실)</h3>
                      <p className="text-muted-foreground mb-2">1. 회사는 회원이 다음 각 호의 하나에 해당하는 행위를 하였을 경우 회원에 대한 통보 없이 회원 자격을 상실시킬 수 있습니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-2">
                        <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                        <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자거래질서를 위협하는 경우</li>
                        <li>서비스를 이용하여 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                        <li>기타 회사가 판단하기에 회원 자격을 상실시킬 사유가 있다고 판단되는 경우</li>
                      </ul>
                      <p className="text-muted-foreground mb-4">2. 회원 자격을 상실한 이후에는 이에 대해서 회사는 어떠한 책임도 지지 않습니다.</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">제 3 장 서비스 이용</h2>
                      
                      <h3 className="text-lg font-semibold mb-2">제 9 조 (서비스 이용 계약의 성립)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>서비스 이용 계약은 서비스를 이용하고자 하는 자(이하 "이용신청자"라 함)의 이용신청을 회사가 승낙함으로써 성립합니다.</li>
                        <li>회사는 이용신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 10 조 (서비스의 제공 및 변경)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사는 회원에게 제품 판매 서비스 및 기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스를 제공합니다.</li>
                        <li>회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 11 조 (서비스의 중단)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                        <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 회원 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사에 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
                        <li>사업종목의 전환, 사업의 포기, 업체간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 회사는 제8조에 정한 방법으로 회원에게 통지하고 당초 회사에서 제시한 조건에 따라 소비자에게 보상합니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 12 조 (정보의 제공 및 광고의 게재)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사는 회원이 서비스 이용 중 필요하다고 인정되는 다양한 정보를 공지사항이나 전자우편 등의 방법으로 회원에게 제공할 수 있습니다.</li>
                        <li>제1항의 정보를 전화 및 모사전송기기에 의하여 전송하려고 하는 경우에는 회원의 사전 동의를 받아서 전송합니다.</li>
                        <li>회사는 서비스의 운영과 관련하여 서비스 화면, 홈페이지, 전자우편 등에 광고를 게재할 수 있습니다.</li>
                      </ol>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">제 4 장 포인트 및 쿠폰</h2>
                      
                      <h3 className="text-lg font-semibold mb-2">제 13 조 (포인트의 적립 및 사용)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사는 회원의 서비스 이용에 대한 보상으로 포인트를 지급할 수 있으며, 포인트의 적립 기준 및 사용 방법은 회사의 정책에 따릅니다.</li>
                        <li>포인트는 현금으로 환급되지 않으며, 회원 탈퇴 시 자동으로 소멸됩니다.</li>
                        <li>포인트의 유효기간은 회사의 정책에 따라 변경될 수 있으며, 유효기간이 지난 포인트는 자동으로 소멸됩니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 14 조 (쿠폰의 발급 및 사용)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사는 이벤트 등의 목적으로 회원에게 쿠폰을 발급할 수 있습니다.</li>
                        <li>쿠폰의 사용 조건, 유효기간 등은 각 쿠폰에 명시된 바에 따릅니다.</li>
                        <li>쿠폰은 현금으로 환급되지 않으며, 타인에게 양도할 수 없습니다.</li>
                      </ol>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">제 5 장 책임 및 의무</h2>
                      
                      <h3 className="text-lg font-semibold mb-2">제 15 조 (회사의 의무)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.</li>
                        <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 회원의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 갖추어야 합니다.</li>
                        <li>회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 16 조 (회원의 의무)</h3>
                      <p className="text-muted-foreground mb-2">회원은 다음 행위를 하여서는 안 됩니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>신청 또는 변경 시 허위내용의 등록</li>
                        <li>타인의 정보도용</li>
                        <li>회사에 게시된 정보의 변경</li>
                        <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                        <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                        <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                        <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                      </ul>

                      <h3 className="text-lg font-semibold mb-2">제 17 조 (저작권의 귀속 및 이용제한)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
                        <li>회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
                      </ol>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">제 6 장 기타</h2>
                      
                      <h3 className="text-lg font-semibold mb-2">제 18 조 (분쟁해결)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
                        <li>회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 회원에게 그 사유와 처리일정을 즉시 통보해 드립니다.</li>
                      </ol>

                      <h3 className="text-lg font-semibold mb-2">제 19 조 (재판권 및 준거법)</h3>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4 mb-4">
                        <li>이 약관에 명시되지 않은 사항은 전자거래기본법, 전자서명법, 전자상거래 등에서의 소비자보호에 관한 법률, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령의 규정과 일반 상관례에 따릅니다.</li>
                        <li>서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.</li>
                      </ol>
                    </section>

                    <section className="pt-6 border-t border-border">
                      <p className="text-muted-foreground">
                        <strong>부칙</strong><br />
                        본 약관은 2025년 10월 13일부터 적용됩니다.
                      </p>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
              <span className="text-muted-foreground">|</span>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors font-semibold">
                    개인정보처리방침
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">개인정보취급방침</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-sm">
                    <p className="text-muted-foreground leading-relaxed">
                      주식회사 에이치큐테크는 (이하 '회사'는) 고객님의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다. 회사는 개인정보취급방침을 통하여 고객님께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다. 회사는 개인정보취급방침을 개정하는 경우 웹사이트 공지사항(또는 개별공지)을 통하여 공지할 것입니다. 본 방침은 : 2025년 10월 13일 부터 시행됩니다.
                    </p>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 수집하는 개인정보 항목</h3>
                      <p className="text-muted-foreground mb-2">회사는 회원가입, 상담, 서비스 신청 등등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>수집항목 : 이름, 비밀번호, 휴대전화번호, 이메일, 회사명, 부서, 회사전화번호, 접속 로그, 접속 IP 정보, 프로젝트의뢰정보</li>
                        <li>개인정보 수집방법 : 홈페이지(상담게시판,프로젝트의뢰)</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 개인정보의 수집 및 이용목적</h3>
                      <p className="text-muted-foreground mb-2">회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>서비스 제공에 필요한 질문·답변, 견적의뢰, 자료실, 공지사항 등 회원 서비스 제공</li>
                        <li>기타 프로젝트의뢰에 따른 요구정보</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 개인정보의 보유 및 이용기간</h3>
                      <p className="text-muted-foreground mb-3">원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.</p>
                      <div className="space-y-2 text-muted-foreground ml-4">
                        <p>• 보존 항목 : 이름, 연락처, 소속, 직책</p>
                        <p>• 보존 근거 : 프로젝트의뢰에따른자료저장</p>
                        <p>• 보존 기간 : 영구보존또는일정기간후삭제</p>
                      </div>
                      <p className="text-muted-foreground mt-3 mb-3">그리고 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
                      <div className="space-y-2 text-muted-foreground ml-4">
                        <p>• 보존 항목 : 휴대전화번호, 이메일, 회사명, 부서, 회사전화번호, 접속 로그, 접속 IP 정보, 프로젝트의뢰정보</p>
                        <p>• 보존 근거 : 프로젝트의뢰에따른자료저장</p>
                        <p>• 보존 기간 : 영구보존또는일정기간후삭제</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 개인정보의 파기절차 및 방법</h3>
                      <p className="text-muted-foreground mb-3">회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">• 파기절차</h4>
                          <p className="text-muted-foreground ml-4">회원님이 회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기되어집니다. 별도 DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는 보유되어지는 이외의 다른 목적으로 이용되지 않습니다.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">• 파기방법</h4>
                          <p className="text-muted-foreground ml-4">전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 개인정보 제공</h3>
                      <p className="text-muted-foreground mb-2">회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>이용자들이 사전에 동의한 경우</li>
                        <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 수집한 개인정보의 위탁</h3>
                      <p className="text-muted-foreground">회사는 고객님의 동의없이 고객님의 정보를 외부 업체에 위탁하지 않습니다. 향후 그러한 필요가 생길 경우, 위탁 대상자와 위탁 업무 내용에 대해 고객님에게 통지하고 필요한 경우 사전 동의를 받도록 하겠습니다.</p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 이용자 및 법정대리인의 권리와 그 행사방법</h3>
                      <p className="text-muted-foreground">이용자 및 법정 대리인은 언제든지 등록되어 있는 자신의 정보를 조회할 수 있도록 요청할 수 있으며 삭제를 요청할 수 있습니다. 이용자의 개인정보 조회 및 수정을 위해서는 상담게시판의 경우 비밀번호를 입력하여 자신의 정보를 완전히 삭제하실 수 있습니다, 혹은 개인정보관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체없이 조치하겠습니다. 귀하가 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다. 프로젝트 의뢰의 경우 수집하는 개인정보의 보유 및 이용기간에 명시된 바에 따라 처리하고 그 외의 용도로 열람 또는 이용할 수 없도록 처리하고 있습니다.</p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">■ 개인정보 자동수집 장치의 설치, 운영 및 그 거부에 관한 사항</h3>
                      <p className="text-muted-foreground mb-3">회사는 귀하의 정보를 수시로 저장하고 찾아내는 '쿠키(cookie)' 등을 운용합니다. 쿠키란 센솔루션의 웹사이트를 운영하는데 이용되는 서버가 귀하의 브라우저에 보내는 아주 작은 텍스트 파일로서 귀하의 컴퓨터 하드디스크에 저장됩니다. 회사는 다음과 같은 목적을 위해 쿠키를 사용합니다.</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">▶ 쿠키 등 사용 목적</h4>
                          <p className="text-muted-foreground ml-4">방문자의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타겟 마케팅 및 개인 맞춤 서비스 제공</p>
                        </div>
                        
                        <p className="text-muted-foreground">귀하는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 귀하는 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</p>
                        
                        <div>
                          <h4 className="font-semibold mb-2">쿠키 설정 거부 방법</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>예: 쿠키 설정을 거부하는 방법으로는 회원님이 사용하시는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.</li>
                            <li>설정방법 예(인터넷 익스플로어의 경우) : 웹 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보</li>
                            <li>단, 귀하께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">개인정보에 관한 민원서비스</h3>
                      <p className="text-muted-foreground mb-3">회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보관리책임자를 지정하고 있습니다.</p>
                      <div className="space-y-1 text-muted-foreground ml-4">
                        <p>• 개인정보관리책임자 성명 : 조형래</p>
                        <p>• 전화번호 : 031-000-0000</p>
                        <p>• 이메일 : contact@hq-tech.co.kr</p>
                      </div>
                      <p className="text-muted-foreground mt-3 mb-3">귀하께서는 회사의 서비스를 이용하시며 발생하는 모든 개인정보보호 관련 민원을 개인정보관리책임자 혹은 담당부서로 신고하실 수 있습니다. 회사는 이용자들의 신고사항에 대해 신속하게 충분한 답변을 드릴 것입니다.</p>
                      <p className="text-muted-foreground mb-2">기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>개인정보침해신고센터 (www.118.or.kr/국번없이 118)</li>
                        <li>정보보호마크인증위원회 (www.eprivacy.or.kr/02-580-0533~4)</li>
                        <li>대검찰청 인터넷범죄수사센터 (http://icic.sppo.go.kr/02-3480-3600)</li>
                        <li>경찰청 사이버테러대응센터 (www.ctrc.go.kr/02-392-0330)</li>
                      </ul>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
