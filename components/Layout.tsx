import Head from "next/head";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>housecheck.nyc</title>
        <meta name="description" content="NYC housing data search" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏠</text></svg>"
        />
        <meta name="theme-color" content="#000000" />
      </Head>
      <main className="flex flex-col justify-between p-4 md:p-8 w-full">
        {children}
      </main>
    </>
  );
}
