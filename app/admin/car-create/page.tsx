import { getServerSession } from 'next-auth/next'
import authOptions from '@/app/api/auth/[...nextauth]/route'
import { notFound } from 'next/navigation'
import CarCreateForm from '@/components/CarCreateForm'
import { PageHeader } from '@/components/PageHeaders'
import { PageContainer } from '@/components/ui/PageContainer'

export default async function CarCreatePage() {
  const session = await getServerSession(authOptions)
  const currentDate = '2025-02-19 16:14:51'
  const userName = 'Jonh-Mat'

  if (!session?.user || session.user.role !== 'ADMIN') {
    return notFound()
  }

  return (
    <PageContainer className="p-0">
      <PageHeader
        title="Create New Car"
        username={userName}
        currentDate={currentDate}
      />

      <div className="p-6 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm dark:shadow-navy-900/50 border border-gray-200 dark:border-navy-700">
            <div className="p-6">
              <CarCreateForm />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
