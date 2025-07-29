export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              이 약관은 LVUP EDU(이하 "회사")가 제공하는 온라인 교육 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원간의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (정의)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>"서비스"</strong>란 회사가 제공하는 모든 온라인 교육 서비스를 의미합니다.</li>
              <li><strong>"회원"</strong>이란 회사와 서비스 이용계약을 체결하고 이용자 아이디(ID)를 부여받은 자를 의미합니다.</li>
              <li><strong>"아이디(ID)"</strong>란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
              <li><strong>"비밀번호"</strong>란 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <p className="text-gray-700 leading-relaxed">
              이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다. 회사는 합리적인 사유가 발생할 경우에는 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된 약관의 내용과 시행일을 정하여, 그 시행일로부터 최소 7일 이전에 공지합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (서비스의 제공 및 변경)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 다음과 같은 업무를 수행합니다.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>온라인 교육 콘텐츠 제공</li>
              <li>학습 진도 관리 및 수료증 발급</li>
              <li>회원 상담 및 고객지원</li>
              <li>기타 회사가 정하는 업무</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (서비스 이용계약의 성립)</h2>
            <p className="text-gray-700 leading-relaxed">
              서비스 이용계약은 이용자의 이용신청에 대하여 회사의 승낙으로 성립됩니다. 회사는 이용신청자가 다음 각 호에 해당하는 경우에는 승낙을 하지 않을 수 있습니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-700 space-y-2">
              <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
              <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
              <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
              <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (회원정보의 변경)</h2>
            <p className="text-gray-700 leading-relaxed">
              회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 다만, 서비스 관리를 위해 필요한 실명, 아이디 등은 수정이 불가능합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (개인정보보호 의무)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 정보통신망법 등 관계 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (회원의 의무)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회원은 다음 각 호의 행위를 하여서는 안 됩니다.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>타인의 정보도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 회사에 공개 또는 게시하는 행위</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            본 이용약관은 2024년 1월 1일부터 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}