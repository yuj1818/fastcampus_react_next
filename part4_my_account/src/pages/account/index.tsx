import dynamic from 'next/dynamic';
import withAuth from '@shared/hocs/withAuth';
import Spacing from '@shared/Spacing';
const Transactions = dynamic(() => import('@components/account/Transactions'));
const MonthlyChart = dynamic(() => import('@components/account/MonthlyChart'));
const CategoryPieChart = dynamic(
  () => import('@components/account/CategoryPieChart'),
);
const PiggybankRow = dynamic(() => import('@components/account/PiggybankRow'));

function AccountPage() {
  return (
    <div>
      <MonthlyChart chartData={generateMonthlyChartData()} />
      <Spacing
        size={8}
        backgroundColor="gray100"
        style={{ margin: '20px 0' }}
      />
      <PiggybankRow />
      <Spacing
        size={8}
        backgroundColor="gray100"
        style={{ margin: '20px 0' }}
      />
      <CategoryPieChart chartData={generatePieChartData()} />
      <Spacing
        size={8}
        backgroundColor="gray100"
        style={{ margin: '20px 0' }}
      />
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

function generatePieChartData() {
  return ['카페', '쇼핑', '여행', '커피'].map((label) => ({
    label,
    amount: Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000,
  }));
}

export default withAuth(AccountPage);
