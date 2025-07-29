export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보 처리방침</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 개인정보의 처리 목적</h2>
            <p className="text-gray-700 leading-relaxed">
              LVUP EDU는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-700">
              <li>회원 가입 및 관리</li>
              <li>서비스 제공에 관한 계약 이행</li>
              <li>고객 상담 및 불만처리</li>
              <li>마케팅 및 광고에의 활용</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 개인정보의 처리 및 보유기간</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 개인정보의 제3자 제공</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 정보주체의 권리·의무 및 행사방법</h2>
            <p className="text-gray-700 leading-relaxed">
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-700">
              <li>개인정보 처리정지 요구</li>
              <li>개인정보 열람요구</li>
              <li>개인정보 정정·삭제요구</li>
              <li>개인정보 처리정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>개인정보 보호책임자:</strong> LVUP EDU 운영팀<br/>
                <strong>연락처:</strong> privacy@lvupedu.com<br/>
                <strong>전화:</strong> 02-1234-5678
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            본 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}