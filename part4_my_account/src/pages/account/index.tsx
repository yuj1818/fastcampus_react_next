import dynamic from 'next/dynamic';
import withAuth from '@shared/hocs/withAuth';
const Transactions = dynamic(() => import('@components/account/Transactions'));
const MonthlyChart = dynamic(() => import('@components/account/MonthlyChart'));

function AccountPage() {
  return (
    <div>
      <MonthlyChart chartData={generateMonthlyChartData()} />
      <Transactions />
    </div>
  );
}

function generateMonthlyChartData() {
  return [
    '2025-01-31',
    '2025-02-28',
    '2025-03-31',
    '2025-04-30',
    '2025-05-31',
    '2025-06-30',
    '2025-07-31',
    '2025-08-31',
    '2025-09-30',
    '2025-10-31',
    '2025-11-30',
    '2025-12-31',
  ].map((date) => ({
    date,
    balance: Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000,
  }));
}

export default withAuth(AccountPage);
