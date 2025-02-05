import '@ant-design/v5-patch-for-react-19';

export const metadata = {
  title: "Admin Dashboard",
  description: "Vin Shuttle Admin Dashboard",
};

export default function PageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
