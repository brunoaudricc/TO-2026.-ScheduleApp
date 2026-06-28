import "./globals.css";
import Header from "./Header";

export const metadata = {
  title: "Gerenciador de Grade Horária Universitária",
  description: "Sistema inteligente para montagem de grade horária universitária baseado em restrições de conflitos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-container">
          <Header />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
