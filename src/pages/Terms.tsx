import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-foreground">
              HQ-Tech
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">이용약관</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">제 1 장 총 칙</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">제 1 조 (목적)</h3>
            <p className="text-muted-foreground">
              1. 본 약관은 주식회사 에이치큐테크(이하 "회사"라 함)가 제공하는 서비스의 이용과 관련하여 회사와 회원 사이에 발생하는 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 2 조 (용어의 정의)</h3>
            <p className="text-muted-foreground mb-3">본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>주식회사 에이치큐테크 온라인 서비스(이하 "서비스"라 함): 회사에서 온라인을 통해 직접 운영하는 웹서비스 일체를 의미합니다.</li>
              <li>주식회사 에이치큐테크 온라인 통합회원 (이하 "회원"이라 함): 회사에서 제공하는 온라인 서비스를 통해 본 약관에 동의하고 정해진 가입 절차에 따라 가입하여 정상적으로 서비스를 이용할 수 있는 권한을 부여받은 고객을 말합니다.</li>
              <li>주식회사 에이치큐테크 온라인 포인트 (이하 "포인트"라 함): 회사에서 제공하는 온라인 서비스를 이용하는 과정에서 적립, 사용, 할인, 이벤트 참여 등에 사용 가능한 전반적인 고객 서비스 프로그램에 사용되는 포인트를 말합니다.</li>
              <li>주식회사 에이치큐테크 온라인 쿠폰 (이하 "쿠폰"이라 함): 회사에서 제공하는 서비스 중에서 온라인에서 사용 가능한 쿠폰을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">제 2 장 회원의 가입 및 관리</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">제 3 조 (회원가입절차)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회원이 본 약관을 읽고 "동의" 버튼을 누르거나 "확인" 등에 체크하는 방법을 취한 경우 본 약관에 동의한 것으로 간주합니다.</li>
              <li>회사의 회원가입을 통해 회원가입이 가능합니다. 이 때 회사는 회원가입을 위해 필요한 정보를 요구할 수 있으며, 회사의 개인정보에 대한 정책은 개인정보 처리방침에서 확인할 수 있습니다.</li>
              <li>회사는 기술적인 이유나 정책 등의 이유로 회원 가입신청을 보류할 수 있습니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 4 조 (회원 가입의 거절)</h3>
            <p className="text-muted-foreground mb-3">1. 회사는 아래 각 호에 해당하는 경우에는 회원등록을 거절할 수 있습니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>가입신청서의 내용을 허위로 기재하여 가입신청을 하는 경우</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 5 조 (회원의 접속 정보 관리)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회원은 서비스 이용을 위한 회원 ID, 비밀번호의 관리에 대한 책임은 모두 회원에게 있습니다.</li>
              <li>회원 본인 ID 의 제 3 자에 의한 부정사용 등 회원의 고의∙과실로 인해 발생하는 모든 불이익에 대한 책임을 부담합니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 6 조 (회원정보의 변경)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회원은 가입 정보를 허위로 정보를 기입해서는 안되고, 등록된 정보는 항상 정확한 최신정보가 유지될 수 있도록 관리하여야 합니다.</li>
              <li>회사는 회원이 온/오프라인 이벤트에 참여하거나 상품 구매 또는 프로모션을 위해 제출한 개인정보를 보유할 수 있으며, 해당 정보를 회원이 가입 시에 입력한 회원의 정보에 추가 또는 수정할 수 있습니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 7 조 (회원 탈퇴)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회원은 언제든지 통합 회원 웹사이트의 마이페이지를 통해 회원 탈퇴를 요청할 수 있습니다.</li>
              <li>회원 탈퇴 후에도 서비스 분쟁 시의 대응을 위해 1 년간 개인 정보가 분리 보관되며, 만약 서비스를 다시 이용하고 싶으실 경우 회사 고객센터로 문의하여 주십시오.</li>
              <li>회원 탈퇴 신청하면 법률이 정하는 바에 따라 처리하며, 회원의 다음 정보가 일괄 파기되며, 해당 정보는 복구가 불가능합니다.
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>회원 가입시 입력한 정보: 이메일, 휴대폰 번호, 등</li>
                  <li>서비스 이용 시 누적된 혜택: 쿠폰, 포인트 등</li>
                  <li>서비스 이용기록: 구매 내역, 이벤트 참여 내역, 상담 내역 등</li>
                </ul>
              </li>
              <li>탈퇴 이후에도 공개형 게시판에 등록된 게시물은 삭제되지 않습니다. 만약 해당 게시물들을 삭제하길 원하실 경우 탈퇴 이전에 삭제를 해주십시오.</li>
              <li>만약 포인트의 적립 원천이 되는 행위의 취소로 인해 마이너스 포인트가 발생할 경우, 해당 포인트에 해당하는 금액을 변제하기 전까지는 탈퇴가 불가능할 수 있습니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 8 조 (회원 자격의 상실)</h3>
            <p className="text-muted-foreground mb-3">1. 회사는 회원이 다음 각 호의 하나에 해당하는 행위를 하였을 경우 회원에 대한 통보 없이 회원 자격을 상실시킬 수 있습니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>가입 신청 시에 허위 내용을 등록한 경우</li>
              <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자거래질서를 위협하는 경우</li>
              <li>서비스를 이용하여 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
              <li>기타 회사가 판단하기에 회원 자격을 상실시킬 사유가 있다고 판단되는 경우</li>
            </ul>
            <p className="text-muted-foreground mt-3">2. 회원 자격을 상실한 이후에는 이에 대해서 회사는 어떠한 책임도 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">제 3 장 서비스 이용</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">제 9 조 (서비스 이용 계약의 성립)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>서비스 이용 계약은 서비스를 이용하고자 하는 자(이하 "이용신청자"라 함)의 이용신청을 회사가 승낙함으로써 성립합니다.</li>
              <li>회사는 이용신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 10 조 (서비스의 제공 및 변경)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사는 회원에게 아래와 같은 서비스를 제공합니다.
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>제품 판매 서비스</li>
                  <li>기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
                </ul>
              </li>
              <li>회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 11 조 (서비스의 중단)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 회원 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사에 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
              <li>사업종목의 전환, 사업의 포기, 업체간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 회사는 제8조에 정한 방법으로 회원에게 통지하고 당초 회사에서 제시한 조건에 따라 소비자에게 보상합니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 12 조 (정보의 제공 및 광고의 게재)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사는 회원이 서비스 이용 중 필요하다고 인정되는 다양한 정보를 공지사항이나 전자우편 등의 방법으로 회원에게 제공할 수 있습니다. 다만, 회원은 관련법에 따른 거래관련 정보 및 고객문의 등에 대한 답변 등을 제외하고는 언제든지 전자우편에 대해서 수신 거절을 할 수 있습니다.</li>
              <li>제1항의 정보를 전화 및 모사전송기기에 의하여 전송하려고 하는 경우에는 회원의 사전 동의를 받아서 전송합니다. 다만, 회원의 거래관련 정보 및 고객문의 등에 대한 회신에 있어서는 제외됩니다.</li>
              <li>회사는 서비스의 운영과 관련하여 서비스 화면, 홈페이지, 전자우편 등에 광고를 게재할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">제 4 장 포인트 및 쿠폰</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">제 13 조 (포인트의 적립 및 사용)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사는 회원의 서비스 이용에 대한 보상으로 포인트를 지급할 수 있으며, 포인트의 적립 기준 및 사용 방법은 회사의 정책에 따릅니다.</li>
              <li>포인트는 현금으로 환급되지 않으며, 회원 탈퇴 시 자동으로 소멸됩니다.</li>
              <li>포인트의 유효기간은 회사의 정책에 따라 변경될 수 있으며, 유효기간이 지난 포인트는 자동으로 소멸됩니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 14 조 (쿠폰의 발급 및 사용)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사는 이벤트 등의 목적으로 회원에게 쿠폰을 발급할 수 있습니다.</li>
              <li>쿠폰의 사용 조건, 유효기간 등은 각 쿠폰에 명시된 바에 따릅니다.</li>
              <li>쿠폰은 현금으로 환급되지 않으며, 타인에게 양도할 수 없습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">제 5 장 책임 및 의무</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">제 15 조 (회사의 의무)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.</li>
              <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 회원의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 갖추어야 합니다.</li>
              <li>회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 16 조 (회원의 의무)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회원은 다음 행위를 하여서는 안 됩니다.
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보도용</li>
                  <li>회사에 게시된 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 17 조 (저작권의 귀속 및 이용제한)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
              <li>회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">제 6 장 기타</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">제 18 조 (분쟁해결)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
              <li>회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 회원에게 그 사유와 처리일정을 즉시 통보해 드립니다.</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">제 19 조 (재판권 및 준거법)</h3>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>이 약관에 명시되지 않은 사항은 전자거래기본법, 전자서명법, 전자상거래 등에서의 소비자보호에 관한 법률, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령의 규정과 일반 상관례에 따릅니다.</li>
              <li>서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.</li>
            </ol>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground">
              <strong>부칙</strong><br />
              본 약관은 2025년 10월 13일부터 적용됩니다.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-12">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 HQ-Tech Co.,Ltd All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
