export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex flex-col justify-between p-4 md:p-8 w-full">
        {children}
      </main>
    </>
  );
}
